import React, { useState } from "react";
import { 
  AlertTriangle, 
  CloudRain, 
  Truck, 
  TrendingUp, 
  ShieldCheck, 
  Flame, 
  Info, 
  ChevronRight, 
  Plus, 
  ShieldAlert,
  Clock,
  CheckCircle2,
  RefreshCw,
  X,
  FileText,
  Layers
} from "lucide-react";
import { RiskIncident, MitigationsPlan, SystemSettings } from "../types";

interface RiskAnalysisViewProps {
  settings: SystemSettings;
  aggregateRisk: number;
  setAggregateRisk: (score: number) => void;
  incidents: RiskIncident[];
  setIncidents: React.Dispatch<React.SetStateAction<RiskIncident[]>>;
  onRunSimulation: () => void;
  isSimulating: boolean;
}

export default function RiskAnalysisView({
  settings,
  aggregateRisk,
  setAggregateRisk,
  incidents,
  setIncidents,
  onRunSimulation,
  isSimulating
}: RiskAnalysisViewProps) {
  
  // Custom interactive mitigations local state
  const [mitigations, setMitigations] = useState<MitigationsPlan[]>([
    { id: "M1", category: "WEATHER", text: "Deploy automated sump pumps to Sub-Level 3 and pause excavation for 48h starting tomorrow morning.", approved: false },
    { id: "M2", category: "LOGISTICS", text: "Re-route cement shipment #8821 to Ikorodu Port to bypass Lekki Phase 1 traffic surges.", approved: false },
    { id: "M3", category: "PROCUREMENT", text: "Bulk-purchase 500 tons of reinforcing steel now to hedge against predicted 5.2% price hike.", approved: false },
    { id: "M4", category: "WORKFORCE", text: "Shift structural concrete pouring to night-shift (10PM-4AM) to improve temperature curing.", approved: false }
  ]);

  // Modal State for logging a new incident
  const [modalOpen, setModalOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    type: "Equipment Failure",
    severity: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    description: "",
    status: "Logged" as "Resolved" | "Investigating" | "Logged" | "Processing"
  });

  // Handle mitigation approvals
  const handleApproveMitigation = (id: string) => {
    setMitigations(prev => prev.map(m => {
      if (m.id === id) {
        if (!m.approved) {
          // Reduce aggregate risk score as a premium interactive reward!
          setAggregateRisk(Math.max(40, aggregateRisk - 4));
        }
        return { ...m, approved: true };
      }
      return m;
    }));
  };

  // Submit a custom logged incident from the FAB modal
  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.description) return;

    const codeId = `INC-2026-${Math.floor(Math.random() * 900) + 100}`;
    const dateFormatted = new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    }) + `, ${new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })}`;

    const fresh: RiskIncident = {
      id: codeId,
      date: dateFormatted,
      type: newIncident.type,
      severity: newIncident.severity,
      description: newIncident.description,
      status: newIncident.status
    };

    setIncidents(prev => [fresh, ...prev]);
    
    // Slightly increase risk score to reflect new uncleared log, unless resolved
    if (newIncident.status !== "Resolved") {
      setAggregateRisk(Math.min(100, aggregateRisk + 3));
    }

    setModalOpen(false);
    setNewIncident({
      type: "Equipment Failure",
      severity: "MEDIUM",
      description: "",
      status: "Logged"
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="font-mono text-xs text-[#004ac6] uppercase font-bold tracking-widest leading-none block mb-1">
            BuildWise AI // Telemetry Center
          </span>
          <h2 className="font-display-lg text-3xl font-extrabold text-slate-900 leading-tight">
            Risk Management & Analysis
          </h2>
          <p className="text-slate-500 text-xs mt-1">Real-time safety audits for Abuja Central Hub Portfolio</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRunSimulation}
            disabled={isSimulating}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs uppercase font-label-caps rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-sm relative overflow-hidden"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
            <span>{isSimulating ? "Initiating Diagnostics..." : "Run AI Simulation"}</span>
          </button>
          
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs uppercase font-label-caps rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Primary Row: Score Card + Predictive Risk Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Risk Score Card (Primary Metric) - (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-caps text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">
                Aggregate Risk Score
              </span>
              <span className={`font-mono text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded ${aggregateRisk > 75 ? "bg-red-50 text-[#ba1a1a]" : "bg-amber-50 text-amber-700"}`}>
                {aggregateRisk > 75 ? "CRITICAL ALERT" : "MODERATE MARGIN"}
              </span>
            </div>

            <div className="text-6xl font-display-lg font-black tracking-tight text-slate-950 leading-none mb-1">
              {aggregateRisk}<span className="text-lg text-slate-400 font-normal">/100</span>
            </div>
            
            <p className="text-xs text-slate-500 font-sans mt-2 leading-relaxed">
              Trend trajectory: <span className="text-[#ba1a1a] font-bold">↑ 12%</span> since last automated audits.
            </p>
          </div>

          <div className="mt-8">
            {/* Linear color slider matching instructions */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#10B981] via-[#fea619] to-[#ba1a1a] h-full rounded-full transition-all duration-700"
                style={{ width: `${aggregateRisk}%` }}
              ></div>
            </div>
            
            <div className="flex items-center gap-1.5 mt-3 text-[10px] font-mono text-slate-400 uppercase font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-400 animate-spin" />
              <span>Diagnostic Assessment: Just Synchronized</span>
            </div>
          </div>
        </div>

        {/* Predictive Risk Heatmap Section - (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <h3 className="font-headline-md text-slate-900 font-bold text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#2563eb]" />
              <span>Predictive Risk Heatmap</span>
            </h3>

            {/* Heatmap Legend */}
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 font-label-caps text-[9px] font-bold text-slate-500">
                <div className="w-3 h-3 bg-[#ba1a1a]/15 border border-[#ba1a1a]/30 rounded-xs"></div> HIGH
              </div>
              <div className="flex items-center gap-1.5 font-label-caps text-[9px] font-bold text-slate-500">
                <div className="w-3 h-3 bg-[#fea619]/15 border border-[#fea619]/30 rounded-xs"></div> MED
              </div>
              <div className="flex items-center gap-1.5 font-label-caps text-[9px] font-bold text-slate-500">
                <div className="w-3 h-3 bg-[#10B981]/15 border border-[#10B981]/30 rounded-xs"></div> LOW
              </div>
            </div>
          </div>

          {/* 4 Heatmap quadrants displaying interactive description overlays */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            {/* Quadrant 1: Weather Impact */}
            <div className="relative group bg-[#ba1a1a]/10 hover:bg-[#ba1a1a]/15 border border-[#ba1a1a]/20 rounded-xl p-4 flex flex-col justify-between h-36 transition-all duration-150 cursor-pointer">
              <div className="flex justify-between items-start">
                <CloudRain className="w-6 h-6 text-[#ba1a1a]" />
                <span className="font-mono text-xs font-bold text-[#ba1a1a]">92%</span>
              </div>
              <span className="font-label-caps text-[10px] text-slate-900 font-black tracking-wider uppercase">Weather Impact</span>
              
              {/* Overlay on hover/click */}
              <div className="absolute inset-0 bg-slate-900/95 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl p-3.5 flex flex-col justify-center text-center text-white">
                <p className="font-bold text-[#fea619] text-[10px] uppercase font-mono mb-1">IMMINENT RAINFALL</p>
                <p className="text-[11px] leading-snug">Heavy storms expected in 48h. Flooding vectors flagged in excavation grid B4.</p>
              </div>
            </div>

            {/* Quadrant 2: Supply Chain */}
            <div className="relative group bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded-xl p-4 flex flex-col justify-between h-36 transition-all duration-150 cursor-pointer">
              <div className="flex justify-between items-start">
                <Truck className="w-6 h-6 text-amber-700" />
                <span className="font-mono text-xs font-bold text-amber-700">54%</span>
              </div>
              <span className="font-label-caps text-[10px] text-slate-900 font-black tracking-wider uppercase">Supply Chain</span>

              {/* Overlay */}
              <div className="absolute inset-0 bg-slate-900/95 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl p-3.5 flex flex-col justify-center text-center text-white">
                <p className="font-bold text-[#fea619] text-[10px] uppercase font-mono mb-1">PORT CONGESTION</p>
                <p className="text-[11px] leading-snug">Bulk cement vessel clearance delayed by 3 days due to dock stack overlaps.</p>
              </div>
            </div>

            {/* Quadrant 3: Inflation */}
            <div className="relative group bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded-xl p-4 flex flex-col justify-between h-36 transition-all duration-150 cursor-pointer">
              <div className="flex justify-between items-start">
                <TrendingUp className="w-6 h-6 text-amber-700" />
                <span className="font-mono text-xs font-bold text-amber-700">41%</span>
              </div>
              <span className="font-label-caps text-[10px] text-slate-900 font-black tracking-wider uppercase">Inflation</span>

              {/* Overlay */}
              <div className="absolute inset-0 bg-slate-900/95 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl p-3.5 flex flex-col justify-center text-center text-white">
                <p className="font-bold text-[#fea619] text-[10px] uppercase font-mono mb-1">MARKET TRENDS LIMITS</p>
                <p className="text-[11px] leading-snug">Variable Forex rates require forward raw reinforcement buying immediately.</p>
              </div>
            </div>

            {/* Quadrant 4: Site Safety */}
            <div className="relative group bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-xl p-4 flex flex-col justify-between h-36 transition-all duration-150 cursor-pointer">
              <div className="flex justify-between items-start">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
                <span className="font-mono text-xs font-bold text-emerald-700">12%</span>
              </div>
              <span className="font-label-caps text-[10px] text-slate-900 font-black tracking-wider uppercase">Site Safety</span>

              {/* Overlay */}
              <div className="absolute inset-0 bg-slate-900/95 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl p-3.5 flex flex-col justify-center text-center text-white">
                <p className="font-bold text-emerald-400 text-[10px] uppercase font-mono mb-1">OPTIMAL SAFETY</p>
                <p className="text-[11px] leading-snug">Excellent PPE compliance reports. Zone safety drills audit completed 100%.</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* AI SUGGESTION INCIDENT MITIGATIONS CARDS */}
      <div className="space-y-4">
        <h4 className="font-display-lg text-[#1E293B] font-bold text-lg tracking-tight">
          Adaptive AI Risk Mitigation Plans
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mitigations.map((m) => (
            <div key={m.id} className="bg-white border border-slate-200 hover:border-[#2563eb] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="p-1.5 bg-blue-50 text-[#004ac6] rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <p className="font-mono text-[9px] text-[#004ac6] font-extrabold uppercase tracking-wide">
                    {m.category} Action
                  </p>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans min-h-[72px]">
                  {m.text}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-50 mt-4">
                {m.approved ? (
                  <span className="text-emerald-600 font-mono text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Approved & Dispatched
                  </span>
                ) : (
                  <button
                    onClick={() => handleApproveMitigation(m.id)}
                    className="text-[#004ac6] hover:text-[#2563eb] font-bold font-label-caps text-[11px] tracking-wider uppercase flex items-center gap-1 cursor-pointer group hover:underline"
                  >
                    <span>Approve Action</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trainee Incidents Table List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-headline-md text-slate-900 font-bold text-base leading-none">
              Recent Site Incident Records (Core Training Inputs)
            </h4>
            <p className="text-slate-400 text-xs mt-1">Registry of diagnostic event anomalies</p>
          </div>
          <span className="font-mono text-[10px] text-slate-500 font-bold">
            Showing {incidents.length} of 214 total incidents
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F1F5F9] border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Incident ID</th>
                <th className="px-6 py-3.5">Log Date/Time</th>
                <th className="px-6 py-3.5">Type Domain</th>
                <th className="px-6 py-3.5">Severity</th>
                <th className="px-6 py-3.5">Site Description Log</th>
                <th className="px-6 py-3.5">Status Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-xs">
              {incidents.map((inc) => {
                const isCritical = inc.severity === "CRITICAL" || inc.severity === "HIGH";
                const isMedium = inc.severity === "MEDIUM";

                return (
                  <tr key={inc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#ba1a1a]">
                      {inc.id}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {inc.date}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {inc.type}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 font-mono text-[9px] font-bold rounded uppercase ${
                        isCritical
                          ? "bg-rose-50 text-[#ba1a1a]"
                          : isMedium
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-sm leading-relaxed">
                      {inc.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold font-mono text-[10px] uppercase ${
                        inc.status === "Resolved"
                          ? "text-emerald-600"
                          : inc.status === "Investigating"
                          ? "text-amber-600"
                          : "text-[#004ac6]"
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 text-center">
          <button
            onClick={() => alert(`Showing history database logs. 4,210 Entries are protected under Federal Construction standards.`)}
            className="text-[#004ac6] hover:text-[#2563eb] font-mono font-bold text-[10px] uppercase tracking-wider cursor-pointer font-label-caps"
          >
            Request Full Archive (4,210 Total Logs)
          </button>
        </div>
      </div>

      {/* FLOAT MODERATOR FAB ACTION BUTTON */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-8 right-8 bg-slate-950 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group cursor-pointer border border-slate-800"
        title="Log New Site Incident to Diagnostics Table"
      >
        <Plus className="w-6 h-6 stroke-[3px]" />
        <span className="absolute right-full mr-3.5 bg-slate-900 border border-slate-800 text-white px-3 py-1.5 rounded-lg font-label-caps text-[9px] tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-all duration-150 whitespace-nowrap pointer-events-none shadow-lg">
          Log incident
        </span>
      </button>

      {/* LOG INCIDENT DIALOG MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleAddIncident}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl max-w-lg w-full animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-start mb-5 pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-headline-md text-slate-900 font-bold text-base leading-none">
                  Log New Incident Record
                </h4>
                <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider mt-1">
                  National Engineering Safety Telemetry
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="hover:bg-slate-100 rounded-full p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Type selection */}
                <div className="space-y-1.5">
                  <label className="font-label-caps text-[9px] text-slate-400 font-bold uppercase block">
                    Anomaly Type Domain
                  </label>
                  <select
                    value={newIncident.type}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full border border-slate-200 bg-slate-50 rounded-lg py-2.5 px-3 text-xs focus:ring-2 focus:ring-[#2563eb]"
                  >
                    <option>Equipment Failure</option>
                    <option>Weather Strike</option>
                    <option>Safety Violation</option>
                    <option>Resource Delay</option>
                    <option>Structural Incongruency</option>
                  </select>
                </div>

                {/* Severity selection */}
                <div className="space-y-1.5">
                  <label className="font-label-caps text-[9px] text-slate-400 font-bold uppercase block">
                    Threat Severity Index
                  </label>
                  <select
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, severity: e.target.value as any }))}
                    className="w-full border border-slate-200 bg-slate-50 rounded-lg py-2.5 px-3 text-xs focus:ring-2 focus:ring-[#2563eb]"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              {/* Status selection */}
              <div className="space-y-1.5">
                <label className="font-label-caps text-[9px] text-slate-400 font-bold uppercase block">
                  Processing Pipeline Status
                </label>
                <select
                  value={newIncident.status}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg py-2.5 px-3 text-xs focus:ring-2 focus:ring-[#2563eb]"
                >
                  <option value="Logged">Logged Into Registry</option>
                  <option value="Processing">Processing Diagnostics</option>
                  <option value="Investigating">Under Active Investigation</option>
                  <option value="Resolved">Resolved & Cleared</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-label-caps text-[9px] text-slate-400 font-bold uppercase block">
                  Detailed Diagnostic Site Log
                </label>
                <textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="E.g., Cranes hydraulic pressure low, standard containment protocols deployed immediately..."
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg py-2.5 px-3 text-xs focus:ring-2 focus:ring-[#2563eb] placeholder-slate-400 font-sans"
                  required
                ></textarea>
              </div>
            </div>

            {/* Form actions */}
            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end gap-3.5">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] uppercase font-bold tracking-wider rounded-lg cursor-pointer"
              >
                Abandons Form
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-950 hover:bg-slate-800 text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <span>Commit Registry Log</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
