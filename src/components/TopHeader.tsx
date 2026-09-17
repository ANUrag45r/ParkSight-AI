import { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  CloudSun, 
  Sun, 
  Moon, 
  Cloud, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning, 
  CloudFog, 
  User, 
  LogOut, 
  Settings, 
  Bell,
  Volume2,
  VolumeX,
  Mic
} from 'lucide-react';
import { audioFx } from '../utils/audioFx';
import { voiceCommander, ParsedVoiceCommand, VoiceState } from '../utils/voiceCommander';

interface TopHeaderProps {
  onChangeCity?: () => void;
  onChangeRegion?: () => void;
  showUserMenu: boolean;
  onToggleUserMenu: () => void;
  onUserMenuAction: (action: string) => void;
  activeNav?: string;
  onVoiceCommand?: (cmd: ParsedVoiceCommand) => void;
  onNotification?: (msg: string) => void;
}

const headerTitles: Record<string, { title: string; subtitle: string }> = {
  home: {
    title: "Let's predict parking violations.",
    subtitle: "Select a location, date and time to get accurate predictions\npowered by AI."
  },
  predictor: {
    title: "Parking Violation Hotspot Predictor.",
    subtitle: "Select a location, date and time to get accurate predictions\npowered by AI."
  },
  analytics: {
    title: "Parking Violation Spatiotemporal Analytics.",
    subtitle: "24-hour cycle patterns, day-of-week trends, and CatBoost Poisson metrics."
  },
  hotspots: {
    title: "Bangalore Smart-City Violation Hotspots.",
    subtitle: "High-risk zones ranked by Poisson violation density and Geohash precision 7."
  },
  reports: {
    title: "Smart-City Enforcement & Violation Reports.",
    subtitle: "Downloadable audit reports, AI patrol dispatch directives, and incident logs."
  },
  settings: {
    title: "System & CatBoost Model Configuration.",
    subtitle: "Manage spatiotemporal feature vectors, risk thresholds, and telemetry options."
  }
};

const TopHeader = ({ 
  onChangeCity, 
  onChangeRegion, 
  showUserMenu, 
  onToggleUserMenu, 
  onUserMenuAction, 
  activeNav = 'home',
  onVoiceCommand,
  onNotification,
}: TopHeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAudioMuted, setIsAudioMuted] = useState(audioFx.getIsMuted());
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Subscribe to Audio FX mute state
  useEffect(() => {
    return audioFx.subscribe((muted) => setIsAudioMuted(muted));
  }, []);

  // Subscribe to Voice Commander state & actions
  useEffect(() => {
    const unsubState = voiceCommander.onStateChange((state, transcript) => {
      setVoiceState(state);
      if (transcript !== undefined) setVoiceTranscript(transcript);
    });

    const unsubCmd = voiceCommander.onCommand((cmd) => {
      onVoiceCommand?.(cmd);
      onNotification?.(`Voice Action: ${cmd.summary}`);
    });

    return () => {
      unsubState();
      unsubCmd();
    };
  }, [onVoiceCommand, onNotification]);

  const handleToggleAudio = () => {
    const next = audioFx.toggleMute();
    setIsAudioMuted(next);
    onNotification?.(next ? 'Sound FX Muted' : 'Sound FX Active');
  };

  const handleToggleVoice = () => {
    if (voiceState === 'listening') {
      voiceCommander.stopListening();
    } else {
      voiceCommander.startListening();
      onNotification?.('Listening for voice commands...');
    }
  };

  const [weather, setWeather] = useState<{
    temp: number | null;
    condition: string;
    weatherCode: number;
    isDay: boolean;
    isLoading: boolean;
    lastUpdated: Date | null;
  }>({
    temp: 26,
    condition: 'Loading...',
    weatherCode: 2,
    isDay: true,
    isLoading: true,
    lastUpdated: null,
  });

  const menuRef = useRef<HTMLDivElement>(null);

  const { title, subtitle } = headerTitles[activeNav] || headerTitles.home;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real-time Bangalore weather telemetry
  useEffect(() => {
    let isMounted = true;

    const fetchBangaloreWeather = async () => {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current_weather=true'
        );
        if (!res.ok) throw new Error(`Weather telemetry returned status ${res.status}`);
        const data = await res.json();
        const current = data?.current_weather;

        if (current && isMounted) {
          const code = Number(current.weathercode ?? 2);
          const isDay = current.is_day === 1;
          const temp = Math.round(Number(current.temperature));

          let condition = 'Partly Cloudy';
          if (code === 0) condition = isDay ? 'Clear Sky' : 'Clear Night';
          else if (code === 1) condition = isDay ? 'Mainly Sunny' : 'Mainly Clear';
          else if (code === 2) condition = 'Partly Cloudy';
          else if (code === 3) condition = 'Overcast';
          else if (code === 45 || code === 48) condition = 'Foggy';
          else if (code >= 51 && code <= 57) condition = 'Drizzle';
          else if (code >= 61 && code <= 67) condition = 'Rain';
          else if (code >= 71 && code <= 77) condition = 'Snow';
          else if (code >= 80 && code <= 82) condition = 'Rain Showers';
          else if (code >= 95) condition = 'Thunderstorm';

          setWeather({
            temp,
            condition,
            weatherCode: code,
            isDay,
            isLoading: false,
            lastUpdated: new Date(),
          });
        }
      } catch (err) {
        console.warn('Real-time Bangalore weather fetch warning:', err);
        if (isMounted) {
          setWeather(prev => ({
            ...prev,
            temp: prev.temp ?? 26,
            condition: prev.condition === 'Loading...' ? 'Partly Cloudy' : prev.condition,
            isLoading: false,
          }));
        }
      }
    };

    fetchBangaloreWeather();
    // Poll every 10 minutes to maintain real-time accuracy
    const weatherTimer = setInterval(fetchBangaloreWeather, 10 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(weatherTimer);
    };
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        if (showUserMenu) onToggleUserMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu, onToggleUserMenu]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderWeatherIcon = () => {
    const { weatherCode, isDay } = weather;
    if (weatherCode === 0) {
      return isDay ? <Sun size={18} className="text-amber-400 animate-pulse" /> : <Moon size={18} className="text-cyan-200" />;
    }
    if (weatherCode === 1 || weatherCode === 2) {
      return isDay ? <CloudSun size={18} className="text-amber-400" /> : <Cloud size={18} className="text-slate-300" />;
    }
    if (weatherCode === 3) {
      return <Cloud size={18} className="text-slate-300" />;
    }
    if (weatherCode === 45 || weatherCode === 48) {
      return <CloudFog size={18} className="text-slate-300" />;
    }
    if (weatherCode >= 51 && weatherCode <= 57) {
      return <CloudDrizzle size={18} className="text-cyan-400" />;
    }
    if ((weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
      return <CloudRain size={18} className="text-blue-400" />;
    }
    if (weatherCode >= 95) {
      return <CloudLightning size={18} className="text-purple-400" />;
    }
    return <CloudSun size={18} className="text-amber-400" />;
  };

  return (
    <div className="flex items-start justify-between w-full">
      {/* Left Side */}
      <div className="flex flex-col">
        <p className="text-sm text-slate-400 font-normal">Good Morning,</p>
        <h1 className="text-2xl font-semibold text-white mt-1">{title}</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-lg whitespace-pre-line">
          {subtitle}
        </p>
      </div>

      {/* Right Side - Glass Card */}
      <div className="bg-[rgba(7,17,38,0.85)] border border-[rgba(80,130,255,0.22)] rounded-2xl px-5 py-3 flex items-center gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
        
        {/* Location Section */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-[#00A8FF]" />
            <span className="text-sm font-medium text-white">Bangalore</span>
          </div>
          <button 
            onClick={onChangeRegion || onChangeCity}
            className="text-xs text-[#2563FF] cursor-pointer hover:text-[#00A8FF] hover:underline bg-transparent border-none outline-none p-0 transition-colors duration-200"
            title="Select a different region in Bangalore"
          >
            Change Region &gt;
          </button>
        </div>

        {/* Vertical divider */}
        <div className="w-px h-8 bg-[rgba(80,130,255,0.2)]" />

        {/* Weather Section - Real-time Bangalore Telemetry */}
        <div 
          className="flex flex-col items-start gap-1 cursor-default group" 
          title={weather.lastUpdated ? `Live real-time weather in Bangalore (Updated at ${weather.lastUpdated.toLocaleTimeString()})` : "Live real-time weather in Bangalore"}
        >
          <div className="flex items-center gap-1.5">
            {renderWeatherIcon()}
            <span className="text-sm font-semibold text-white">
              {weather.temp !== null ? `${weather.temp}°C` : '--°C'}
            </span>
            {weather.isLoading && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping ml-0.5" title="Syncing..." />
            )}
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            {weather.condition}
          </span>
        </div>

        {/* Vertical divider */}
        <div className="w-px h-8 bg-[rgba(80,130,255,0.2)]" />

        {/* Time Section */}
        <div className="flex flex-col items-start gap-1 cursor-default" title="Current time">
          <span className="text-sm font-semibold text-white tabular-nums">{formatTime(currentTime)}</span>
          <span className="text-xs text-slate-400">{formatDate(currentTime)}</span>
        </div>

        {/* Vertical divider */}
        <div className="w-px h-8 bg-[rgba(80,130,255,0.2)]" />

        {/* Audio FX Toggle Button */}
        <button
          onClick={handleToggleAudio}
          className={`w-[34px] h-[34px] rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border outline-none ${
            isAudioMuted
              ? 'text-slate-500 bg-white/5 border-[rgba(80,130,255,0.15)] hover:text-slate-300 hover:bg-white/10'
              : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.25)] hover:bg-cyan-500/20'
          }`}
          title={isAudioMuted ? 'Unmute Futuristic Audio FX' : 'Mute Futuristic Audio FX'}
        >
          {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Voice Command Assistant Button */}
        <div className="relative">
          <button
            onClick={handleToggleVoice}
            className={`relative w-[34px] h-[34px] rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border outline-none ${
              voiceState === 'listening'
                ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white border-pink-400 shadow-[0_0_20px_rgba(233,70,255,0.6)] animate-pulse'
                : voiceState === 'processing'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                : 'text-slate-300 bg-white/5 border-[rgba(80,130,255,0.2)] hover:text-white hover:bg-white/10 hover:border-[rgba(80,130,255,0.4)]'
            }`}
            title="Speak voice command (e.g. 'Show Brigade Road tomorrow at 7 PM')"
          >
            {voiceState === 'listening' && (
              <span className="absolute -inset-1 rounded-xl bg-pink-500/30 animate-ping pointer-events-none" />
            )}
            <Mic size={16} className={voiceState === 'listening' ? 'animate-bounce' : ''} />
          </button>

          {/* Voice Transcript HUD Popover */}
          {(voiceState === 'listening' || voiceState === 'processing') && (
            <div 
              className="absolute right-0 top-12 z-50 rounded-xl px-4 py-2.5 border border-purple-500/40 shadow-2xl backdrop-blur-xl animate-count whitespace-nowrap min-w-[220px]"
              style={{
                background: 'rgba(7, 17, 38, 0.96)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.6), 0 0 25px rgba(233,70,255,0.3)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                  {voiceState === 'listening' ? 'Listening...' : 'Processing Query'}
                </span>
              </div>
              <p className="text-xs text-white font-medium max-w-xs truncate">
                {voiceTranscript ? `"${voiceTranscript}"` : 'Say "Show Brigade Road at 7 PM"...'}
              </p>
            </div>
          )}
        </div>

        {/* User Avatar with Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={onToggleUserMenu}
            className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-[#2563FF] to-[#6D4AFF] flex items-center justify-center ring-2 ring-[rgba(80,130,255,0.3)] ml-2 cursor-pointer border-none outline-none hover:ring-[rgba(80,130,255,0.6)] transition-all duration-200 hover:shadow-[0_0_15px_rgba(100,70,255,0.4)]"
          >
            <User size={18} className="text-white" />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-12 w-48 z-50 animate-count" style={{
              background: 'rgba(7,17,38,0.95)',
              border: '1px solid rgba(80,130,255,0.3)',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(70,70,255,0.1)',
              backdropFilter: 'blur(12px)',
              overflow: 'hidden',
            }}>
              <div className="px-4 py-3 border-b border-[rgba(80,130,255,0.15)]">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-slate-400">admin@parksight.ai</p>
              </div>
              <button
                onClick={() => onUserMenuAction('Notifications opened')}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-300 hover:bg-white/8 hover:text-white cursor-pointer bg-transparent border-none outline-none text-left transition-colors duration-150"
              >
                <Bell size={14} />
                Notifications
              </button>
              <button
                onClick={() => onUserMenuAction('Settings opened')}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-300 hover:bg-white/8 hover:text-white cursor-pointer bg-transparent border-none outline-none text-left transition-colors duration-150"
              >
                <Settings size={14} />
                Settings
              </button>
              <div className="border-t border-[rgba(80,130,255,0.15)]">
                <button
                  onClick={() => onUserMenuAction('Logged out')}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer bg-transparent border-none outline-none text-left transition-colors duration-150"
                >
                  <LogOut size={14} />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
