import { useState, useRef, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  CalendarDays,
  Check
} from 'lucide-react';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onNotification?: (msg: string) => void;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DateSelector = ({ selectedDate, onDateChange, onNotification }: DateSelectorProps) => {
  // Calendar browsing state (month/year currently viewed)
  const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const nativeDateInputRef = useRef<HTMLInputElement>(null);

  // Sync viewDate when selectedDate changes (e.g. from Today or external change)
  useEffect(() => {
    setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (y: number, m: number) => {
    return new Date(y, m, 1).getDay();
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (targetYear: number, targetMonth: number, targetDay: number) => {
    const newDate = new Date(targetYear, targetMonth, targetDay);
    onDateChange(newDate);
    setViewDate(new Date(targetYear, targetMonth, 1));
    
    const formatted = `${targetDay} ${monthNames[targetMonth].slice(0, 3)} ${targetYear}`;
    onNotification?.(`Selected Date: ${formatted}`);
  };

  const handleToday = () => {
    const today = new Date();
    handleSelectDay(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const handleTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    handleSelectDay(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
  };

  // Format the selected date for display
  const formatSelectedDisplay = (d: Date) => {
    const day = d.getDate();
    const m = monthNames[d.getMonth()].slice(0, 3);
    const y = d.getFullYear();
    const weekday = daysOfWeek[d.getDay()];
    return `${day} ${m} ${y} (${weekday})`;
  };

  // Native input change handler for fallback
  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [y, m, d] = e.target.value.split('-').map(Number);
    if (y && m && d) {
      handleSelectDay(y, m - 1, d);
    }
  };

  // Generate 42 calendar grid cells (6 weeks)
  const renderCalendarDays = () => {
    const daysInCurrentMonth = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    
    const cells = [];

    // 1. Previous month trailing days (now interactive!)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDayNumber = daysInPrevMonth - i;
      const prevMonthIndex = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      
      cells.push(
        <button
          key={`prev-${prevDayNumber}`}
          onClick={() => handleSelectDay(prevYear, prevMonthIndex, prevDayNumber)}
          className="w-full aspect-square flex items-center justify-center text-xs rounded-full text-slate-600 hover:text-slate-300 hover:bg-white/5 cursor-pointer border-none bg-transparent outline-none transition-all duration-150"
          title={`Select ${prevDayNumber} ${monthNames[prevMonthIndex]} ${prevYear}`}
        >
          {prevDayNumber}
        </button>
      );
    }

    // 2. Current month days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const isSelected = 
        selectedDate.getDate() === dayNum && 
        selectedDate.getMonth() === month && 
        selectedDate.getFullYear() === year;

      const today = new Date();
      const isToday = 
        today.getDate() === dayNum && 
        today.getMonth() === month && 
        today.getFullYear() === year;

      cells.push(
        <button
          key={`curr-${dayNum}`}
          onClick={() => handleSelectDay(year, month, dayNum)}
          className={`w-full aspect-square flex items-center justify-center text-xs rounded-full cursor-pointer transition-all duration-200 border-none outline-none font-medium ${
            isSelected
              ? 'text-white font-bold scale-105 shadow-[0_0_16px_rgba(109,74,255,0.7),0_0_28px_rgba(37,99,255,0.4)]'
              : 'text-slate-200 hover:bg-white/10 hover:text-white hover:scale-110 bg-transparent'
          } ${
            isToday && !isSelected ? 'ring-1.5 ring-[#22D3EE] text-[#22D3EE]' : ''
          }`}
          style={
            isSelected
              ? { background: 'linear-gradient(135deg, #6D4AFF, #2563FF)' }
              : {}
          }
          title={`Click to select ${dayNum} ${monthNames[month]} ${year}`}
        >
          {dayNum}
        </button>
      );
    }

    // 3. Next month leading days (interactive!)
    const remainingDays = 42 - cells.length;
    for (let nextDayNum = 1; nextDayNum <= remainingDays; nextDayNum++) {
      const nextMonthIndex = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;

      cells.push(
        <button
          key={`next-${nextDayNum}`}
          onClick={() => handleSelectDay(nextYear, nextMonthIndex, nextDayNum)}
          className="w-full aspect-square flex items-center justify-center text-xs rounded-full text-slate-600 hover:text-slate-300 hover:bg-white/5 cursor-pointer border-none bg-transparent outline-none transition-all duration-150"
          title={`Select ${nextDayNum} ${monthNames[nextMonthIndex]} ${nextYear}`}
        >
          {nextDayNum}
        </button>
      );
    }

    return cells;
  };

  // Convert selectedDate to YYYY-MM-DD for native input
  const nativeInputValue = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  return (
    <div className="glass-card p-4 relative">
      {/* Hidden Native Date Input for fallback */}
      <input
        type="date"
        ref={nativeDateInputRef}
        value={nativeInputValue}
        onChange={handleNativeDateChange}
        className="sr-only"
        tabIndex={-1}
      />

      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className="text-[#2563FF]" />
          <span className="text-sm font-semibold text-white">Select Date</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleToday}
            className="text-[11px] font-medium px-2 py-0.5 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-white/5 bg-transparent border-none cursor-pointer outline-none transition-all"
          >
            Today
          </button>
          <button 
            onClick={handleTomorrow}
            className="text-[11px] font-medium px-2 py-0.5 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-white/5 bg-transparent border-none cursor-pointer outline-none transition-all"
          >
            Tomorrow
          </button>
        </div>
      </div>

      {/* Prominent Selected Date Display Bar (Like LocationSelector and TimeSelector) */}
      <div 
        onClick={() => nativeDateInputRef.current?.showPicker?.()}
        className="mt-3 bg-[rgba(13,27,58,0.7)] border border-[rgba(80,130,255,0.2)] hover:border-[rgba(80,130,255,0.4)] rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer transition-all duration-200 group shadow-sm"
        title="Click to open system date picker or click any day below"
      >
        <div className="flex items-center gap-2.5">
          <CalendarDays size={15} className="text-[#00A8FF] group-hover:drop-shadow-[0_0_6px_rgba(0,168,255,0.6)] transition-all" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Date</span>
            <span className="text-xs font-semibold text-white tracking-wide">
              {formatSelectedDisplay(selectedDate)}
            </span>
          </div>
        </div>
        <span className="text-[10px] text-cyan-400 font-medium group-hover:underline">Change &gt;</span>
      </div>

      {/* Month & Year Navigation Header */}
      <div className="mt-3 flex items-center justify-between">
        <button 
          onClick={handlePrevMonth} 
          className="text-slate-400 hover:text-white hover:bg-white/10 bg-transparent border-none cursor-pointer p-1.5 rounded-lg transition-all duration-200 outline-none"
          title="Previous Month"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Clickable Month/Year to toggle fast dropdown */}
        <button
          onClick={() => setShowMonthYearPicker(!showMonthYearPicker)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold text-white hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer outline-none"
          title="Jump to Month / Year"
        >
          <span>{monthNames[month]} {year}</span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${showMonthYearPicker ? 'rotate-180' : ''}`} />
        </button>

        <button 
          onClick={handleNextMonth} 
          className="text-slate-400 hover:text-white hover:bg-white/10 bg-transparent border-none cursor-pointer p-1.5 rounded-lg transition-all duration-200 outline-none"
          title="Next Month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Quick Month & Year Picker Dropdown */}
      {showMonthYearPicker && (
        <div 
          className="absolute left-4 right-4 z-50 mt-1 p-3 rounded-xl border border-[rgba(80,130,255,0.3)] shadow-2xl backdrop-blur-xl animate-count"
          style={{ background: 'rgba(7, 17, 38, 0.98)' }}
        >
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[rgba(80,130,255,0.15)]">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Jump to Month</span>
            {/* Year Selector */}
            <select
              value={year}
              onChange={(e) => setViewDate(new Date(Number(e.target.value), month, 1))}
              className="bg-[rgba(13,27,58,0.9)] border border-[rgba(80,130,255,0.3)] rounded-lg px-2 py-0.5 text-xs text-white outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y} className="bg-[#071126] text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {monthNames.map((mName, idx) => {
              const isCurrMonth = idx === month;
              return (
                <button
                  key={mName}
                  onClick={() => {
                    setViewDate(new Date(year, idx, 1));
                    setShowMonthYearPicker(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium cursor-pointer border-none outline-none transition-all ${
                    isCurrMonth
                      ? 'bg-gradient-to-r from-[#6D4AFF] to-[#2563FF] text-white font-bold shadow-md'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white bg-transparent'
                  }`}
                >
                  {mName.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Day of Week Labels */}
      <div className="mt-2 grid grid-cols-7 gap-1">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-[10px] font-semibold text-slate-500 text-center py-1 select-none">
            {day}
          </div>
        ))}
      </div>

      {/* 42 Calendar Day Grid Cells */}
      <div className="grid grid-cols-7 gap-1 mt-1">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default DateSelector;
