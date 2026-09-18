import { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp, Check } from 'lucide-react';

interface TimeSelectorProps {
  selectedTime: string;
  onTimeChange: (time: string) => void;
}

const TimeSelector = ({ selectedTime, onTimeChange }: TimeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const generateTimeOptions = () => {
    const options = [];
    let hour = 6;
    let minute = 0;

    while (hour < 24) {
      const isPM = hour >= 12;
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      const ampm = isPM ? 'PM' : 'AM';
      const timeString = `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
      options.push(timeString);
      
      minute += 30;
      if (minute === 60) {
        minute = 0;
        hour += 1;
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Scroll to selected time when dropdown opens
  useEffect(() => {
    if (isOpen && selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [isOpen]);

  return (
    <div className="glass-card p-4 relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-[#2563FF]" />
        <span className="text-sm font-semibold text-white">Select Time</span>
      </div>

      <div className="mt-3 relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-xl py-2.5 px-3 flex items-center gap-3 cursor-pointer border-none outline-none transition-all duration-200 text-left"
          style={{
            background: 'rgba(13,27,58,0.8)',
            border: `1px solid ${isOpen ? 'rgba(80,130,255,0.4)' : 'rgba(80,130,255,0.15)'}`,
            boxShadow: isOpen ? '0 0 12px rgba(37,99,255,0.15)' : 'none',
          }}
        >
          <Clock size={16} className="text-[#22D3EE]" style={{ filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.5))' }} />
          <span className="text-sm font-medium text-white flex-1">{selectedTime || '06:00 PM'}</span>
          {isOpen ? (
            <ChevronUp size={14} className="text-slate-400 transition-transform" />
          ) : (
            <ChevronDown size={14} className="text-slate-400 transition-transform" />
          )}
        </button>

        {isOpen && (
          <div 
            className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto animate-count"
            style={{
              background: 'rgba(7,17,38,0.95)',
              border: '1px solid rgba(80,130,255,0.25)',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {timeOptions.map((time) => {
              const isSelected = time === selectedTime;
              return (
                <button
                  key={time}
                  ref={isSelected ? selectedRef : undefined}
                  onClick={() => {
                    onTimeChange(time);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-sm flex items-center cursor-pointer bg-transparent border-none outline-none text-left transition-all duration-150 ${
                    isSelected
                      ? 'text-white bg-[rgba(37,99,255,0.15)]'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <span className="flex-1">{time}</span>
                  {isSelected && <Check size={14} className="text-[#22D3EE]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSelector;
