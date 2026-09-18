import { useState } from 'react';
import { 
  Home, 
  Crosshair, 
  BarChart3, 
  MapPin, 
  FileText, 
  Settings as SettingsIcon,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'predictor', label: 'Predictor', icon: Crosshair },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'hotspots', label: 'Hotspots', icon: MapPin },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

interface SidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar = ({ activeNav, onNavChange, isCollapsed: propCollapsed, onToggleCollapse }: SidebarProps) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isCollapsed = propCollapsed !== undefined ? propCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(prev => !prev);
    }
  };

  return (
    <aside
      className="flex flex-col h-screen flex-shrink-0 select-none overflow-x-hidden transition-all duration-300 ease-in-out relative z-30"
      style={{
        width: isCollapsed ? '72px' : '260px',
        background: 'linear-gradient(to bottom, #050D1C, #020617)',
        borderRight: '1px solid rgba(80, 130, 255, 0.15)',
      }}
    >
      {/* Brand Section */}
      <div className={`pt-5 pb-1 transition-all duration-300 ${isCollapsed ? 'px-2 flex flex-col items-center gap-3' : 'px-4'}`}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer group min-w-0"
              onClick={() => onNavChange('home')}
            >
              {/* Logo SVG */}
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-300">
                <path d="M16 2L28.1244 9V23L16 30L3.87564 23V9L16 2Z" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 2V16M28.1244 9L16 16M3.87564 9L16 16M16 30V16" stroke="url(#paint1_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="paint0_linear" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#22D3EE" />
                    <stop offset="1" stopColor="#6D4AFF" />
                  </linearGradient>
                  <linearGradient id="paint1_linear" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563FF" />
                    <stop offset="1" stopColor="#22D3EE" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="min-w-0">
                <h1 className="text-white text-base font-semibold tracking-wide group-hover:text-cyan-300 transition-colors truncate">ParkSight AI</h1>
                <p className="text-slate-400 text-[11px] truncate">Smarter Parking. Safer Cities.</p>
              </div>
            </div>
            {/* Collapse Toggle Button */}
            <button
              type="button"
              onClick={handleToggle}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors border-none outline-none cursor-pointer flex items-center justify-center flex-shrink-0 ml-1"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5 w-full">
            <div 
              className="cursor-pointer group flex items-center justify-center p-1"
              onClick={() => onNavChange('home')}
              title="ParkSight AI"
            >
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-300">
                <path d="M16 2L28.1244 9V23L16 30L3.87564 23V9L16 2Z" stroke="url(#paint0_linear_mini)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 2V16M28.1244 9L16 16M3.87564 9L16 16M16 30V16" stroke="url(#paint1_linear_mini)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="paint0_linear_mini" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#22D3EE" />
                    <stop offset="1" stopColor="#6D4AFF" />
                  </linearGradient>
                  <linearGradient id="paint1_linear_mini" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563FF" />
                    <stop offset="1" stopColor="#22D3EE" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {/* Expand Toggle Button */}
            <button
              type="button"
              onClick={handleToggle}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors border-none outline-none cursor-pointer flex items-center justify-center"
              title="Expand sidebar"
            >
              <PanelLeftOpen size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Section */}
      <nav className={`mt-6 flex flex-col gap-1.5 ${isCollapsed ? 'px-2 items-center' : 'px-3'}`}>
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          const isHovered = hoveredItem === item.id;
          const Icon = item.icon;
          
          if (isCollapsed) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavChange(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                title={item.label}
                className={`relative flex items-center justify-center w-11 h-11 rounded-xl cursor-pointer transition-all duration-200 border-none outline-none group ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-100'
                }`}
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, #2563FF, #6D4AFF)',
                        boxShadow: '0 0 18px rgba(70,70,255,0.35)',
                      }
                    : {
                        background: isHovered ? 'rgba(255,255,255,0.08)' : 'transparent',
                      }
                }
              >
                <Icon size={19} className={`transition-colors duration-200 ${isActive ? 'text-white' : isHovered ? 'text-slate-200' : ''}`} />
                {isActive && (
                  <span className="absolute -right-0.5 top-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22D3EE]" />
                )}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavChange(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`flex items-center gap-3 py-2.5 px-3.5 rounded-xl cursor-pointer transition-all duration-200 w-full text-left border-none outline-none ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #2563FF, #6D4AFF)',
                      boxShadow: '0 0 20px rgba(70,70,255,0.3)',
                    }
                  : {
                      background: isHovered ? 'rgba(255,255,255,0.06)' : 'transparent',
                    }
              }
            >
              <Icon size={19} className={`flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-white' : isHovered ? 'text-slate-200' : ''}`} />
              <span className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      {isCollapsed ? (
        <div className="mt-auto pb-6 flex flex-col items-center justify-center">
          <div 
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-pointer hover:bg-emerald-500/20 transition-all shadow-[0_0_12px_rgba(16,185,129,0.15)]"
            title="Bangalore Smart Patrol Active (LIVE)"
          >
            <span className="relative flex h-2.5 w-2.5 mb-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <span className="text-[9px] font-extrabold tracking-wider text-emerald-400">LIVE</span>
          </div>
        </div>
      ) : (
        <div className="mt-auto flex flex-col pb-4">
          <div className="w-full h-28 relative overflow-hidden flex items-end border-b border-[rgba(80,130,255,0.15)] bg-gradient-to-t from-[#050D20] to-transparent">
          <svg 
            width="260" 
            height="110" 
            viewBox="0 0 260 110" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto drop-shadow-[0_0_12px_rgba(34,211,238,0.25)] select-none"
          >
            <defs>
              {/* Building Gradient */}
              <linearGradient id="cyberBuilding1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0E214A" />
                <stop offset="100%" stopColor="#060D1E" />
              </linearGradient>
              <linearGradient id="cyberBuilding2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#12285C" />
                <stop offset="100%" stopColor="#081126" />
              </linearGradient>
              <linearGradient id="glassSkybridge" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(34, 211, 238, 0.4)" />
                <stop offset="50%" stopColor="rgba(109, 74, 255, 0.5)" />
                <stop offset="100%" stopColor="rgba(34, 211, 238, 0.4)" />
              </linearGradient>
              {/* Headlight Projection Cone */}
              <linearGradient id="headlightBeam" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(34, 211, 238, 0.65)" />
                <stop offset="40%" stopColor="rgba(34, 211, 238, 0.25)" />
                <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
              </linearGradient>
              {/* Tail-light Glow Trail */}
              <linearGradient id="tailLightTrail" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="rgba(255, 49, 88, 0.8)" />
                <stop offset="100%" stopColor="rgba(255, 49, 88, 0)" />
              </linearGradient>
            </defs>

            {/* Background Sky Stars */}
            <circle cx="20" cy="15" r="0.8" fill="#fff" opacity="0.6" />
            <circle cx="65" cy="8" r="0.8" fill="#22D3EE" opacity="0.7" />
            <circle cx="150" cy="12" r="1" fill="#fff" opacity="0.8" />
            <circle cx="210" cy="10" r="0.8" fill="#6D4AFF" opacity="0.7" />
            <circle cx="240" cy="18" r="0.8" fill="#22D3EE" opacity="0.5" />

            {/* Skyscraper Silhouettes (Background Layer) */}
            <rect x="22" y="32" width="28" height="52" fill="url(#cyberBuilding1)" stroke="rgba(80, 130, 255, 0.25)" strokeWidth="0.7" />
            <rect x="68" y="24" width="34" height="60" fill="url(#cyberBuilding1)" stroke="rgba(80, 130, 255, 0.3)" strokeWidth="0.7" />
            <rect x="145" y="28" width="30" height="56" fill="url(#cyberBuilding1)" stroke="rgba(80, 130, 255, 0.25)" strokeWidth="0.7" />
            <rect x="215" y="36" width="32" height="48" fill="url(#cyberBuilding1)" stroke="rgba(80, 130, 255, 0.25)" strokeWidth="0.7" />

            {/* Foreground Skyscraper 1 (Left Tech Tower) */}
            <rect x="6" y="40" width="30" height="44" fill="url(#cyberBuilding2)" stroke="#2563FF" strokeWidth="1" />
            {/* Spire on Tower 1 */}
            <line x1="21" y1="40" x2="21" y2="24" stroke="#22D3EE" strokeWidth="1.2" />
            <circle cx="21" cy="24" r="2" fill="#22D3EE" className="animate-beacon-pulse" />
            {/* Windows on Tower 1 */}
            <rect x="11" y="46" width="4" height="3" rx="0.5" fill="#22D3EE" opacity="0.8" />
            <rect x="21" y="46" width="4" height="3" rx="0.5" fill="#22D3EE" opacity="0.8" />
            <rect x="11" y="54" width="4" height="3" rx="0.5" fill="#22D3EE" opacity="0.4" className="animate-window-pulse" />
            <rect x="21" y="54" width="4" height="3" rx="0.5" fill="#22D3EE" opacity="0.9" />
            <rect x="11" y="62" width="4" height="3" rx="0.5" fill="#F59E0B" opacity="0.7" />
            <rect x="21" y="62" width="4" height="3" rx="0.5" fill="#22D3EE" opacity="0.8" />
            <rect x="11" y="70" width="4" height="3" rx="0.5" fill="#22D3EE" opacity="0.8" />
            <rect x="21" y="70" width="4" height="3" rx="0.5" fill="#22D3EE" opacity="0.4" className="animate-window-pulse" />

            {/* Foreground Skyscraper 2 (Slanted Roof Cyber Center) */}
            <path d="M48 84V35L76 22V84H48Z" fill="url(#cyberBuilding2)" stroke="#22D3EE" strokeWidth="1" />
            {/* Vertical glowing data conduit */}
            <line x1="62" y1="34" x2="62" y2="84" stroke="rgba(34, 211, 238, 0.7)" strokeWidth="1" strokeDasharray="3 3" />
            <rect x="52" y="42" width="5" height="3" rx="0.5" fill="#22D3EE" opacity="0.9" />
            <rect x="67" y="42" width="5" height="3" rx="0.5" fill="#22D3EE" opacity="0.4" />
            <rect x="52" y="52" width="5" height="3" rx="0.5" fill="#22D3EE" opacity="0.8" />
            <rect x="67" y="52" width="5" height="3" rx="0.5" fill="#F59E0B" opacity="0.85" className="animate-window-pulse" />
            <rect x="52" y="62" width="5" height="3" rx="0.5" fill="#22D3EE" opacity="0.4" />
            <rect x="67" y="62" width="5" height="3" rx="0.5" fill="#22D3EE" opacity="0.9" />
            <rect x="52" y="72" width="5" height="3" rx="0.5" fill="#22D3EE" opacity="0.85" />
            <rect x="67" y="72" width="5" height="3" rx="0.5" fill="#22D3EE" opacity="0.85" />

            {/* Foreground Skyscraper 3 (Central Mega-Tower with Spire) */}
            <rect x="94" y="16" width="38" height="68" fill="url(#cyberBuilding2)" stroke="#6D4AFF" strokeWidth="1.2" />
            {/* High-tech Rooftop Spire & Beacon */}
            <line x1="113" y1="16" x2="113" y2="4" stroke="#22D3EE" strokeWidth="1.5" />
            <circle cx="113" cy="4" r="2.5" fill="#FF3158" className="animate-beacon-pulse" />
            {/* Windows grid on Central Tower */}
            <rect x="100" y="24" width="6" height="3" rx="0.5" fill="#22D3EE" opacity="0.9" />
            <rect x="110" y="24" width="6" height="3" rx="0.5" fill="#22D3EE" opacity="0.9" />
            <rect x="120" y="24" width="6" height="3" rx="0.5" fill="#F59E0B" opacity="0.8" />
            <rect x="100" y="32" width="6" height="3" rx="0.5" fill="#22D3EE" opacity="0.4" className="animate-window-pulse" />
            <rect x="110" y="32" width="6" height="3" rx="0.5" fill="#22D3EE" opacity="0.85" />
            <rect x="120" y="32" width="6" height="3" rx="0.5" fill="#22D3EE" opacity="0.4" />
            <rect x="100" y="40" width="6" height="3" rx="0.5" fill="#22D3EE" opacity="0.9" />
            <rect x="110" y="40" width="6" height="3" rx="0.5" fill="#F59E0B" opacity="0.8" />
            <rect x="120" y="40" width="6" height="3" rx="0.5" fill="#22D3EE" opacity="0.9" />
            <rect x="100" y="48" width="6" height="3" rx="0.5" fill="#22D3EE" opacity="0.4" />
            <rect x="110" y="48" width="6" height="3" rx="0.5" fill="#22D3EE" opacity="0.9" className="animate-window-pulse" />
            <rect x="120" y="48" width="6" height="3" rx="0.5" fill="#22D3EE" opacity="0.8" />
            <rect x="100" y="56" width="6" height="3" rx="0.5" fill="#22D3EE" opacity="0.8" />
            <rect x="110" y="56" width="6" height="3" rx="0.5" fill="#22D3EE" opacity="0.4" />
            <rect x="120" y="56" width="6" height="3" rx="0.5" fill="#22D3EE" opacity="0.9" />

            {/* Glowing Skybridge between Tower 3 & Tower 4 */}
            <rect x="132" y="44" width="26" height="5" rx="1.5" fill="url(#glassSkybridge)" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="0.8" />

            {/* Foreground Skyscraper 4 (Right Tower) */}
            <rect x="156" y="30" width="34" height="54" fill="url(#cyberBuilding2)" stroke="#2563FF" strokeWidth="1" />
            <line x1="173" y1="30" x2="173" y2="18" stroke="#22D3EE" strokeWidth="1.2" />
            <circle cx="173" cy="18" r="1.8" fill="#22D3EE" className="animate-beacon-pulse" />
            <rect x="162" y="38" width="5" height="3" rx="0.5" fill="#22D3EE" opacity="0.8" />
            <rect x="177" y="38" width="5" height="3" rx="0.5" fill="#22D3EE" opacity="0.9" />
            <rect x="162" y="48" width="5" height="3" rx="0.5" fill="#F59E0B" opacity="0.7" className="animate-window-pulse" />
            <rect x="177" y="48" width="5" height="3" rx="0.5" fill="#22D3EE" opacity="0.4" />
            <rect x="162" y="58" width="5" height="3" rx="0.5" fill="#22D3EE" opacity="0.9" />
            <rect x="177" y="58" width="5" height="3" rx="0.5" fill="#22D3EE" opacity="0.85" />
            <rect x="162" y="68" width="5" height="3" rx="0.5" fill="#22D3EE" opacity="0.4" />
            <rect x="177" y="68" width="5" height="3" rx="0.5" fill="#22D3EE" opacity="0.9" />

            {/* Foreground Skyscraper 5 (Far Right) */}
            <path d="M200 84V42L228 32V84H200Z" fill="url(#cyberBuilding2)" stroke="#22D3EE" strokeWidth="0.9" />
            <rect x="206" y="50" width="4" height="3" rx="0.5" fill="#22D3EE" opacity="0.8" />
            <rect x="216" y="50" width="4" height="3" rx="0.5" fill="#22D3EE" opacity="0.4" />
            <rect x="206" y="60" width="4" height="3" rx="0.5" fill="#F59E0B" opacity="0.75" />
            <rect x="216" y="60" width="4" height="3" rx="0.5" fill="#22D3EE" opacity="0.85" className="animate-window-pulse" />

            {/* Cyber City Roadway */}
            <rect x="0" y="84" width="260" height="26" fill="#050B18" />
            {/* Top Curb Neon Edge */}
            <line x1="0" y1="84" x2="260" y2="84" stroke="rgba(34, 211, 238, 0.45)" strokeWidth="1" />
            {/* Animated Road Dash Lane Line */}
            <line 
              x1="0" 
              y1="96" 
              x2="260" 
              y2="96" 
              stroke="rgba(34, 211, 238, 0.85)" 
              strokeWidth="1.2" 
              strokeDasharray="8 8" 
              className="animate-road-flow" 
            />

            {/* ANIMATED SMART PATROL CYBER CAR */}
            <g className="animate-car-cruise">
              <g className="animate-car-bob">
                {/* Glowing Forward Headlight Beam Cone (Cyan beam projecting forward) */}
                <polygon 
                  points="38,92 72,85 72,103 38,96" 
                  fill="url(#headlightBeam)" 
                />

                {/* Red Tail-Light Motion Trail (Extending behind car to the left) */}
                <rect x="-14" y="91" width="14" height="2" fill="url(#tailLightTrail)" />

                {/* Cyber Car Chassis Body - Oriented forward (long hood on right, sleek cabin, short trunk on left) */}
                <path 
                  d="M0 94 L3 90 H6 L12 86 H22 L28 90 H37 L40 94 L38 97 H2 L0 94Z" 
                  fill="#0B1A3B" 
                  stroke="#22D3EE" 
                  strokeWidth="0.8" 
                />

                {/* Holographic Windshield Glass (Cabin windshield & rear window) */}
                <polygon points="7,89.5 12.5,86.5 21.5,86.5 27,89.5" fill="rgba(34, 211, 238, 0.5)" />

                {/* Cyber Patrol Rooftop Lightbar (Dual-tone flashing: red rear, cyan front) */}
                <rect x="15" y="84" width="5" height="1.8" rx="0.5" fill="#22D3EE" className="animate-ping" />
                <rect x="15" y="84" width="2.5" height="1.8" fill="#FF3158" />
                <rect x="17.5" y="84" width="2.5" height="1.8" fill="#22D3EE" />

                {/* Front Headlight LED (Cyan forward headlight) */}
                <circle cx="39" cy="93.5" r="1.2" fill="#22D3EE" />
                <circle cx="39" cy="93.5" r="2.5" fill="rgba(34, 211, 238, 0.6)" className="animate-pulse" />

                {/* Rear Tail Light LED (Red tail light) */}
                <rect x="0" y="91" width="1.5" height="3" rx="0.5" fill="#FF3158" />

                {/* Aerodynamic Side Neon Accent Line */}
                <line x1="6" y1="94" x2="34" y2="94" stroke="#2563FF" strokeWidth="0.8" />

                {/* Rear Cyber Wheel */}
                <circle cx="9" cy="97" r="3.2" fill="#050B18" stroke="#22D3EE" strokeWidth="0.9" />
                <circle cx="9" cy="97" r="1.2" fill="#22D3EE" />

                {/* Front Cyber Wheel */}
                <circle cx="31" cy="97" r="3.2" fill="#050B18" stroke="#22D3EE" strokeWidth="0.9" />
                <circle cx="31" cy="97" r="1.2" fill="#22D3EE" />
              </g>
            </g>
          </svg>
        </div>

        <div className="px-5 mt-3 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-200 text-xs font-semibold">
              <MapPin size={14} className="text-cyan-400" />
              <span>Bangalore</span>
            </div>
            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed mt-0.5">
            Smart-City Patrol Fleet Active.<br />
            <span className="text-[10px] text-slate-500">Autonomous surveillance & AI dispatch.</span>
          </p>
        </div>
      </div>
      )}
    </aside>
  );
};

export default Sidebar;
