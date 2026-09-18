import { useState, useMemo } from 'react';
import { MapPin, Search, ArrowUpRight, X } from 'lucide-react';
import { locations } from '../data';

interface LocationSelectorProps {
  selectedLocation: string;
  onLocationChange: (locationId: string) => void;
  onViewOnMap?: () => void;
}

const LocationSelector = ({
  selectedLocation,
  onLocationChange,
  onViewOnMap,
}: LocationSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const selectedLoc = locations.find(l => l.id === selectedLocation) || locations[0];

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations;
    const q = searchQuery.toLowerCase();
    return locations.filter(l => 
      l.name.toLowerCase().includes(q) || l.area.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleReset = () => {
    setSearchQuery('');
    onLocationChange('mg-road');
  };

  const handleSearchFocus = () => {
    setIsFocused(true);
    setShowDropdown(true);
  };

  const handleSearchBlur = () => {
    setIsFocused(false);
    // Delay closing so click on dropdown item registers
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-[#2563FF]" />
          <span className="text-sm font-semibold text-white">Select Location</span>
        </div>
        <button 
          onClick={handleReset} 
          className="text-xs text-slate-400 hover:text-white cursor-pointer bg-transparent border-none outline-none transition-colors duration-200 hover:underline"
        >
          Reset
        </button>
      </div>

      <div className="relative mt-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white bg-transparent border-none cursor-pointer outline-none transition-colors"
          >
            <X size={14} />
          </button>
        )}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          placeholder="Search for a place..."
          className="w-full bg-[rgba(13,27,58,0.8)] border rounded-xl py-2 pl-9 pr-8 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
          style={{
            borderColor: isFocused ? 'rgba(80,130,255,0.5)' : 'rgba(80,130,255,0.15)',
            boxShadow: isFocused ? '0 0 12px rgba(37,99,255,0.15)' : 'none',
          }}
        />

        {/* Search Results Dropdown */}
        {showDropdown && (
          <div className="absolute z-50 w-full mt-1 max-h-44 overflow-y-auto animate-count" style={{
            background: 'rgba(7,17,38,0.95)',
            border: '1px solid rgba(80,130,255,0.25)',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)',
          }}>
            {filteredLocations.length === 0 ? (
              <div className="px-3 py-3 text-sm text-slate-500 text-center">No locations found</div>
            ) : (
              filteredLocations.map(loc => (
                <button
                  key={loc.id}
                  onMouseDown={(e) => e.preventDefault()} 
                  onClick={() => {
                    onLocationChange(loc.id);
                    setSearchQuery('');
                    setShowDropdown(false);
                  }}
                  className={`w-full px-3 py-2.5 text-sm flex items-center gap-2.5 cursor-pointer bg-transparent border-none outline-none text-left transition-all duration-150 ${
                    loc.id === selectedLocation
                      ? 'text-white bg-[rgba(37,99,255,0.15)]'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <MapPin size={13} className={loc.id === selectedLocation ? 'text-[#20C96B]' : 'text-slate-500'} />
                  <div>
                    <span className="block">{loc.name}, {loc.area}</span>
                    <span className="text-[10px] text-slate-500">{loc.lat.toFixed(4)}° N, {loc.lng.toFixed(4)}° E</span>
                  </div>
                  {loc.id === selectedLocation && (
                    <span className="ml-auto text-[10px] text-[#20C96B] font-medium">Selected</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      <div className="mt-3 bg-[rgba(13,27,58,0.6)] rounded-xl p-3 transition-all duration-300">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-[#20C96B]" />
          <span className="text-sm font-medium text-white">{selectedLoc.name}, {selectedLoc.area}</span>
        </div>
        <div className="text-xs text-slate-500 ml-6 mt-1">
          {selectedLoc.lat.toFixed(4)}° N, {selectedLoc.lng.toFixed(4)}° E
        </div>
      </div>

      {/* Location Preview */}
      <div className="mt-3 rounded-xl overflow-hidden h-[100px] relative group cursor-pointer" onClick={onViewOnMap}>
        <div 
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
          style={{
            background: `
              linear-gradient(135deg, #0a1628 0%, #162040 30%, #1a2d55 60%, #0d1929 100%),
              radial-gradient(circle at 30% 50%, rgba(37,99,255,0.15) 0%, transparent 60%),
              radial-gradient(circle at 70% 30%, rgba(109,74,255,0.1) 0%, transparent 50%)
            `,
          }}
        >
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 300 100" preserveAspectRatio="none">
            <rect x="20" y="30" width="12" height="70" fill="#1a3060" />
            <rect x="36" y="45" width="10" height="55" fill="#1a3060" />
            <rect x="50" y="20" width="15" height="80" fill="#152a50" />
            <rect x="70" y="50" width="8" height="50" fill="#1a3060" />
            <rect x="82" y="35" width="18" height="65" fill="#152a50" />
            <rect x="105" y="15" width="12" height="85" fill="#1a3060" />
            <rect x="122" y="40" width="14" height="60" fill="#152a50" />
            <rect x="140" y="25" width="20" height="75" fill="#1a3060" />
            <rect x="165" y="50" width="10" height="50" fill="#152a50" />
            <rect x="180" y="30" width="16" height="70" fill="#1a3060" />
            <rect x="200" y="45" width="12" height="55" fill="#152a50" />
            <rect x="218" y="20" width="14" height="80" fill="#1a3060" />
            <rect x="238" y="35" width="18" height="65" fill="#152a50" />
            <rect x="260" y="40" width="10" height="60" fill="#1a3060" />
            <rect x="275" y="25" width="15" height="75" fill="#152a50" />
            <rect x="52" y="25" width="3" height="2" fill="#22D3EE" opacity="0.4" />
            <rect x="56" y="35" width="3" height="2" fill="#2563FF" opacity="0.3" />
            <rect x="107" y="25" width="3" height="2" fill="#22D3EE" opacity="0.4" />
            <rect x="145" y="35" width="3" height="2" fill="#6D4AFF" opacity="0.3" />
            <rect x="222" y="30" width="3" height="2" fill="#22D3EE" opacity="0.4" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B18] via-transparent to-transparent" />
        <div className="absolute bottom-0 w-full flex items-center justify-between px-3 py-2 group-hover:bg-white/5 transition-colors duration-200">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-white" />
            <span className="text-xs text-white group-hover:text-cyan-300 transition-colors">View on Map</span>
          </div>
          <ArrowUpRight size={12} className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
