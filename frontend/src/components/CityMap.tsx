import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  Plus, 
  Minus, 
  Layers, 
  Activity, 
  Eye, 
  Radio, 
  Compass, 
  Flame,
  Check
} from 'lucide-react';
import { locations } from '../data';
import { 
  initialTrafficSegments, 
  initialRiskZones, 
  initialSensorNodes, 
  getTrafficColor, 
  TrafficSegment, 
  RiskZone 
} from '../trafficData';
import TimeLapsePlayer from './TimeLapsePlayer';
import { audioFx } from '../utils/audioFx';

interface CityMapProps {
  selectedLocation: string;
  onSelectLocation?: (locationId: string) => void;
  predictionResult: {
    violations: number;
    riskLevel: string;
  } | null;
  onNotification?: (msg: string) => void;
  timelineHour?: number;
  onTimelineHourChange?: (hour: number) => void;
}

const CityMap = ({ 
  selectedLocation, 
  onSelectLocation,
  predictionResult, 
  onNotification,
  timelineHour,
  onTimelineHourChange,
}: CityMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  // Layer Groups (Zero API Key, watermark-free)
  const tileLayerRef = useRef<L.LayerGroup | null>(null);
  const trafficLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);

  // States
  const [is3D, setIs3D] = useState(false);
  const [mapMode, setMapMode] = useState<'dark' | 'satellite'>('dark');
  const [showTraffic, setShowTraffic] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [trafficSegments, setTrafficSegments] = useState<TrafficSegment[]>(initialTrafficSegments);
  const [lastUpdateText, setLastUpdateText] = useState('Just now');
  const [avgSpeed, setAvgSpeed] = useState(14.8);
  const [activeSensorsCount] = useState(142);
  const [zoomLevel, setZoomLevel] = useState(15);
  const [isSimulatingLive, setIsSimulatingLive] = useState(true);

  // 24-Hour Time-Lapse active hour state
  const [internalHour, setInternalHour] = useState(18); // Default 18:00 (06:00 PM)
  const activeHour = timelineHour !== undefined ? timelineHour : internalHour;

  const handleHourChange = (newH: number | ((prev: number) => number)) => {
    const resolved = typeof newH === 'function' ? newH(activeHour) : newH;
    setInternalHour(resolved);
    onTimelineHourChange?.(resolved);
  };

  // Diurnal Poisson hour factor: peaks at 18:00 (~1.65), dips at 03:00 (~0.35)
  const getHourFactor = (h: number) => {
    const rad1 = (2 * Math.PI * (h - 7)) / 24;
    const rad2 = (2 * Math.PI * (h - 13)) / 12;
    return Math.max(0.3, Math.min(1.8, 0.9 + 0.5 * Math.sin(rad1) + 0.25 * Math.cos(rad2)));
  };
  const hourFactor = getHourFactor(activeHour);

  // Current location details
  const currentLocation = locations.find(l => l.id === selectedLocation) || locations[0];
  const baseViolations = predictionResult?.violations ?? currentLocation.predictedViolations;
  const violations = +(baseViolations * hourFactor).toFixed(1);

  // Helper to create Dark Canvas Layer Group (Zero API Key, Zero Watermark, No missing tiles)
  const createDarkTiles = () => {
    const base = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxNativeZoom: 16,
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &copy; OpenStreetMap',
        className: 'esri-dark-tiles',
      }
    );
    const reference = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      {
        maxNativeZoom: 16,
        maxZoom: 19,
        className: 'esri-ref-tiles',
      }
    );
    return L.layerGroup([base, reference]);
  };

  // Helper to create Satellite Layer Group (Zero API Key, Zero Watermark)
  const createSatelliteTiles = () => {
    const base = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxNativeZoom: 18,
        maxZoom: 19,
        attribution: '&copy; Esri &copy; Maxar, Earthstar Geographics',
        className: 'satellite-tiles',
      }
    );
    const labels = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxNativeZoom: 17,
        maxZoom: 19,
        className: 'satellite-ref-tiles',
      }
    );
    return L.layerGroup([base, labels]);
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Map Instance with zoom limits that match tile layers
    const map = L.map(mapContainerRef.current, {
      center: [currentLocation.lat, currentLocation.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: true,
      minZoom: 11,
      maxZoom: 19,
    });

    mapInstanceRef.current = map;

    // Default Tile Layer Group: Watermark-free Esri Dark Vector Canvas
    const darkTilesGroup = createDarkTiles().addTo(map);
    tileLayerRef.current = darkTilesGroup;

    // Create Layer Groups
    const trafficGroup = L.layerGroup().addTo(map);
    const heatmapGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);

    trafficLayerGroupRef.current = trafficGroup;
    heatmapLayerGroupRef.current = heatmapGroup;
    markersLayerGroupRef.current = markersGroup;

    // Zoom listener
    map.on('zoomend', () => {
      setZoomLevel(map.getZoom());
    });

    // Initial resize invalidations to handle flexbox layout settling
    const t1 = setTimeout(() => map.invalidateSize(), 120);
    const t2 = setTimeout(() => map.invalidateSize(), 450);

    // ResizeObserver to adapt smoothly when container or window changes
    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    // Cleanup
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Invalidate size when 3D tilt mode changes
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 720);
    return () => clearTimeout(timer);
  }, [is3D]);

  // Handle Tile Mode Change (Dark Vector vs Satellite Aerial)
  const handleToggleTileMode = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const nextMode = mapMode === 'dark' ? 'satellite' : 'dark';
    setMapMode(nextMode);

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (nextMode === 'satellite') {
      const satGroup = createSatelliteTiles().addTo(map);
      tileLayerRef.current = satGroup;
      onNotification?.('Switched to Dark Satellite Aerial Imagery');
    } else {
      const darkGroup = createDarkTiles().addTo(map);
      tileLayerRef.current = darkGroup;
      onNotification?.('Switched to AI Vector Smart City Map');
    }
  }, [mapMode, onNotification]);

  // Update Map Position when selectedLocation changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo([currentLocation.lat, currentLocation.lng], 15.5, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [selectedLocation, currentLocation]);

  // Render & Update Traffic Polylines
  useEffect(() => {
    const group = trafficLayerGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (!showTraffic) return;

    trafficSegments.forEach((segment) => {
      const color = getTrafficColor(segment.status);

      // Base glow polyline
      const glowLine = L.polyline(segment.coords, {
        color: color,
        weight: 9,
        opacity: 0.28,
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Core crisp traffic line (like Google Maps traffic)
      const coreLine = L.polyline(segment.coords, {
        color: color,
        weight: 4,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Animated traffic pulse dash line
      const animatedDash = L.polyline(segment.coords, {
        color: '#ffffff',
        weight: 2,
        opacity: 0.7,
        dashArray: '4, 16',
        className: 'leaflet-traffic-animated',
      });

      // Interactive popup
      const popupContent = `
        <div style="font-family: inherit;">
          <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">
            Live Traffic Sensor
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #fff; margin-top: 2px;">
            ${segment.name}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${color}; box-shadow: 0 0 8px ${color};"></span>
            <span style="font-size: 12px; font-weight: 600; color: ${color}; text-transform: capitalize;">
              ${segment.status} (${segment.speedKmH} km/h)
            </span>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            Violation Risk: <span style="color: #f1f5f9; font-weight: 500;">${segment.violationRisk.toUpperCase()}</span>
          </div>
        </div>
      `;

      coreLine.bindPopup(popupContent);
      coreLine.bindTooltip(
        `<b>${segment.name}</b><br/>Speed: ${segment.speedKmH} km/h • ${segment.status.toUpperCase()}`, 
        { sticky: true, className: 'glass-card-sm' }
      );

      group.addLayer(glowLine);
      group.addLayer(coreLine);
      group.addLayer(animatedDash);
    });
  }, [trafficSegments, showTraffic]);

  // Render & Update Heatmap Zones
  useEffect(() => {
    const group = heatmapLayerGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (!showHeatmap) return;

    initialRiskZones.forEach((zone: RiskZone) => {
      const dynamicRate = +(zone.predictedRate * hourFactor).toFixed(1);
      const dynamicRadius = Math.round(zone.radius * (0.75 + 0.35 * hourFactor));
      const dynamicOpacity = Math.min(0.65, Math.max(0.12, 0.2 + 0.08 * dynamicRate));

      // Outer subtle halo
      const outerCircle = L.circle(zone.center, {
        radius: dynamicRadius * 1.35,
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: dynamicOpacity * 0.45,
        weight: 1,
        opacity: 0.25,
      });

      // Core glowing zone
      const coreCircle = L.circle(zone.center, {
        radius: dynamicRadius,
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: dynamicOpacity,
        weight: 1.5,
        opacity: 0.65,
        dashArray: '6, 6',
      });

      coreCircle.bindTooltip(
        `<div style="font-size: 12px; font-weight: 600; color: #fff;">
           ${zone.name}
         </div>
         <div style="font-size: 11px; color: ${zone.color};">
           ${dynamicRate} violations / hr (${activeHour < 10 ? '0' : ''}${activeHour}:00) • ${zone.riskLevel.toUpperCase()}
         </div>`,
        { sticky: true, className: 'glass-card-sm' }
      );

      group.addLayer(outerCircle);
      group.addLayer(coreCircle);
    });
  }, [showHeatmap, hourFactor, activeHour]);

  // Render Markers (Selected Pin + Hotspot Markers)
  useEffect(() => {
    const group = markersLayerGroupRef.current;
    const map = mapInstanceRef.current;
    if (!group || !map) return;

    group.clearLayers();

    // 1. Hotspot markers for all locations
    locations.forEach((loc) => {
      const isSelected = loc.id === selectedLocation;
      if (isSelected) return; // Will render dedicated primary marker

      const dotIcon = L.divIcon({
        className: 'custom-hotspot-marker',
        html: `
          <div style="position: relative; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
            <div style="position: absolute; width: 10px; height: 10px; border-radius: 50%; background: #2563FF; border: 2px solid #050B18; box-shadow: 0 0 10px #2563FF;"></div>
            <div style="position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 10px; font-weight: 500; color: rgba(255,255,255,0.65); background: rgba(5,11,24,0.75); padding: 1px 6px; border-radius: 4px; border: 1px solid rgba(80,130,255,0.2); pointer-events: none;">
              ${loc.name}
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: dotIcon });
      marker.on('click', () => {
        audioFx.playRadar();
        onSelectLocation?.(loc.id);
        onNotification?.(`Focused on ${loc.name}`);
      });
      marker.bindTooltip(`Click to view ${loc.name}`, { direction: 'top', offset: [0, -10] });

      group.addLayer(marker);
    });

    // 2. PRIMARY SELECTED PIN (Matching the screenshot with glowing purple/pink badge & floating tooltip)
    const primaryIcon = L.divIcon({
      className: 'custom-selected-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; pointer-events: auto;">
          <!-- Outer expanding radar ripple -->
          <div class="radar-sweep" style="position: absolute; inset: -14px; border-radius: 50%; background: radial-gradient(circle, rgba(233,70,255,0.4) 0%, transparent 70%); border: 1px solid rgba(233,70,255,0.5);"></div>

          <!-- Pulsing center badge -->
          <div class="pin-pulse" style="width: 38px; height: 38px; border-radius: 50%; background: #071126; border: 2.5px solid #E946FF; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 25px rgba(233,70,255,0.8), 0 0 45px rgba(233,70,255,0.3);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E946FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>

          <!-- Attached Floating Tooltip (Matching reference image) -->
          <div style="position: absolute; left: 48px; top: 50%; transform: translateY(-50%); white-space: nowrap; background: rgba(7, 17, 38, 0.95); border: 1px solid rgba(233, 70, 255, 0.5); border-radius: 12px; padding: 7px 14px; box-shadow: 0 0 22px rgba(233, 70, 255, 0.25), 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(12px);">
            <div style="font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: -0.01em;">
              ${currentLocation.name}
            </div>
            <div style="font-size: 11px; font-weight: 600; color: #E946FF; margin-top: 1px; display: flex; align-items: center; gap: 4px;">
              <span>Predicted: ${violations} / hr (${activeHour < 10 ? '0' : ''}${activeHour}:00)</span>
            </div>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [19, 19],
    });

    const primaryMarker = L.marker([currentLocation.lat, currentLocation.lng], { 
      icon: primaryIcon,
      zIndexOffset: 1000 
    });

    group.addLayer(primaryMarker);
    selectedMarkerRef.current = primaryMarker;
  }, [selectedLocation, currentLocation, violations, activeHour, onSelectLocation, onNotification]);

  // REAL-TIME SIMULATION ENGINE: Updates vehicle speeds, IoT telemetry, and live indicators
  useEffect(() => {
    if (!isSimulatingLive) return;

    const interval = setInterval(() => {
      // Fluctuate traffic speeds realistically
      setTrafficSegments((prev) =>
        prev.map((seg) => {
          const delta = (Math.random() - 0.48) * 2.2;
          const newSpeed = Math.max(4, Math.min(65, Math.round((seg.speedKmH + delta) * 10) / 10));

          let newStatus: TrafficSegment['status'] = seg.status;
          if (newSpeed < 10) newStatus = 'standstill';
          else if (newSpeed < 22) newStatus = 'congested';
          else if (newSpeed < 36) newStatus = 'moderate';
          else newStatus = 'free';

          return {
            ...seg,
            speedKmH: newSpeed,
            status: newStatus,
          };
        })
      );

      // Fluctuate average speed
      setAvgSpeed((prev) => +(prev + (Math.random() - 0.5) * 0.4).toFixed(1));
      setLastUpdateText('Live • just now');
    }, 3500);

    return () => clearInterval(interval);
  }, [isSimulatingLive]);

  // Recenter Map
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([currentLocation.lat, currentLocation.lng], 15.5, {
      duration: 1.0,
    });
    onNotification?.(`Centered on ${currentLocation.name}`);
  };

  // Zoom In / Out
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div 
      className="relative w-full h-full flex-1 rounded-2xl border border-[rgba(80,130,255,0.22)] overflow-hidden glass-card transition-all duration-500"
      style={{
        perspective: is3D ? '1200px' : 'none',
        isolation: 'isolate',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        transform: 'translateZ(0)',
        minHeight: '100%',
        height: '100%',
      }}
    >
      {/* 3D Tilted Map Viewport Wrapper */}
      <div 
        className="w-full h-full flex-1 relative overflow-hidden transition-transform duration-700 ease-out origin-bottom"
        style={{
          transform: is3D ? 'rotateX(26deg) scale(1.06) translateY(-14px)' : 'none',
          transformOrigin: '50% 100%',
        }}
      >
        <div 
          ref={mapContainerRef} 
          className="w-full h-full absolute inset-0"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* TOP-LEFT HUD: Real-time telemetry status badge (like Google Maps live traffic bar) */}
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 pointer-events-none max-w-[calc(100%-120px)]">
        <div 
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[rgba(80,130,255,0.25)] shadow-lg backdrop-blur-md"
          style={{ background: 'rgba(5, 11, 24, 0.88)' }}
        >
          {/* Pulsing radar dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-white tracking-wider uppercase">Live Traffic Layer</span>
              <span className="text-[9px] text-emerald-400 font-semibold">• ACTIVE</span>
            </div>
            <span className="text-[9px] text-slate-400">
              Avg: <strong className="text-white font-medium">{avgSpeed} km/h</strong> • {activeSensorsCount} IoT Nodes
            </span>
          </div>
        </div>

        {/* Live Simulation Ticker */}
        <div 
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[rgba(80,130,255,0.18)] shadow-lg backdrop-blur-md text-[10px] text-slate-300"
          style={{ background: 'rgba(5, 11, 24, 0.82)' }}
        >
          <Radio size={12} className="text-[#00A8FF] animate-pulse" />
          <span>Stream: <span className="text-cyan-400 font-semibold">BLR-CENTRAL-01</span></span>
        </div>
      </div>

      {/* TOP-RIGHT HUD: Futuristic Smart-City Controls */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        {/* 3D Perspective Tilt Button */}
        <button
          onClick={() => {
            const next = !is3D;
            setIs3D(next);
            audioFx.playWhoosh();
            onNotification?.(next ? 'Enabled 3D Drone Perspective' : 'Switched to 2D Planar View');
          }}
          className={`flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 h-[36px] cursor-pointer outline-none ${
            is3D 
              ? 'text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.35)]' 
              : 'text-white border-[rgba(80,130,255,0.25)] hover:bg-white/10'
          }`}
          style={{
            background: is3D ? 'rgba(34,211,238,0.15)' : 'rgba(7,17,38,0.9)',
            borderWidth: '1px',
            backdropFilter: 'blur(10px)',
          }}
          title="Toggle 3D Drone Perspective"
        >
          3D
        </button>

        {/* Satellite vs Dark Vector Map Mode */}
        <button
          onClick={() => {
            audioFx.playClick();
            handleToggleTileMode();
          }}
          className={`flex items-center justify-center rounded-xl w-[36px] h-[36px] transition-all duration-200 cursor-pointer outline-none ${
            mapMode === 'satellite'
              ? 'text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
              : 'text-white border-[rgba(80,130,255,0.25)] hover:bg-white/10'
          }`}
          style={{
            background: mapMode === 'satellite' ? 'rgba(34,211,238,0.15)' : 'rgba(7,17,38,0.9)',
            borderWidth: '1px',
            backdropFilter: 'blur(10px)',
          }}
          title={mapMode === 'satellite' ? 'Switch to Dark Vector Map' : 'Switch to Dark Satellite Aerial Imagery'}
        >
          <Layers size={17} />
        </button>

        {/* Toggle Live Traffic Layer */}
        <button
          onClick={() => {
            audioFx.playClick();
            setShowTraffic(!showTraffic);
            onNotification?.(showTraffic ? 'Traffic Layer Hidden' : 'Live Traffic Layer Active');
          }}
          className={`flex items-center justify-center rounded-xl w-[36px] h-[36px] transition-all duration-200 cursor-pointer outline-none ${
            showTraffic
              ? 'text-emerald-400 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'text-slate-500 border-[rgba(80,130,255,0.25)] hover:bg-white/10'
          }`}
          style={{
            background: showTraffic ? 'rgba(16,185,129,0.15)' : 'rgba(7,17,38,0.9)',
            borderWidth: '1px',
            backdropFilter: 'blur(10px)',
          }}
          title={showTraffic ? 'Hide Live Traffic' : 'Show Live Traffic'}
        >
          <Activity size={17} />
        </button>

        {/* Toggle AI Heatmap Layer */}
        <button
          onClick={() => {
            audioFx.playClick();
            setShowHeatmap(!showHeatmap);
            onNotification?.(showHeatmap ? 'Heatmap Hidden' : 'Violation Risk Heatmap Visible');
          }}
          className={`flex items-center justify-center rounded-xl w-[36px] h-[36px] transition-all duration-200 cursor-pointer outline-none ${
            showHeatmap
              ? 'text-[#E946FF] border-[#E946FF] shadow-[0_0_15px_rgba(233,70,255,0.3)]'
              : 'text-slate-500 border-[rgba(80,130,255,0.25)] hover:bg-white/10'
          }`}
          style={{
            background: showHeatmap ? 'rgba(233,70,255,0.15)' : 'rgba(7,17,38,0.9)',
            borderWidth: '1px',
            backdropFilter: 'blur(10px)',
          }}
          title={showHeatmap ? 'Hide Violation Heatmap' : 'Show Violation Heatmap'}
        >
          <Flame size={17} />
        </button>

        {/* Recenter on Selected Location */}
        <button
          onClick={() => {
            audioFx.playClick();
            handleRecenter();
          }}
          className="flex items-center justify-center rounded-xl w-[36px] h-[36px] text-white border border-[rgba(80,130,255,0.25)] hover:bg-white/10 hover:text-cyan-400 transition-all duration-200 cursor-pointer outline-none"
          style={{
            background: 'rgba(7,17,38,0.9)',
            backdropFilter: 'blur(10px)',
          }}
          title="Recenter on Selected Pin"
        >
          <Navigation size={17} />
        </button>

        {/* Zoom Controls */}
        <div 
          className="flex flex-col rounded-xl overflow-hidden border border-[rgba(80,130,255,0.25)] shadow-lg"
          style={{ background: 'rgba(7,17,38,0.9)', backdropFilter: 'blur(10px)' }}
        >
          <button
            onClick={() => {
              audioFx.playClick();
              handleZoomIn();
            }}
            className="flex items-center justify-center w-[36px] h-[34px] text-white hover:bg-white/10 hover:text-cyan-400 transition-all duration-200 cursor-pointer outline-none border-b border-[rgba(80,130,255,0.2)]"
            title="Zoom In"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => {
              audioFx.playClick();
              handleZoomOut();
            }}
            className="flex items-center justify-center w-[36px] h-[34px] text-white hover:bg-white/10 hover:text-cyan-400 transition-all duration-200 cursor-pointer outline-none"
            title="Zoom Out"
          >
            <Minus size={16} />
          </button>
        </div>
      </div>

      {/* BOTTOM-LEFT HUD: Smart City Violation Risk & Live Traffic Speed Legend */}
      <div 
        className="absolute bottom-4 left-4 z-[400] rounded-xl p-3 border border-[rgba(80,130,255,0.2)] shadow-2xl backdrop-blur-md max-w-[210px]"
        style={{ background: 'rgba(7, 17, 38, 0.92)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">Violation Risk</span>
          <span className="text-[9px] text-slate-400">Live AI</span>
        </div>

        {/* Risk Categories */}
        <div className="flex flex-col gap-1.5 pb-2 border-b border-[rgba(80,130,255,0.15)]">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF3158] shadow-[0_0_6px_#FF3158]" />
              <span>Very High</span>
            </div>
            <span className="text-[10px] text-slate-400">&gt; 4.0/hr</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF9F1C] shadow-[0_0_6px_#FF9F1C]" />
              <span>High</span>
            </div>
            <span className="text-[10px] text-slate-400">3.0 - 4.0</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#20C96B] shadow-[0_0_6px_#20C96B]" />
              <span>Medium</span>
            </div>
            <span className="text-[10px] text-slate-400">2.0 - 3.0</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#149EFF] shadow-[0_0_6px_#149EFF]" />
              <span>Low</span>
            </div>
            <span className="text-[10px] text-slate-400">&lt; 2.0</span>
          </div>
        </div>

        {/* Live Traffic Flow Indicator */}
        {showTraffic && (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-slate-400">Traffic Congestion</span>
              <span className="text-[9px] text-cyan-400">{lastUpdateText}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-emerald-400 font-medium">Fast</span>
              <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500" />
              <span className="text-[9px] text-red-400 font-medium">Slow</span>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM-RIGHT HUD: 24-Hour Time-Lapse Heatmap Player */}
      <div className="absolute bottom-4 right-4 z-[400] w-[270px] sm:w-[300px] max-w-[calc(100%-230px)]">
        <TimeLapsePlayer
          currentHour={activeHour}
          onHourChange={handleHourChange}
          onNotification={onNotification}
        />
      </div>

      {/* Subtle edge vignette to blend map seamlessly with dark dashboard border */}
      <div 
        className="absolute inset-0 z-[300] pointer-events-none" 
        style={{
          boxShadow: 'inset 0 0 35px 15px rgba(5,11,24,0.7)',
        }}
      />
    </div>
  );
};

export default CityMap;
