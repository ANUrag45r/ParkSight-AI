/* TopHeader v0.1: Navigation Bar and Real-Time Clock */
import { useState, useEffect, useRef } from 'react';
import { MapPin, CloudSun, User, LogOut, Settings, Bell } from 'lucide-react';

interface TopHeaderProps {
  onChangeCity: () => void;
  showUserMenu: boolean;
  onToggleUserMenu: () => void;
  onUserMenuAction: (action: string) => void;
  activeNav?: string;
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

const TopHeader = ({ onChangeCity, showUserMenu, onToggleUserMenu, onUserMenuAction, activeNav = 'home' }: TopHeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const menuRef = useRef<HTMLDivElement>(null);

  const { title, subtitle } = headerTitles[activeNav] || headerTitles.home;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
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
            onClick={onChangeCity}
            className="text-xs text-[#2563FF] cursor-pointer hover:text-[#00A8FF] hover:underline bg-transparent border-none outline-none p-0 transition-colors duration-200"
          >
            Change City &gt;
          </button>
        </div>

        {/* Vertical divider */}
        <div className="w-px h-8 bg-[rgba(80,130,255,0.2)]" />

        {/* Weather Section */}
        <div className="flex flex-col items-start gap-1 cursor-default" title="Current weather in Bangalore">
          <div className="flex items-center gap-1.5">
            <CloudSun size={18} className="text-yellow-400" />
            <span className="text-sm font-semibold text-white">28°C</span>
          </div>
          <span className="text-xs text-slate-400">Partly Cloudy</span>
        </div>

        {/* Vertical divider */}
        <div className="w-px h-8 bg-[rgba(80,130,255,0.2)]" />

        {/* Time Section */}
        <div className="flex flex-col items-start gap-1 cursor-default" title="Current time">
          <span className="text-sm font-semibold text-white tabular-nums">{formatTime(currentTime)}</span>
          <span className="text-xs text-slate-400">{formatDate(currentTime)}</span>
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
