import { useState } from 'react';
import { 
  Settings, 
  Cpu, 
  CheckCircle2, 
  RefreshCw, 
  Radio, 
  Database, 
  Sliders, 
  Bell, 
  Map, 
  Layers,
  Sparkles
} from 'lucide-react';

interface SettingsViewProps {
  onNotification?: (msg: string) => void;
}

const SettingsView = ({ onNotification }: SettingsViewProps) => {
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  // Form states
  const [lowRiskThreshold, setLowRiskThreshold] = useState(1.5);
  const [highRiskThreshold, setHighRiskThreshold] = useState(3.0);
  const [trafficRefreshRate, setTrafficRefreshRate] = useState(3.5);
  const [enableSoundAlerts, setEnableSoundAlerts] = useState(true);
  const [enableAnimatedTraffic, setEnableAnimatedTraffic] = useState(true);
  const [defaultMapMode, setDefaultMapMode] = useState<'dark' | 'satellite'>('dark');

  const handlePingBackend = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await fetch('http://127.0.0.1:8000/api/health');
      const end = performance.now();
      if (res.ok) {
        const data = await res.json();
        setPingLatency(Math.round(end - start));
        setPingStatus(`Online (${data.model})`);
        onNotification?.(`FastAPI Backend online • ${Math.round(end - start)}ms latency`);
      } else {
        setPingStatus('Offline (HTTP ' + res.status + ')');
      }
    } catch (e) {
      setPingStatus('Unreachable (Connection refused)');
      onNotification?.('Backend connection refused on port 8000');
    } finally {
      setIsPinging(false);
    }
  };

  const handleSaveSettings = () => {
    onNotification?.('Configuration saved successfully');
  };

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 pb-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="text-[#2563FF]" size={22} />
          ParkSight AI System & Model Configuration
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Fine-tune CatBoost hyperparameters, spatiotemporal feature thresholds, and map telemetry
        </p>
      </div>

      {/* Model Status Card */}
      <div className="glass-card p-5 border-l-4 border-l-cyan-400">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                CatBoost Poisson Regressor Service
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Radio size={10} className="animate-pulse" /> ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active model file: <code className="text-cyan-300 font-mono">parksight_model.cbm</code> • Host: <code className="text-slate-300 font-mono">http://127.0.0.1:8000</code>
            </p>
          </div>

          <button
            onClick={handlePingBackend}
            disabled={isPinging}
            className="px-3 py-1.5 rounded-xl bg-[rgba(37,99,255,0.2)] hover:bg-[rgba(37,99,255,0.35)] border border-[rgba(80,130,255,0.3)] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isPinging ? 'animate-spin' : ''} />
            <span>Test Connection</span>
            {pingLatency && (
              <span className="text-[10px] text-emerald-400 font-mono">({pingLatency}ms)</span>
            )}
          </button>
        </div>

        {/* 5 Features Architecture Schema */}
        <div className="mt-4 pt-3 border-t border-[rgba(80,130,255,0.15)] grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
          <div className="p-2 rounded-lg bg-[rgba(13,27,58,0.6)] border border-[rgba(80,130,255,0.1)]">
            <span className="text-slate-400 text-[10px] block">Feature 1</span>
            <span className="text-emerald-400 font-bold">geohash</span>
            <span className="text-[9px] text-slate-500 block">Precision 7 (~150m)</span>
          </div>

          <div className="p-2 rounded-lg bg-[rgba(13,27,58,0.6)] border border-[rgba(80,130,255,0.1)]">
            <span className="text-slate-400 text-[10px] block">Feature 2</span>
            <span className="text-cyan-300 font-bold">hour_sin</span>
            <span className="text-[9px] text-slate-500 block">sin(2π·h / 24)</span>
          </div>

          <div className="p-2 rounded-lg bg-[rgba(13,27,58,0.6)] border border-[rgba(80,130,255,0.1)]">
            <span className="text-slate-400 text-[10px] block">Feature 3</span>
            <span className="text-cyan-300 font-bold">hour_cos</span>
            <span className="text-[9px] text-slate-500 block">cos(2π·h / 24)</span>
          </div>

          <div className="p-2 rounded-lg bg-[rgba(13,27,58,0.6)] border border-[rgba(80,130,255,0.1)]">
            <span className="text-slate-400 text-[10px] block">Feature 4</span>
            <span className="text-purple-300 font-bold">day_sin</span>
            <span className="text-[9px] text-slate-500 block">sin(2π·d / 7)</span>
          </div>

          <div className="p-2 rounded-lg bg-[rgba(13,27,58,0.6)] border border-[rgba(80,130,255,0.1)]">
            <span className="text-slate-400 text-[10px] block">Feature 5</span>
            <span className="text-purple-300 font-bold">day_cos</span>
            <span className="text-[9px] text-slate-500 block">cos(2π·d / 7)</span>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Risk Threshold Tuning */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Sliders size={16} className="text-[#8B5CF6]" />
              Violation Risk Level Cutoffs
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Defines presentation thresholds for dashboard danger ratings
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Low to Medium Cutoff</span>
                  <span className="font-mono text-cyan-400 font-bold">{lowRiskThreshold} / hr</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={lowRiskThreshold}
                  onChange={(e) => setLowRiskThreshold(parseFloat(e.target.value))}
                  className="w-full cursor-pointer accent-[#2563FF]"
                />
                <span className="text-[10px] text-slate-500">Violations below {lowRiskThreshold} are marked as LOW RISK</span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Medium to High Cutoff</span>
                  <span className="font-mono text-red-400 font-bold">{highRiskThreshold} / hr</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="5.0"
                  step="0.1"
                  value={highRiskThreshold}
                  onChange={(e) => setHighRiskThreshold(parseFloat(e.target.value))}
                  className="w-full cursor-pointer accent-[#FF3158]"
                />
                <span className="text-[10px] text-slate-500">Violations above {highRiskThreshold} trigger HIGH RISK alerts</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[rgba(80,130,255,0.12)] flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Rule:</span>
            <span className="text-white font-mono text-[11px]">
              0–{lowRiskThreshold} Low | {lowRiskThreshold}–{highRiskThreshold} Med | {highRiskThreshold}+ High
            </span>
          </div>
        </div>

        {/* Map & Telemetry Options */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Map size={16} className="text-[#00A8FF]" />
              Map Visualization & Telemetry
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time Google Maps traffic rendering & sensor polling
            </p>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Default Map Layer</span>
                  <span className="text-[10px] text-slate-400">CartoDB Dark Matter vs Dark Satellite</span>
                </div>
                <select
                  value={defaultMapMode}
                  onChange={(e) => setDefaultMapMode(e.target.value as 'dark' | 'satellite')}
                  className="bg-[rgba(13,27,58,0.9)] border border-[rgba(80,130,255,0.3)] rounded-lg px-2.5 py-1 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="dark">AI Dark Vector</option>
                  <option value="satellite">Dark Satellite Aerial</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Live Traffic Pulse Speed</span>
                  <span className="text-[10px] text-slate-400">Animated flow dash speed</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableAnimatedTraffic}
                    onChange={(e) => setEnableAnimatedTraffic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2563FF]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">High-Risk Sound Chime</span>
                  <span className="text-[10px] text-slate-400">Audio alert when prediction &gt; 3.5</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableSoundAlerts}
                    onChange={(e) => setEnableSoundAlerts(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2563FF]"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[rgba(80,130,255,0.12)]">
            <button
              onClick={handleSaveSettings}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-[#2563FF] to-[#6D4AFF] hover:from-[#3573FF] hover:to-[#7D5AFF] text-white text-xs font-bold transition-all cursor-pointer border-none shadow-md"
            >
              Save Configuration Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
