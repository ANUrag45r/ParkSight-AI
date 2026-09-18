import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Cpu, 
  Calendar, 
  ArrowUpRight,
  ShieldAlert,
  Car
} from 'lucide-react';
import { locations } from '../data';

interface AnalyticsViewProps {
  onSelectHotspot: (locationId: string) => void;
  onNotification?: (msg: string) => void;
}

const hourlyDistribution = [
  { hour: '00:00', rate: 0.4, label: '12 AM' },
  { hour: '02:00', rate: 0.2, label: '2 AM' },
  { hour: '04:00', rate: 0.1, label: '4 AM' },
  { hour: '06:00', rate: 0.5, label: '6 AM' },
  { hour: '08:00', rate: 1.6, label: '8 AM' },
  { hour: '10:00', rate: 2.8, label: '10 AM' },
  { hour: '12:00', rate: 3.9, label: '12 PM', peak: true },
  { hour: '14:00', rate: 2.7, label: '2 PM' },
  { hour: '16:00', rate: 3.2, label: '4 PM' },
  { hour: '18:00', rate: 4.8, label: '6 PM', peak: true },
  { hour: '20:00', rate: 4.2, label: '8 PM', peak: true },
  { hour: '22:00', rate: 2.1, label: '10 PM' },
];

const dayOfWeekDistribution = [
  { day: 'Mon', rate: 2.6, violations: 1820 },
  { day: 'Tue', rate: 2.8, violations: 1940 },
  { day: 'Wed', rate: 2.7, violations: 1890 },
  { day: 'Thu', rate: 3.1, violations: 2150 },
  { day: 'Fri', rate: 4.5, violations: 3120, highlight: true },
  { day: 'Sat', rate: 4.9, violations: 3410, highlight: true },
  { day: 'Sun', rate: 3.6, violations: 2510 },
];

const violationTypes = [
  { type: 'No Parking Zone / Tow-Away', percentage: 52, color: '#FF3158', count: '5,820 incidents' },
  { type: 'Wrong-Way & Double Parking', percentage: 24, color: '#FF9F1C', count: '2,690 incidents' },
  { type: 'Footpath & Pedestrian Encroachment', percentage: 14, color: '#22D3EE', count: '1,570 incidents' },
  { type: 'Bus Lane / Hydrant Obstruction', percentage: 10, color: '#6D4AFF', count: '1,120 incidents' },
];

const AnalyticsView = ({ onSelectHotspot, onNotification }: AnalyticsViewProps) => {
  const [hoveredHour, setHoveredHour] = useState<typeof hourlyDistribution[0] | null>(null);

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 pb-6">
      {/* Top Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="text-[#2563FF]" size={22} />
            Parking Violation Spatiotemporal Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Derived from CatBoost Poisson regressor trained on Bangalore geohash grid
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            Model loss: <strong className="text-emerald-400">Poisson (0.4028)</strong>
          </span>
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Forecasted Today</span>
            <div className="w-8 h-8 rounded-lg bg-[rgba(37,99,255,0.15)] flex items-center justify-center text-[#2563FF]">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white tracking-tight">16,840</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
              <span>↑ 8.4%</span>
              <span className="text-slate-500">vs historical weekday mean</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Peak Risk Window</span>
            <div className="w-8 h-8 rounded-lg bg-[rgba(233,70,255,0.15)] flex items-center justify-center text-[#E946FF]">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white tracking-tight">17:00 – 21:00</div>
            <div className="text-[11px] text-[#E946FF] font-medium mt-0.5">
              Evening Commercial Rush (4.8 / hr)
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Critical Hotspot</span>
            <div className="w-8 h-8 rounded-lg bg-[rgba(255,49,88,0.15)] flex items-center justify-center text-[#FF3158]">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white tracking-tight">Brigade Road</div>
            <div className="text-[11px] text-red-400 font-medium mt-0.5">
              4.9 / hr • Geohash tdr1vcr
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Model Accuracy</span>
            <div className="w-8 h-8 rounded-lg bg-[rgba(34,211,238,0.15)] flex items-center justify-center text-[#22D3EE]">
              <Cpu size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white tracking-tight">94.2%</div>
            <div className="text-[11px] text-cyan-400 font-medium mt-0.5">
              Zero-Inflated Poisson Match
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid: Hourly Pattern + Day of Week */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hourly Distribution Chart (2 Cols) */}
        <div className="glass-card p-5 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                Hourly Violation Density (24-Hour Cycle)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated via CatBoost cyclical temporal features (hour_sin / hour_cos)
              </p>
            </div>
            {hoveredHour && (
              <div className="text-xs text-cyan-300 font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                {hoveredHour.label}: <strong>{hoveredHour.rate} violations/hr</strong>
              </div>
            )}
          </div>

          {/* Custom Stylized Futuristic Bar Chart */}
          <div className="flex-1 flex items-end gap-2 pt-6 pb-2 min-h-[160px] border-b border-[rgba(80,130,255,0.15)]">
            {hourlyDistribution.map((item) => {
              const heightPercent = (item.rate / 5.0) * 100;
              const isPeak = item.peak;
              return (
                <div 
                  key={item.hour}
                  className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer h-full justify-end"
                  onMouseEnter={() => setHoveredHour(item)}
                  onMouseLeave={() => setHoveredHour(null)}
                >
                  <div className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.rate}
                  </div>
                  <div 
                    className="w-full rounded-t-md transition-all duration-300 group-hover:brightness-125"
                    style={{
                      height: `${heightPercent}%`,
                      background: isPeak 
                        ? 'linear-gradient(to top, #6D4AFF, #FF3158)' 
                        : 'linear-gradient(to top, #162a56, #2563FF)',
                      boxShadow: isPeak 
                        ? '0 0 12px rgba(255,49,88,0.4)' 
                        : '0 0 8px rgba(37,99,255,0.2)',
                    }}
                  />
                  <span className="text-[10px] text-slate-400 font-medium group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#2563FF]" /> Normal hours
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#FF3158]" /> Peak violation window
              </span>
            </div>
            <span>Bangalore Metropolitan Traffic Police Data</span>
          </div>
        </div>

        {/* Day-of-Week Trends (1 Col) */}
        <div className="glass-card p-5 flex flex-col">
          <h3 className="text-sm font-bold text-white mb-1">
            Weekly Risk Distribution
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            day_sin / day_cos cyclical trend
          </p>

          <div className="flex-1 flex flex-col justify-between gap-2.5">
            {dayOfWeekDistribution.map((item) => {
              const widthPct = (item.rate / 5.2) * 100;
              return (
                <div key={item.day} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${item.highlight ? 'text-cyan-300' : 'text-slate-300'}`}>
                      {item.day}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.rate} / hr ({item.violations})
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[rgba(13,27,58,0.8)] rounded-full overflow-hidden border border-[rgba(80,130,255,0.1)]">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${widthPct}%`,
                        background: item.highlight 
                          ? 'linear-gradient(90deg, #6D4AFF, #E946FF)' 
                          : 'linear-gradient(90deg, #1d4ed8, #00A8FF)',
                        boxShadow: item.highlight ? '0 0 10px rgba(233,70,255,0.5)' : 'none',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Violation Categories & Top Hotspots Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Violation Type Categories */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              Top Violation Categories
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Historical distribution of approved tickets
            </p>
          </div>

          <div className="space-y-3.5">
            {violationTypes.map((item) => (
              <div key={item.type} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium">{item.type}</span>
                  <span className="font-bold text-white">{item.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[rgba(13,27,58,0.8)] overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                      boxShadow: `0 0 8px ${item.color}80`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-500">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Monitored Hotspots Table (2 cols) */}
        <div className="glass-card p-5 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                Critical Hotspot Ranking
              </h3>
              <p className="text-xs text-slate-400">
                Top Precision-7 Geohashes sorted by CatBoost Poisson rate
              </p>
            </div>
            <span className="text-xs text-cyan-400 font-medium">
              Top 5 Zones
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[rgba(80,130,255,0.15)] text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-2">Geohash (gh7)</th>
                  <th className="py-2.5 px-2">Hourly Rate</th>
                  <th className="py-2.5 px-2">Risk Tier</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(80,130,255,0.08)]">
                {locations.slice(0, 5).map((loc) => {
                  const isHigh = loc.predictedViolations >= 3.0;
                  return (
                    <tr key={loc.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                        <MapPin size={14} className={isHigh ? 'text-red-400' : 'text-blue-400'} />
                        <span>{loc.name}</span>
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-400 text-[11px]">
                        tdr1v{loc.id.slice(0, 2)}
                      </td>
                      <td className="py-3 px-2 font-bold text-white">
                        {loc.predictedViolations} / hr
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          loc.riskLevel === 'very-high'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : loc.riskLevel === 'high'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {loc.riskLevel.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            onSelectHotspot(loc.id);
                            onNotification?.(`Opening ${loc.name} in Predictor`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[rgba(37,99,255,0.2)] hover:bg-[rgba(37,99,255,0.4)] text-white text-[11px] font-medium border border-[rgba(80,130,255,0.3)] transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          Forecast <ArrowUpRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
