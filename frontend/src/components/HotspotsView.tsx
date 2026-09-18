import { useState, useMemo } from 'react';
import { 
  MapPin, 
  Search, 
  AlertTriangle, 
  ArrowUpRight, 
  ShieldAlert, 
  Radio, 
  Filter, 
  SlidersHorizontal,
  Car,
  Clock
} from 'lucide-react';
import { locations } from '../data';

interface HotspotsViewProps {
  onSelectHotspot: (locationId: string) => void;
  onNotification?: (msg: string) => void;
}

const hotspotDetails: Record<string, { description: string; cameras: number; peakHour: string; geohash: string }> = {
  'mg-road': {
    description: 'Commercial CBD artery with frequent curb parking violations outside shopping arcades and metro stations.',
    cameras: 18,
    peakHour: '18:00 - 20:00',
    geohash: 'tdr1v9q'
  },
  'brigade-road': {
    description: 'High-density pedestrian & retail corridor. Valet overflow and double parking cause major bottlenecks.',
    cameras: 14,
    peakHour: '19:00 - 22:00',
    geohash: 'tdr1vcr'
  },
  'commercial-street': {
    description: 'Bazaar district with heavy unauthorized freight unloading, double parking, and two-wheeler footpath encroachment.',
    cameras: 16,
    peakHour: '12:00 - 15:00',
    geohash: 'tdr1vf2'
  },
  'ub-city': {
    description: 'Luxury commercial complex with frequent VIP drop-off obstructions along Vittal Mallya Road curb line.',
    cameras: 12,
    peakHour: '20:00 - 23:00',
    geohash: 'tdr1v88'
  },
  'church-street': {
    description: 'Cobblestone pedestrian-priority boulevard with nightlife parking overflow into adjacent alleys.',
    cameras: 9,
    peakHour: '20:00 - 22:30',
    geohash: 'tdr1vc4'
  },
  'residency-road': {
    description: 'Primary arterial transit route. Unauthorized curb parking reduces traffic flow from 3 lanes to 1.',
    cameras: 15,
    peakHour: '17:30 - 19:30',
    geohash: 'tdr1vbf'
  },
  'koramangala': {
    description: 'Major food & beverage hub along 80ft Road. Weekend double-parking and ride-hail pickup queues.',
    cameras: 22,
    peakHour: '19:30 - 23:00',
    geohash: 'tdr1m93'
  },
  'indiranagar': {
    description: '100ft Road retail corridor. Weekend evening congestion due to curb parking and food delivery vehicles.',
    cameras: 20,
    peakHour: '18:30 - 21:30',
    geohash: 'tdr1y1e'
  },
};

const HotspotsView = ({ onSelectHotspot, onNotification }: HotspotsViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rate' | 'name'>('rate');

  const filteredHotspots = useMemo(() => {
    return locations
      .filter((loc) => {
        const matchesQuery = 
          loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (hotspotDetails[loc.id]?.geohash.includes(searchQuery.toLowerCase()) ?? false);

        if (!matchesQuery) return false;

        if (selectedRiskFilter === 'all') return true;
        return loc.riskLevel === selectedRiskFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'rate') return b.predictedViolations - a.predictedViolations;
        return a.name.localeCompare(b.name);
      });
  }, [searchQuery, selectedRiskFilter, sortBy]);

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 pb-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <MapPin className="text-[#FF3158]" size={22} />
            Bangalore Parking Violation Hotspots
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Geohash-level precision monitoring and automated enforcement risk zoning
          </p>
        </div>

        {/* Global Stats Pill */}
        <div className="flex items-center gap-3 bg-[rgba(13,27,58,0.7)] px-3 py-1.5 rounded-xl border border-[rgba(80,130,255,0.2)] text-xs text-slate-300 self-start">
          <div className="flex items-center gap-1.5">
            <Radio size={12} className="text-emerald-400 animate-pulse" />
            <span>Active Hotspots: <strong className="text-white">8 Zones</strong></span>
          </div>
          <span className="text-slate-600">|</span>
          <span>Avg Rate: <strong className="text-cyan-400">3.1 / hr</strong></span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hotspot or geohash..."
            className="w-full bg-[rgba(13,27,58,0.8)] border border-[rgba(80,130,255,0.2)] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Risk Level Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Zones' },
            { id: 'very-high', label: 'Very High Risk' },
            { id: 'high', label: 'High Risk' },
            { id: 'medium', label: 'Medium Risk' },
            { id: 'low', label: 'Low Risk' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedRiskFilter(filter.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border-none outline-none ${
                selectedRiskFilter === filter.id
                  ? 'bg-gradient-to-r from-[#2563FF] to-[#6D4AFF] text-white shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hotspots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHotspots.map((loc) => {
          const detail = hotspotDetails[loc.id] || {
            description: 'Monitored smart-city sector with live camera feeds.',
            cameras: 10,
            peakHour: '18:00 - 21:00',
            geohash: 'tdr1v' + loc.id.slice(0, 2),
          };

          const isVeryHigh = loc.riskLevel === 'very-high';
          const isHigh = loc.riskLevel === 'high';

          return (
            <div 
              key={loc.id}
              className="glass-card p-5 flex flex-col justify-between hover:border-[rgba(80,130,255,0.45)] transition-all duration-300 group hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
            >
              <div>
                {/* Header: Title + Risk Pill */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {loc.area}, Bengaluru
                    </p>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex-shrink-0 ${
                    isVeryHigh
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_10px_rgba(255,49,88,0.3)]'
                      : isHigh
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {loc.riskLevel.toUpperCase()}
                  </span>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-[rgba(13,27,58,0.6)] border border-[rgba(80,130,255,0.1)]">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Violation Rate</span>
                    <span className="text-lg font-bold text-white tracking-tight">
                      {loc.predictedViolations} <span className="text-xs text-cyan-400 font-normal">/ hr</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Geohash (Precision 7)</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 tracking-wide block mt-1">
                      {detail.geohash}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {detail.description}
                </p>
              </div>

              <div>
                {/* Footer Metadata */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pb-3 border-b border-[rgba(80,130,255,0.12)]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock size={12} className="text-cyan-400" /> Peak: {detail.peakHour}
                  </span>
                  <span>{detail.cameras} CCTV Nodes</span>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectHotspot(loc.id);
                      onNotification?.(`Viewing ${loc.name} in Map Predictor`);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#2563FF] to-[#6D4AFF] hover:from-[#3573FF] hover:to-[#7D5AFF] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md border-none"
                  >
                    <span>Inspect on Map</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HotspotsView;
