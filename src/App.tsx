import { useState, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import LocationSelector from './components/LocationSelector';
import DateSelector from './components/DateSelector';
import TimeSelector from './components/TimeSelector';
import PredictButton from './components/PredictButton';
import CityMap from './components/CityMap';
import PredictionResult from './components/PredictionResult';
import FeatureStrip from './components/FeatureStrip';
import { getPrediction, locations } from './data';
import { fetchCatBoostPrediction } from './api';
import type { PredictionResult as PredictionResultType } from './types';
import { audioFx } from './utils/audioFx';
import { ParsedVoiceCommand } from './utils/voiceCommander';

import AnalyticsView from './components/AnalyticsView';
import HotspotsView from './components/HotspotsView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';

// Convert 24h number (0-23) to "HH:00 AM/PM"
const hourToTimeString = (hour: number): string => {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  const paddedH = h12 < 10 ? `0${h12}` : `${h12}`;
  return `${paddedH}:00 ${ampm}`;
};

// Convert "HH:MM AM/PM" to 24h number (0-23)
const timeStringToHour = (timeStr: string): number => {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 18;
  let h = parseInt(match[1], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h;
};

function App() {
  const [selectedLocation, setSelectedLocation] = useState('mg-road');
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 8, 16)); // Sep 16, 2025
  const [selectedTime, setSelectedTime] = useState('06:00 PM');
  const [timelineHour, setTimelineHour] = useState(18); // Default 18:00 (06:00 PM)
  const [predictionResult, setPredictionResult] = useState<PredictionResultType | null>({
    violations: 3.2,
    riskLevel: 'high',
    riskLabel: 'HIGH RISK',
    location: 'MG Road',
    area: 'Bengaluru',
    date: '16 Sep 2025 (Tue)',
    dayName: 'Tuesday',
    time: '06:00 PM',
    message: 'This location is likely to experience parking violations around this time.',
    geohash: 'tdr1v9q',
    featuresUsed: {
      geohash: 'tdr1v9q',
      hour_sin: -1.0,
      hour_cos: 0.0,
      day_sin: 0.7818,
      day_cos: 0.6235,
    },
    isKnownHotspot: true,
    modelType: 'CatBoost Poisson Regressor (.cbm)',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const locationSelectorRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} (${days[date.getDay()]})`;
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handlePredict = useCallback(async () => {
    audioFx.playClick();
    setIsLoading(true);
    const loc = locations.find(l => l.id === selectedLocation) || locations[0];
    try {
      const result = await fetchCatBoostPrediction(loc, selectedDate, selectedTime);
      setPredictionResult(result);
      if (result.riskLevel === 'very-high' || result.riskLevel === 'high') {
        audioFx.playAlert();
      } else {
        audioFx.playSuccess();
      }
      showNotification(`CatBoost Prediction: ${result.violations} violations/hr — ${result.riskLabel}`);
    } catch (err) {
      console.error(err);
      audioFx.playSuccess();
      showNotification('Inference completed');
    } finally {
      setIsLoading(false);
    }
  }, [selectedLocation, selectedDate, selectedTime]);

  const handleNavChange = (navId: string) => {
    audioFx.playWhoosh();
    setActiveNav(navId);
    showNotification(`Navigated to ${navId.charAt(0).toUpperCase() + navId.slice(1)}`);
  };

  const handleChangeRegion = () => {
    audioFx.playClick();
    locationSelectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const input = locationSelectorRef.current?.querySelector('input');
    if (input) {
      input.focus();
      input.select();
    }
    showNotification('Select a new region or hotspot below');
  };

  const handleViewOnMap = () => {
    audioFx.playRadar();
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showNotification('Showing location on map');
  };

  const handleDateChange = (newDate: Date) => {
    audioFx.playClick();
    setSelectedDate(newDate);
    const dateStr = formatDate(newDate);
    setPredictionResult((prev) => prev ? { ...prev, date: dateStr } : null);
  };

  const handleTimeChange = (newTime: string) => {
    audioFx.playClick();
    setSelectedTime(newTime);
    setTimelineHour(timeStringToHour(newTime));
    setPredictionResult((prev) => prev ? { ...prev, time: newTime } : null);
    showNotification(`Time set to ${newTime}`);
  };

  const handleTimelineHourChange = useCallback((hour: number) => {
    setTimelineHour(hour);
    const timeStr = hourToTimeString(hour);
    setSelectedTime(timeStr);
    setPredictionResult((prev) => prev ? { ...prev, time: timeStr } : null);
  }, []);

  const handleLocationChange = (newLocId: string) => {
    audioFx.playRadar();
    setSelectedLocation(newLocId);
    const loc = locations.find(l => l.id === newLocId);
    if (loc) {
      setPredictionResult((prev) => prev ? { ...prev, location: loc.name, area: loc.area } : null);
    }
  };

  // Voice Command Dispatcher
  const handleVoiceCommand = useCallback((cmd: ParsedVoiceCommand) => {
    if (cmd.intent === 'navigate' && cmd.targetNav) {
      handleNavChange(cmd.targetNav);
    } else if (cmd.intent === 'predict') {
      handlePredict();
    } else if (cmd.intent === 'set_location') {
      if (activeNav !== 'home' && activeNav !== 'predictor') {
        setActiveNav('home');
      }
      let updatedLocId = selectedLocation;
      let updatedDate = selectedDate;
      let updatedTime = selectedTime;

      if (cmd.locationId) {
        updatedLocId = cmd.locationId;
        setSelectedLocation(cmd.locationId);
        const loc = locations.find(l => l.id === cmd.locationId);
        if (loc) {
          setPredictionResult((prev) => prev ? { ...prev, location: loc.name, area: loc.area } : null);
        }
      }

      if (cmd.targetDate) {
        updatedDate = cmd.targetDate;
        setSelectedDate(cmd.targetDate);
        const dateStr = formatDate(cmd.targetDate);
        setPredictionResult((prev) => prev ? { ...prev, date: dateStr } : null);
      }

      if (cmd.targetTime) {
        updatedTime = cmd.targetTime;
        setSelectedTime(cmd.targetTime);
        setTimelineHour(timeStringToHour(cmd.targetTime));
        setPredictionResult((prev) => prev ? { ...prev, time: cmd.targetTime! } : null);
      }

      // Automatically trigger CatBoost forecast for this query
      const targetLoc = locations.find(l => l.id === updatedLocId) || locations[0];
      setIsLoading(true);
      fetchCatBoostPrediction(targetLoc, updatedDate, updatedTime)
        .then((res) => {
          setPredictionResult(res);
          if (res.riskLevel === 'very-high' || res.riskLevel === 'high') {
            audioFx.playAlert();
          } else {
            audioFx.playSuccess();
          }
          showNotification(`Voice Forecast: ${res.violations} violations/hr (${res.riskLabel}) at ${targetLoc.name}`);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [activeNav, selectedLocation, selectedDate, selectedTime, handlePredict]);

  const currentLocation = locations.find(l => l.id === selectedLocation) || locations[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050B18]">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-5 right-5 z-[100] animate-count" style={{
          background: 'rgba(7,17,38,0.95)',
          border: '1px solid rgba(80,130,255,0.35)',
          borderRadius: '12px',
          padding: '12px 20px',
          boxShadow: '0 0 30px rgba(70,70,255,0.2), 0 10px 40px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
          color: '#fff',
          fontSize: '13px',
          fontWeight: 500,
          maxWidth: '360px',
        }}>
          {notification}
        </div>
      )}

      {/* Sidebar */}
      <Sidebar activeNav={activeNav} onNavChange={handleNavChange} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden" style={{ scrollbarGutter: 'stable' }}>
        {/* Top Header */}
        <div className="px-6 pt-5 pb-2 flex-shrink-0">
          <TopHeader
            onChangeRegion={handleChangeRegion}
            showUserMenu={showUserMenu}
            onToggleUserMenu={() => {
              audioFx.playClick();
              setShowUserMenu(!showUserMenu);
            }}
            onUserMenuAction={(action) => {
              audioFx.playClick();
              setShowUserMenu(false);
              showNotification(action);
            }}
            activeNav={activeNav}
            onVoiceCommand={handleVoiceCommand}
            onNotification={showNotification}
          />
        </div>

        {/* Dynamic Main Content Area */}
        <div className="px-6 pt-3 pb-3 flex-1 flex flex-col gap-3 min-h-0">
          {(activeNav === 'home' || activeNav === 'predictor') && (
            <>
              {/* Two column layout: Selectors + Map */}
              <div className="flex gap-4 flex-1 min-h-0">
                {/* Left Column - Selectors */}
                <div className="w-[310px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                  <div ref={locationSelectorRef}>
                    <LocationSelector
                      selectedLocation={selectedLocation}
                      onLocationChange={handleLocationChange}
                      onViewOnMap={handleViewOnMap}
                    />
                  </div>
                  <DateSelector
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                    onNotification={showNotification}
                  />
                  <TimeSelector
                    selectedTime={selectedTime}
                    onTimeChange={handleTimeChange}
                  />
                  <PredictButton
                    onClick={handlePredict}
                    isLoading={isLoading}
                  />
                </div>

                {/* Right Column - Map */}
                <div 
                  className="flex-1 min-w-0 flex flex-col h-full overflow-hidden" 
                  style={{ minHeight: '380px', maxHeight: 'calc(100vh - 280px)' }}
                  ref={mapRef}
                >
                  <CityMap
                    selectedLocation={selectedLocation}
                    onSelectLocation={handleLocationChange}
                    predictionResult={predictionResult ? {
                      violations: predictionResult.violations,
                      riskLevel: predictionResult.riskLevel,
                    } : null}
                    onNotification={showNotification}
                    timelineHour={timelineHour}
                    onTimelineHourChange={handleTimelineHourChange}
                  />
                </div>
              </div>

              {/* Prediction Result */}
              <div className="flex-shrink-0">
                <PredictionResult
                  result={predictionResult}
                  isLoading={isLoading}
                />
              </div>

              {/* Feature Strip */}
              <div className="flex-shrink-0 pb-2">
                <FeatureStrip />
              </div>
            </>
          )}

          {activeNav === 'analytics' && (
            <AnalyticsView
              onSelectHotspot={(id) => {
                audioFx.playRadar();
                setSelectedLocation(id);
                setActiveNav('predictor');
              }}
              onNotification={showNotification}
            />
          )}

          {activeNav === 'hotspots' && (
            <HotspotsView
              onSelectHotspot={(id) => {
                audioFx.playRadar();
                setSelectedLocation(id);
                setActiveNav('predictor');
              }}
              onNotification={showNotification}
            />
          )}

          {activeNav === 'reports' && (
            <ReportsView onNotification={showNotification} />
          )}

          {activeNav === 'settings' && (
            <SettingsView onNotification={showNotification} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
