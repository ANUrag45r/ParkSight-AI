import { useState, useCallback, useRef, useEffect } from 'react';
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
  const [predictionResult, setPredictionResult] = useState<PredictionResultType | null>(null);
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

  // Dynamic CatBoost Prediction Runner
  const runPrediction = useCallback(async (
    locId: string,
    date: Date,
    time: string,
    triggerAudioAlert: boolean = false
  ) => {
    const loc = locations.find(l => l.id === locId) || locations[0];
    try {
      const result = await fetchCatBoostPrediction(loc, date, time);
      setPredictionResult(result);
      if (triggerAudioAlert) {
        if (result.riskLevel === 'very-high' || result.riskLevel === 'high') {
          audioFx.playAlert();
        } else {
          audioFx.playSuccess();
        }
      }
      return result;
    } catch (err) {
      console.error('Prediction error:', err);
      return null;
    }
  }, []);

  // Initial load inference
  useEffect(() => {
    runPrediction(selectedLocation, selectedDate, selectedTime, false);
  }, []);

  const handlePredict = useCallback(async () => {
    audioFx.playClick();
    setIsLoading(true);
    try {
      const result = await runPrediction(selectedLocation, selectedDate, selectedTime, true);
      if (result) {
        showNotification(`CatBoost Prediction: ${result.violations} violations/hr — ${result.riskLabel}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedLocation, selectedDate, selectedTime, runPrediction]);

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
    runPrediction(selectedLocation, newDate, selectedTime, false);
  };

  const handleTimeChange = (newTime: string) => {
    audioFx.playClick();
    setSelectedTime(newTime);
    setTimelineHour(timeStringToHour(newTime));
    runPrediction(selectedLocation, selectedDate, newTime, false);
    showNotification(`Time set to ${newTime}`);
  };

  const handleTimelineHourChange = useCallback((hour: number) => {
    setTimelineHour(hour);
    const timeStr = hourToTimeString(hour);
    setSelectedTime(timeStr);
    runPrediction(selectedLocation, selectedDate, timeStr, false);
  }, [selectedLocation, selectedDate, runPrediction]);

  const handleLocationChange = (newLocId: string) => {
    audioFx.playRadar();
    setSelectedLocation(newLocId);
    runPrediction(newLocId, selectedDate, selectedTime, false);
    const loc = locations.find(l => l.id === newLocId);
    if (loc) {
      showNotification(`Loaded ${loc.name} AI telemetry`);
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
        <div className="px-6 pt-2 pb-6 flex flex-col gap-4">
          {(activeNav === 'home' || activeNav === 'predictor') && (
            <>
              {/* Two column layout: Selectors + Map */}
              <div className="flex flex-col lg:flex-row gap-4 w-full items-stretch">
                {/* Left Column - Selectors */}
                <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-3">
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
                  className="flex-1 min-w-0 flex flex-col rounded-2xl overflow-hidden h-[460px] lg:h-[480px] xl:h-[510px]" 
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
              <div className="w-full mt-1">
                <PredictionResult
                  result={predictionResult}
                  isLoading={isLoading}
                />
              </div>

              {/* Feature Strip */}
              <div className="w-full pb-3">
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
