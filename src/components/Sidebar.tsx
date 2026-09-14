import { useState } from 'react';
import { Home, Crosshair, BarChart3, MapPin, FileText, Settings as SettingsIcon } from 'lucide-react';

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
}

const Sidebar = ({ activeNav, onNavChange }: SidebarProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside
      className="flex flex-col h-screen flex-shrink-0"
      style={{
        width: '260px',
        background: 'linear-gradient(to bottom, #050D1C, #020617)',
        borderRight: '1px solid rgba(80, 130, 255, 0.15)',
      }}
    >
      {/* Brand Section */}
      <div className="pt-6 px-5 flex flex-col gap-2">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavChange('home')}
        >
          {/* Logo SVG */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-300">
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
          <div>
            <h1 className="text-white text-lg font-semibold tracking-wide group-hover:text-cyan-300 transition-colors">ParkSight AI</h1>
          </div>
        </div>
        <p className="text-slate-400 text-xs">Smarter Parking. Safer Cities.</p>
      </div>

      {/* Navigation Section */}
      <nav className="mt-8 px-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          const isHovered = hoveredItem === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`flex items-center gap-3 py-2.5 px-4 rounded-xl cursor-pointer transition-all duration-200 w-full text-left border-none outline-none ${
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
              <Icon size={20} className={`transition-colors duration-200 ${isActive ? 'text-white' : isHovered ? 'text-slate-200' : ''}`} />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto flex flex-col pb-5">
        <div className="w-full h-20 relative overflow-hidden flex items-end">
          <svg 
            width="260" 
            height="80" 
            viewBox="0 0 260 80" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-0 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]"
          >
            <path 
              d="M0 80V60H15V45H30V70H45V30H60V50H75V25H90V55H105V20H125V10H140V35H155V15H170V40H185V25H200V60H215V35H230V65H245V45H260V80" 
              stroke="#22D3EE" 
              strokeWidth="1.5" 
              strokeLinejoin="round" 
              fill="rgba(37, 99, 255, 0.1)"
            />
            <path 
              d="M0 80V70H20V55H35V75H50V40H65V60H80V35H95V65H110V30H130V20H145V45H160V25H175V50H190V35H205V70H220V45H235V75H250V55H260V80" 
              stroke="rgba(37, 99, 255, 0.5)" 
              strokeWidth="1" 
              strokeLinejoin="round" 
            />
          </svg>
        </div>
        <div className="px-5 mt-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-300 text-sm font-medium">
            <MapPin size={16} className="text-cyan-400" />
            <span>Bangalore</span>
          </div>
          <p className="text-slate-500 text-xs leading-relaxed mt-1">
            Smarter decisions for<br />a better tomorrow.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
