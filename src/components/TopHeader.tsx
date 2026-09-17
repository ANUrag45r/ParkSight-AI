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
  Mic,
  Search,
  Sparkles,
  Send,
  X,
  AlertCircle,
  CheckCircle2,
  Radio
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

const sampleCommands = [
  "Show Brigade Road tomorrow at 7 PM",
  "Show Koramangala at 8 PM",
  "Show Commercial Street at 6 PM",
  "Open Bangalore hotspots",
  "Show analytics dashboard",
];

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
  const [inputQuery, setInputQuery] = useState('');
  const [lastExecutedText, setLastExecutedText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Subscribe to Audio FX mute state
  useEffect(() => {
    return audioFx.subscribe((muted) => setIsAudioMuted(muted));
  }, []);

  // Subscribe to Voice Commander state & actions
  useEffect(() => {
    const unsubState = voiceCommander.onStateChange((state, transcript) => {
      setVoiceState(state);
      if (state === 'error') {
        setErrorMessage(transcript || 'Microphone error');
      } else if (state === 'listening' || state === 'processing' || state === 'success') {
        setErrorMessage(null);
        if (transcript) {
          setInputQuery(transcript);
        }
      }
      if (transcript !== undefined) {
        setVoiceTranscript(transcript);
      }
    });

    const unsubCmd = voiceCommander.onCommand((cmd) => {
      const recognized = cmd.rawTranscript || cmd.summary;
      setLastExecutedText(recognized);
      setInputQuery(cmd.rawTranscript || cmd.summary);
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
    onNotification?.(
      next
        ? 'Tactile SFX Muted'
        : 'Tactile SFX Active. (To capture voice, use the 🎙️ Voice Command bar below)'
    );
  };

  const handleToggleVoice = async () => {
    if (voiceState === 'listening') {
      voiceCommander.stopListening();
    } else {
      audioFx.playClick();
      setErrorMessage(null);
      await voiceCommander.startListening();
    }
  };

  const handleManualSubmit = (queryToRun?: string) => {
    const q = queryToRun ?? inputQuery;
    if (!q.trim()) return;
    audioFx.playClick();
    setInputQuery(q);
    voiceCommander.manualExecute(q.trim());
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

  const getGreeting = (date: Date): string => {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning,';
    if (hour >= 12 && hour < 17) return 'Good Afternoon,';
    if (hour >= 17 && hour < 22) return 'Good Evening,';
    return 'Good Night,';
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Top Row: Greeting on left, Weather / Time / SFX / User on right */}
      <div className="flex items-start justify-between w-full">
        {/* Left Side */}
        <div className="flex flex-col">
          <p className="text-sm text-slate-400 font-normal">{getGreeting(currentTime)}</p>
          <h1 className="text-2xl font-semibold text-white mt-1">{title}</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-lg whitespace-pre-line">
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

          {/* Tactile SFX Audio Toggle Button (Clear label so never confused with voice) */}
          <button
            onClick={handleToggleAudio}
            className={`px-2.5 h-[34px] rounded-xl flex items-center gap-1.5 transition-all duration-200 cursor-pointer border outline-none ${
              isAudioMuted
                ? 'text-slate-500 bg-white/5 border-[rgba(80,130,255,0.15)] hover:text-slate-300 hover:bg-white/10'
                : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.25)] hover:bg-cyan-500/20'
            }`}
            title={isAudioMuted ? 'Unmute Tactile SFX Audio' : 'Mute Tactile SFX Audio (Sound effects only — to speak commands, click the 🎙️ Voice Command bar)'}
          >
            {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span className="text-[10px] font-bold tracking-wider uppercase">SFX</span>
          </button>

          {/* User Avatar with Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={onToggleUserMenu}
              className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-[#2563FF] to-[#6D4AFF] flex items-center justify-center ring-2 ring-[rgba(80,130,255,0.3)] ml-1 cursor-pointer border-none outline-none hover:ring-[rgba(80,130,255,0.6)] transition-all duration-200 hover:shadow-[0_0_15px_rgba(100,70,255,0.4)]"
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

      {/* Futuristic Voice Command & Natural Language Query Search Bar */}
      <div 
        className={`w-full bg-[rgba(7,17,38,0.88)] border rounded-2xl px-4 py-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.3)] backdrop-blur-xl flex flex-col gap-2 transition-all duration-300 ${
          voiceState === 'listening'
            ? 'border-pink-500/60 shadow-[0_0_25px_rgba(233,70,255,0.25)] ring-1 ring-pink-500/40'
            : 'border-[rgba(80,130,255,0.22)]'
        }`}
      >
        <div className="flex items-center gap-2.5 w-full">
          {/* Prominent Voice Capture Button */}
          <button
            onClick={handleToggleVoice}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer border outline-none transition-all duration-200 select-none flex-shrink-0 ${
              voiceState === 'listening'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-400 shadow-[0_0_20px_rgba(233,70,255,0.6)] animate-pulse'
                : voiceState === 'requesting'
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 animate-pulse'
                : voiceState === 'processing'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                : 'bg-white/8 text-slate-200 border-[rgba(80,130,255,0.25)] hover:bg-white/15 hover:text-white hover:border-cyan-400'
            }`}
            title="Click to speak your command into microphone"
          >
            <Mic size={15} className={voiceState === 'listening' ? 'animate-bounce text-white' : 'text-cyan-400'} />
            <span>
              {voiceState === 'listening'
                ? 'Listening... (Click to Stop)'
                : voiceState === 'requesting'
                ? 'Connecting Mic...'
                : voiceState === 'processing'
                ? 'Analyzing...'
                : 'Voice Command'}
            </span>
            {voiceState === 'listening' && (
              <span className="flex items-center gap-0.5 ml-1">
                <span className="w-1 h-3 bg-white rounded-full animate-pulse" />
                <span className="w-1 h-4 bg-white rounded-full animate-pulse delay-75" />
                <span className="w-1 h-2 bg-white rounded-full animate-pulse delay-150" />
              </span>
            )}
          </button>

          {/* Search & Spoken Text Live Input */}
          <div className="relative flex-1 flex items-center">
            <Search size={14} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleManualSubmit();
              }}
              placeholder={
                voiceState === 'listening'
                  ? '🎙️ Listening to your voice... Speak command (e.g. "Show Brigade Road tomorrow at 7 PM")'
                  : voiceState === 'requesting'
                  ? 'Requesting microphone permission in your browser...'
                  : 'Ask AI or speak: "Show Brigade Road tomorrow at 7 PM", "Koramangala at 8 PM", "Show analytics"...'
              }
              className={`w-full pl-9 pr-20 py-2 rounded-xl text-xs bg-[#050D20] text-white placeholder:text-slate-500 border transition-all outline-none ${
                voiceState === 'listening'
                  ? 'border-pink-500/80 shadow-[0_0_15px_rgba(233,70,255,0.25)] font-semibold text-pink-200'
                  : 'border-[rgba(80,130,255,0.2)] focus:border-cyan-400'
              }`}
            />
            {inputQuery && (
              <button
                onClick={() => {
                  setInputQuery('');
                  setErrorMessage(null);
                  setLastExecutedText('');
                }}
                className="absolute right-14 text-slate-400 hover:text-white p-1 cursor-pointer bg-transparent border-none outline-none"
                title="Clear"
              >
                <X size={13} />
              </button>
            )}
            <button
              onClick={() => handleManualSubmit()}
              disabled={!inputQuery.trim()}
              className="absolute right-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#2563FF] to-[#6D4AFF] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 cursor-pointer transition-opacity flex items-center gap-1 border-none outline-none"
              title="Execute query"
            >
              <Send size={11} />
              <span>Run</span>
            </button>
          </div>
        </div>

        {/* Bottom Helper Bar: Error alert, Live spoken status, or Clickable Sample Commands */}
        <div className="flex items-center justify-between gap-2 text-[11px] px-1 flex-wrap">
          {errorMessage && !inputQuery.trim() ? (
            <div className="flex items-center gap-2 text-red-400 font-medium flex-wrap">
              <div className="flex items-center gap-1.5">
                <AlertCircle size={13} className="flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={handleToggleVoice}
                className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 cursor-pointer transition-colors outline-none flex items-center gap-1"
              >
                <span>Retry Voice ↻</span>
              </button>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400 hidden sm:inline">Or click to run:</span>
              <div className="flex items-center gap-1 flex-wrap">
                {sampleCommands.slice(0, 3).map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleManualSubmit(cmd)}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] cursor-pointer transition-colors outline-none"
                  >
                    "{cmd}"
                  </button>
                ))}
              </div>
            </div>
          ) : voiceState === 'listening' ? (
            <div className="flex items-center gap-1.5 text-pink-400 font-medium animate-pulse">
              <Radio size={13} />
              <span>
                {inputQuery ? `Speaking: "${inputQuery}"` : 'Awaiting speech — start speaking now into your mic...'}
              </span>
            </div>
          ) : voiceState === 'success' || lastExecutedText || inputQuery.trim() ? (
            <div className="flex items-center gap-2 text-emerald-400 font-medium flex-wrap">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span className="truncate max-w-lg">
                  Voice captured: "{lastExecutedText || inputQuery}"
                </span>
              </div>
              <button
                onClick={() => handleManualSubmit()}
                className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 cursor-pointer transition-colors outline-none"
              >
                Execute Forecast ➔
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400 flex-wrap">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <Sparkles size={11} className="text-cyan-400" />
                Try speaking:
              </span>
              {sampleCommands.map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => handleManualSubmit(cmd)}
                  className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/15 text-slate-300 hover:text-cyan-300 border border-[rgba(80,130,255,0.15)] hover:border-cyan-500/30 transition-colors cursor-pointer text-[10px] outline-none"
                >
                  "{cmd}"
                </button>
              ))}
            </div>
          )}

          {/* Engine Status Indicator */}
          <div className="flex items-center gap-1 text-[10px] text-slate-400 ml-auto">
            <span className={`w-1.5 h-1.5 rounded-full ${voiceState === 'listening' ? 'bg-pink-400 animate-ping' : 'bg-emerald-400'}`} />
            <span>Web Speech API Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
