import React, { useState } from 'react';
import { AlertTriangle, MapPin, Calendar, Clock, Cpu, Info, CheckCircle2, CloudRain, Bot } from 'lucide-react';
import { PredictionResult as PredictionResultType } from '../types';

interface PredictionResultProps {
  result: PredictionResultType | null;
  isLoading: boolean;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ result, isLoading }) => {
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="glass-card p-4 lg:p-5 flex flex-col md:flex-row items-center gap-5 w-full bg-[rgba(7,17,38,0.88)] border border-[rgba(80,130,255,0.22)] rounded-2xl shadow-xl relative">
      {isLoading ? (
        <div className="w-full flex items-center justify-center py-5">
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-14 h-14 rounded-full bg-[rgba(80,130,255,0.2)]"></div>
            <div className="space-y-2">
              <div className="h-4 w-40 bg-[rgba(80,130,255,0.2)] rounded"></div>
              <div className="h-8 w-24 bg-[rgba(80,130,255,0.2)] rounded"></div>
            </div>
            <div className="ml-8 text-xs text-cyan-400 font-mono flex items-center gap-2">
              <Cpu size={16} className="animate-spin text-cyan-400" />
              <span>Computing CatBoost Poisson Inference...</span>
            </div>
          </div>
        </div>
      ) : !result ? (
        <div className="w-full text-center py-6">
          <span className="text-sm text-slate-500">Click 'Predict Violations' to run the CatBoost model</span>
        </div>
      ) : (
        <>
          {/* Left: AI Badge + Predicted Violations Count */}
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div 
              className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6D4AFF] to-[#2563FF] flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: '0 0 25px rgba(100,70,255,0.5), 0 0 50px rgba(100,70,255,0.2)' }}
            >
              <span className="text-lg font-bold text-white tracking-wider">AI</span>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Predicted Parking Violations
              </div>
              <div className="text-[38px] lg:text-[42px] font-extrabold text-white leading-none mt-0.5 animate-count tracking-tight">
                {result.violations}
              </div>
              <div className="text-xs text-[#22D3EE] font-medium mt-1 flex items-center gap-1.5">
                <span>violations / hour</span>
                <span className="text-slate-500">•</span>
                <button
                  onClick={() => setShowFeatureModal(!showFeatureModal)}
                  className="text-[10px] text-slate-400 hover:text-cyan-300 underline bg-transparent border-none cursor-pointer p-0"
                >
                  {result.geohash ? `Geohash: ${result.geohash}` : '5 ML Features'}
                </button>
              </div>
            </div>

            {/* Risk Badge & Risk Guidance */}
            <div className="ml-2 flex flex-col items-start gap-1">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide
                ${(result.riskLevel === 'very-high' || result.riskLevel === 'high') 
                  ? 'bg-[rgba(255,49,88,0.18)] border border-[rgba(255,49,88,0.4)] text-[#FF3158] shadow-[0_0_12px_rgba(255,49,88,0.25)]' 
                  : result.riskLevel === 'medium'
                    ? 'bg-[rgba(255,159,28,0.18)] border border-[rgba(255,159,28,0.4)] text-[#FF9F1C] shadow-[0_0_12px_rgba(255,159,28,0.25)]'
                    : 'bg-[rgba(32,201,107,0.18)] border border-[rgba(32,201,107,0.4)] text-[#20C96B] shadow-[0_0_12px_rgba(32,201,107,0.25)]'
                }`}
              >
                <AlertTriangle size={13} />
                <span>{result.riskLabel}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 max-w-[260px] leading-snug">
                {result.message}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Threshold: 0-1.5 Low • 1.5-3.0 Med • 3.0+ High
              </div>
              
              {/* Weather Badge */}
              {result.weatherCondition === 'Rain' && (
                <div className="mt-1 flex items-center gap-1.5 px-2 py-1 bg-[rgba(56,189,248,0.15)] border border-[rgba(56,189,248,0.3)] rounded-md text-[#38BDF8] text-[10px] font-bold shadow-[0_0_8px_rgba(56,189,248,0.2)] animate-pulse">
                  <CloudRain size={12} />
                  <span>⚠️ Heavy Rain Detected: Choke Score multiplier (1.5x) activated.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Location, Date/Day, Time details */}
          <div className="md:ml-auto flex flex-wrap items-center gap-6 lg:gap-8 pt-3 md:pt-0 border-t md:border-t-0 border-[rgba(80,130,255,0.15)] w-full md:w-auto">
            {/* Location */}
            <div>
              <div className="flex items-center gap-1.5">
                <MapPin size={15} className="text-[#00A8FF]" />
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Location</span>
              </div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {result.location}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {result.geohash ? `gh7: ${result.geohash}` : result.area}
              </div>
            </div>
            
            <div className="hidden sm:block w-px h-10 bg-[rgba(80,130,255,0.15)]"></div>

            {/* Date & Day */}
            <div>
              <div className="flex items-center gap-1.5">
                <Calendar size={15} className="text-[#8B5CF6]" />
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Date & Day</span>
              </div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {result.date}
              </div>
              <div className="text-[11px] text-cyan-400 font-medium">
                {result.dayName || 'Day-of-Week'}
              </div>
            </div>

            <div className="hidden sm:block w-px h-10 bg-[rgba(80,130,255,0.15)]"></div>

            {/* Time */}
            <div>
              <div className="flex items-center gap-1.5">
                <Clock size={15} className="text-[#22D3EE]" />
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Time</span>
              </div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {result.time}
              </div>
              <div className="text-[11px] text-slate-400">
                1-Hour Horizon
              </div>
            </div>
          </div>

          {/* Model Features Details Popover */}
          {showFeatureModal && result.featuresUsed && (
            <div 
              className="absolute right-4 bottom-20 z-50 p-4 rounded-xl border border-[rgba(80,130,255,0.3)] shadow-2xl backdrop-blur-xl animate-count max-w-sm"
              style={{ background: 'rgba(7, 17, 38, 0.98)' }}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[rgba(80,130,255,0.15)]">
                <div className="flex items-center gap-2">
                  <Cpu size={15} className="text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">CatBoost 5-Feature Vector</span>
                </div>
                <button 
                  onClick={() => setShowFeatureModal(false)}
                  className="text-xs text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">1. geohash:</span>
                  <span className="text-emerald-400 font-bold">{result.featuresUsed.geohash}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">2. hour_sin:</span>
                  <span className="text-cyan-300 font-bold">{result.featuresUsed.hour_sin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">3. hour_cos:</span>
                  <span className="text-cyan-300 font-bold">{result.featuresUsed.hour_cos}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">4. day_sin:</span>
                  <span className="text-purple-300 font-bold">{result.featuresUsed.day_sin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">5. day_cos:</span>
                  <span className="text-purple-300 font-bold">{result.featuresUsed.day_cos}</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[rgba(80,130,255,0.15)] flex items-center justify-between text-[10px] text-slate-400">
                <span>Model: {result.modelType || 'CatBoost Poisson'}</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Active
                </span>
              </div>
            </div>
          )}
        </>
      )}
      </div>

      {/* Tactical Briefing Box */}
      {!isLoading && result && result.tacticalBriefing && (
        <div className="glass-card p-4 w-full bg-gradient-to-r from-[rgba(10,20,45,0.95)] to-[rgba(7,17,38,0.95)] border-l-4 border-l-[#6D4AFF] border-[rgba(80,130,255,0.22)] rounded-xl shadow-[0_4px_25px_rgba(100,70,255,0.15)] relative overflow-hidden animate-fade-in-up">
          <div className="flex gap-4 items-start">
            <div className="mt-1 p-2 bg-[rgba(109,74,255,0.2)] rounded-full shadow-[0_0_15px_rgba(109,74,255,0.4)]">
              <Bot size={20} className="text-[#8B5CF6]" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider mb-1 flex items-center gap-2">
                Dispatch Copilot
                <span className="px-1.5 py-0.5 rounded bg-[rgba(34,211,238,0.15)] text-[9px] text-[#22D3EE] border border-[rgba(34,211,238,0.3)]">Gemini AI</span>
              </div>
              <div className="text-sm text-white font-medium leading-relaxed" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                {result.tacticalBriefing}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionResult;
