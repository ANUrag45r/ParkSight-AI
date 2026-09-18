import { useState, useEffect, useRef } from 'react';
import { Play, Pause, FastForward, Clock, Moon, Sun, Sunset, Sunrise } from 'lucide-react';
import { audioFx } from '../utils/audioFx';

interface TimeLapsePlayerProps {
  currentHour: number;
  onHourChange: (hour: number) => void;
  onNotification?: (msg: string) => void;
}

const speeds = [
  { label: '1x', delay: 1100 },
  { label: '2x', delay: 550 },
  { label: '4x', delay: 280 },
];

export const TimeLapsePlayer = ({
  currentHour,
  onHourChange,
  onNotification,
}: TimeLapsePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0); // 0=1x, 1=2x, 2=4x
  const timerRef = useRef<number | null>(null);
  const currentHourRef = useRef(currentHour);

  useEffect(() => {
    currentHourRef.current = currentHour;
  }, [currentHour]);

  const activeSpeed = speeds[speedIndex];

  // Play / Pause timer effect
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      const next = (currentHourRef.current + 1) % 24;
      onHourChange(next);
    }, activeSpeed.delay);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, activeSpeed, onHourChange]);

  const togglePlay = () => {
    audioFx.playClick();
    const next = !isPlaying;
    setIsPlaying(next);
    onNotification?.(next ? 'Starting 24h Violation Time-Lapse' : 'Paused Time-Lapse');
  };

  const cycleSpeed = () => {
    audioFx.playClick();
    const next = (speedIndex + 1) % speeds.length;
    setSpeedIndex(next);
    onNotification?.(`Playback Speed: ${speeds[next].label}`);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    audioFx.playClick();
    onHourChange(val);
  };

  // Format hour (0-23) to 12-hour AM/PM label
  const formatHourLabel = (h: number) => {
    const meridiem = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH < 10 ? '0' : ''}${displayH}:00 ${meridiem}`;
  };

  // Get diurnal icon based on hour
  const getDiurnalIcon = (h: number) => {
    if (h >= 5 && h < 8) return <Sunrise size={14} className="text-amber-300" />;
    if (h >= 8 && h < 17) return <Sun size={14} className="text-yellow-400" />;
    if (h >= 17 && h < 20) return <Sunset size={14} className="text-orange-400" />;
    return <Moon size={14} className="text-cyan-300" />;
  };

  // Check if hour is peak violation time (18:00 - 20:00)
  const isPeakHour = currentHour >= 17 && currentHour <= 20;

  return (
    <div 
      className="rounded-xl px-3.5 py-2.5 border border-[rgba(80,130,255,0.25)] shadow-2xl backdrop-blur-md flex flex-col gap-2 transition-all duration-300"
      style={{
        background: 'rgba(7, 17, 38, 0.94)',
        boxShadow: isPeakHour 
          ? '0 0 25px rgba(233,70,255,0.3), 0 10px 30px rgba(0,0,0,0.5)' 
          : '0 10px 30px rgba(0,0,0,0.5)',
      }}
    >
      {/* Top Row: Title, Diurnal Icon, Time Display, Speed & Play Controls */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Time display & Icon */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-[rgba(80,130,255,0.12)] border border-[rgba(80,130,255,0.2)]">
            {getDiurnalIcon(currentHour)}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Clock size={10} className="text-cyan-400" />
              24h Time-Lapse
            </span>
            <span className="text-xs font-bold text-white tabular-nums tracking-wide">
              {formatHourLabel(currentHour)}
              {isPeakHour && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                  PEAK
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Right: Controls (Play/Pause & Speed) */}
        <div className="flex items-center gap-1.5">
          {/* Speed Toggle */}
          <button
            onClick={cycleSpeed}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white border border-[rgba(80,130,255,0.2)] hover:bg-white/10 transition-colors cursor-pointer outline-none"
            title="Change Playback Speed (1x, 2x, 4x)"
          >
            <FastForward size={11} className="text-cyan-400" />
            <span>{activeSpeed.label}</span>
          </button>

          {/* Play / Pause Button */}
          <button
            onClick={togglePlay}
            className={`w-[32px] h-[32px] rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer outline-none ${
              isPlaying
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-gradient-to-br from-[#2563FF] to-[#6D4AFF] text-white shadow-[0_0_15px_rgba(100,70,255,0.35)] hover:scale-105'
            }`}
            title={isPlaying ? 'Pause 24h Time-Lapse' : 'Play 24h Time-Lapse'}
          >
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Row: 24-Hour Scrubber Track */}
      <div className="flex flex-col gap-1 w-full">
        <div className="relative flex items-center w-full">
          <input
            type="range"
            min="0"
            max="23"
            step="1"
            value={currentHour}
            onChange={handleSliderChange}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[#0e1d3d] accent-[#E946FF] focus:outline-none"
            style={{
              background: `linear-gradient(to right, #2563FF 0%, #E946FF ${(currentHour / 23) * 100}%, #0e1d3d ${(currentHour / 23) * 100}%, #0e1d3d 100%)`,
            }}
          />
        </div>

        {/* Milestone Hour Indicators */}
        <div className="flex justify-between text-[9px] text-slate-500 font-mono select-none px-0.5">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span className="text-red-400 font-bold">18:00</span>
          <span>23:00</span>
        </div>
      </div>
    </div>
  );
};
export default TimeLapsePlayer;
