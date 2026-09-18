import { useState } from 'react';
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Share2, 
  Printer, 
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

interface ReportsViewProps {
  onNotification?: (msg: string) => void;
}

const auditLogs = [
  { id: 'INC-9041', time: '18:14', location: 'Brigade Road', geohash: 'tdr1vcr', type: 'No Parking / Tow-Away', status: 'Enforced', officer: 'Traffic Patrol #12' },
  { id: 'INC-9040', time: '18:02', location: 'MG Road Metro', geohash: 'tdr1v9q', type: 'Bus Stop Encroachment', status: 'Enforced', officer: 'CCTV Auto-Challan' },
  { id: 'INC-9039', time: '17:48', location: 'Commercial Street', geohash: 'tdr1vf2', type: 'Double Parking Blockade', status: 'Pending Tow', officer: 'Tow Truck Unit B' },
  { id: 'INC-9038', time: '17:35', location: 'UB City Curb', geohash: 'tdr1v88', type: 'Unauthorized Valet Staging', status: 'Warning', officer: 'Traffic Patrol #04' },
  { id: 'INC-9037', time: '17:15', location: 'Residency Road', geohash: 'tdr1vbf', type: 'Footpath Parking', status: 'Enforced', officer: 'CCTV Auto-Challan' },
  { id: 'INC-9036', time: '16:50', location: 'Church Street', geohash: 'tdr1vc4', type: 'Pedestrian Walkway Block', status: 'Enforced', officer: 'Beat Officer #08' },
];

const reportsList = [
  {
    id: 'REP-2025-09-16',
    title: 'Daily Bangalore CBD Parking Violation Forecast',
    date: '16 Sep 2025',
    category: 'Daily Dispatch',
    size: '1.4 MB',
    status: 'Ready'
  },
  {
    id: 'REP-2025-W37',
    title: 'Weekend Nightlife High-Risk Zones (Brigade & Church St)',
    date: '14 Sep 2025',
    category: 'Weekend Analysis',
    size: '2.8 MB',
    status: 'Ready'
  },
  {
    id: 'REP-2025-MODEL',
    title: 'CatBoost Poisson Model Accuracy & Drift Audit',
    date: '10 Sep 2025',
    category: 'ML Performance',
    size: '850 KB',
    status: 'Verified'
  },
];

const ReportsView = ({ onNotification }: ReportsViewProps) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'enforced' | 'pending'>('all');

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Incident ID,Time,Location,Geohash,Violation Type,Status,Enforcement Unit\n" +
      auditLogs.map(e => `${e.id},${e.time},"${e.location}",${e.geohash},"${e.type}",${e.status},"${e.officer}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ParkSight_Violation_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotification?.('Exported CSV Audit Report successfully');
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ParkSight_Violations_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onNotification?.('Exported JSON Dataset successfully');
  };

  const filteredLogs = auditLogs.filter(log => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'enforced') return log.status === 'Enforced';
    if (selectedFilter === 'pending') return log.status === 'Pending Tow';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="text-[#6D4AFF]" size={22} />
            Smart-City Enforcement & Violation Reports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated intelligence reports, patrol dispatch recommendations, and telemetry audit logs
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-[rgba(37,99,255,0.2)] hover:bg-[rgba(37,99,255,0.35)] border border-[rgba(80,130,255,0.3)] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-xl bg-[rgba(109,74,255,0.2)] hover:bg-[rgba(109,74,255,0.35)] border border-[rgba(109,74,255,0.3)] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download size={14} className="text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* AI Recommendations Banner */}
      <div className="glass-card p-4 border-l-4 border-l-[#2563FF] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={16} className="text-cyan-400" />
            AI Patrol Dispatch Directives (Bangalore Traffic Police)
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Updated 10m ago</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-[rgba(13,27,58,0.7)] border border-[rgba(80,130,255,0.15)] flex flex-col justify-between">
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-1">
              <span>🚨 Critical Tow Unit Deployment</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Deploy 2 additional towing vehicles along Brigade Road from 18:30 to 21:00 to avert complete traffic bottleneck.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[rgba(13,27,58,0.7)] border border-[rgba(80,130,255,0.15)] flex flex-col justify-between">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
              <span>⚠️ Commercial St Freight Window</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Shift commercial unloading permits to 07:00–09:00 AM to eliminate the 52% midday loading bay obstruction rate.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[rgba(13,27,58,0.7)] border border-[rgba(80,130,255,0.15)] flex flex-col justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
              <span>💡 Pedestrian Boulevard Compliance</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Church Street weekend vehicle restriction achieved 94% compliance; recommend replicating along Commercial St.
            </p>
          </div>
        </div>
      </div>

      {/* Available Intelligence Reports */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-white mb-3">
          Generated Audit Reports
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {reportsList.map((rep) => (
            <div 
              key={rep.id} 
              className="p-3.5 rounded-xl bg-[rgba(13,27,58,0.7)] border border-[rgba(80,130,255,0.15)] hover:border-cyan-400/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                  <span className="font-mono text-cyan-400">{rep.id}</span>
                  <span>{rep.size}</span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {rep.title}
                </h4>
              </div>

              <div className="mt-3 pt-2 border-t border-[rgba(80,130,255,0.1)] flex items-center justify-between">
                <span className="text-[10px] text-slate-400">{rep.date}</span>
                <button
                  onClick={handleExportCSV}
                  className="text-xs text-[#2563FF] hover:text-cyan-300 font-medium flex items-center gap-1 bg-transparent border-none cursor-pointer p-0"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Enforcement Incident Log */}
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              Live Violation Detection & Enforcement Log
            </h3>
            <p className="text-xs text-slate-400">
              Real-time feed from verified traffic cameras and automated challan nodes
            </p>
          </div>

          <div className="flex items-center gap-1">
            {(['all', 'enforced', 'pending'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border-none outline-none transition-all ${
                  selectedFilter === filter
                    ? 'bg-[rgba(37,99,255,0.25)] text-white border border-[rgba(80,130,255,0.4)]'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {filter === 'all' ? 'All Logs' : filter === 'enforced' ? 'Enforced' : 'Pending Tow'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[rgba(80,130,255,0.15)] text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-2">Time</th>
                <th className="py-2.5 px-2">Location</th>
                <th className="py-2.5 px-2">Geohash (gh7)</th>
                <th className="py-2.5 px-2">Violation Type</th>
                <th className="py-2.5 px-2">Enforcement Unit</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(80,130,255,0.08)]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-cyan-400 font-medium">
                    {log.id}
                  </td>
                  <td className="py-2.5 px-2 text-slate-400">
                    {log.time}
                  </td>
                  <td className="py-2.5 px-2 font-semibold text-white">
                    {log.location}
                  </td>
                  <td className="py-2.5 px-2 font-mono text-slate-400 text-[11px]">
                    {log.geohash}
                  </td>
                  <td className="py-2.5 px-2 text-slate-300 font-medium">
                    {log.type}
                  </td>
                  <td className="py-2.5 px-2 text-slate-400">
                    {log.officer}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      log.status === 'Enforced'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : log.status === 'Pending Tow'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_8px_rgba(255,49,88,0.3)]'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
