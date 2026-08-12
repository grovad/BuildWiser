import { useState } from "react";
import { 
  Settings, 
  Database, 
  Sparkles, 
  Cpu, 
  TrendingUp, 
  ShieldAlert, 
  Undo2, 
  Save, 
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { SystemSettings } from "../types";

interface ProjectSettingsViewProps {
  settings: SystemSettings;
  setSettings: (s: SystemSettings) => void;
}

export default function ProjectSettingsView({ settings, setSettings }: ProjectSettingsViewProps) {
  const [localSettings, setLocalSettings] = useState<SystemSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSettings(localSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    const defaults: SystemSettings = {
      modelType: "LSTMRF",
      baseCementPrice: 85000,
      baseLaborRate: 28000,
      inflationMultiplier: 1.0,
      simulatedIncidents: 4
    };
    setLocalSettings(defaults);
    setSettings(defaults);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Panel */}
      <div className="border-b border-slate-200 pb-5">
        <span className="font-mono text-xs text-[#004ac6] uppercase font-bold tracking-widest leading-none block mb-1">
          Module: System_Baseline_Configuration
        </span>
        <h2 className="font-display-lg text-3xl font-extrabold text-slate-900 leading-tight">
          Project Settings
        </h2>
        <p className="text-slate-500 text-xs mt-1">Calibrate base metrics, inflation offsets, and active AI model heuristics</p>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <div className="text-xs">
            <strong>Baseline parameters updated!</strong> Your calibrations are currently adjusting active Cost Estimators and Risk Score matrices in real-time.
          </div>
        </div>
      )}

      {/* Main Heuristic Settings grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Baseline Calibrations Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center text-white">
            <h3 className="font-label-caps text-xs font-extrabold flex items-center gap-2 m-0 text-white">
              <Settings className="w-4 h-4 text-emerald-400" />
              <span>CORE METRIC CALIBRATIONS</span>
            </h3>
            <span className="text-slate-500 font-mono text-[9px]">Scope: Standard Nigerian Index</span>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Base Cement Price Index */}
            <div className="space-y-2">
              <label className="font-label-caps text-[10px] text-slate-400 font-extrabold tracking-wider uppercase block">
                Base Cement Price Index (NGN / ton eq)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={localSettings.baseCementPrice}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, baseCementPrice: Math.max(100, parseInt(e.target.value) || 0) }))}
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg py-2.5 px-3 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400 font-bold">₦</span>
              </div>
            </div>

            {/* Base Labor price */}
            <div className="space-y-2">
              <label className="font-label-caps text-[10px] text-slate-400 font-extrabold tracking-wider uppercase block">
                Base Hourly Labor Rate Index (NGN / SQM dev)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={localSettings.baseLaborRate}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, baseLaborRate: Math.max(10, parseInt(e.target.value) || 0) }))}
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg py-2.5 px-3 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400 font-bold">₦</span>
              </div>
            </div>

            {/* Dynamic Real-time Inflation slider multiplier */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-label-caps text-[10px] text-slate-400 font-extrabold tracking-wider uppercase block">
                  REAL-TIME INFLATION MULTIPLIER
                </label>
                <span className="font-mono text-xs text-[#004ac6] font-extrabold">
                  {localSettings.inflationMultiplier.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={localSettings.inflationMultiplier}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, inflationMultiplier: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563eb]"
              />
              <div className="flex justify-between font-mono text-[9px] text-slate-400 uppercase font-semibold">
                <span>0.50x (Deflation hedge)</span>
                <span>1.00x (Baseline)</span>
                <span>2.50x (Extreme Risk)</span>
              </div>
            </div>

            {/* Simulated incidents default */}
            <div className="space-y-2">
              <label className="font-label-caps text-[10px] text-slate-400 font-extrabold tracking-wider uppercase block">
                Simulation Anomaly Level (Frequency Coefficient)
              </label>
              <select
                value={localSettings.simulatedIncidents}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, simulatedIncidents: parseInt(e.target.value) }))}
                className="w-full border border-slate-200 bg-slate-50 rounded-lg py-2.5 px-3 text-xs focus:ring-1 focus:ring-blue-500 text-slate-700"
              >
                <option value={2}>Low Occurrence (Coeff. 2)</option>
                <option value={4}>Medium Baseline (Coeff. 4)</option>
                <option value={8}>Severe Volatility (Coeff. 8)</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={handleResetDefaults}
                className="font-mono text-[10px] text-slate-500 hover:text-slate-800 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={handleSave}
                className="px-5 py-3 bg-slate-950 hover:bg-slate-800 text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded-xl flex items-center gap-2 cursor-pointer transition-all hover:shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Calibrations</span>
              </button>
            </div>

          </div>
        </div>

        {/* Intelligence Selection Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h4 className="font-display-lg text-[#1E293B] font-bold text-base leading-none mb-3 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#004ac6]" />
              <span>Model Selection & API Gateway</span>
            </h4>

            {/* Model Toggle choices */}
            <div className="space-y-3">
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, modelType: "LSTMRF" }))}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex gap-4 ${
                  localSettings.modelType === "LSTMRF"
                    ? "border-[#2563eb] bg-blue-50/50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border border-slate-300 shrink-0 flex items-center justify-center mt-1 ${localSettings.modelType === "LSTMRF" ? "border-blue-600 bg-blue-600" : ""}`}>
                  {localSettings.modelType === "LSTMRF" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 leading-tight">LSTM & Random Forest (Offline Deterministic Method)</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    No API queries required. Uses our local fast statistical matrices compiled directly onto the baseline. Fast and robust fallback.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, modelType: "GEMINI" }))}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex gap-4 ${
                  localSettings.modelType === "GEMINI"
                    ? "border-[#2563eb] bg-blue-50/50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border border-slate-300 shrink-0 flex items-center justify-center mt-1 ${localSettings.modelType === "GEMINI" ? "border-blue-600 bg-blue-600" : ""}`}>
                  {localSettings.modelType === "GEMINI" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs text-slate-900 leading-none">Gemini 3.5 Neural-Refinement Engine (Live Active Connection)</p>
                    <span className="bg-[#fea619] text-[#2a1700] px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase">GEN AI</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    Harnesses server-side generative insights using the @google/genai SDK to draft contextual report analyses, cost mitigations, and safety narratives dynamically.
                  </p>
                </div>
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed leading-normal">
              <strong>Enterprise Credentials:</strong> Real API keys can be specified in the <strong>Settings &gt; Secrets</strong> menu. If no key is specified, BuildWise AI gracefully manages neural parameters locally.
            </div>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 space-y-3">
            <h5 className="font-bold text-emerald-900 text-xs uppercase font-label-caps flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-700" />
              <span>Diagnostic Sync Overview</span>
            </h5>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              Your server and client are linked. Every live parameter calibration changes structural estimate margins instantly, giving estimators complete responsive capability directly from their command decks.
            </p>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 space-y-3">
            <h5 className="font-bold text-[#004ac6] text-xs uppercase font-label-caps flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#004ac6]" />
              <span>Project Authority & Oversight</span>
            </h5>
            <div className="text-xs text-slate-600 font-sans space-y-2 leading-relaxed">
              <p>
                <strong>Supervisor:</strong> <span className="font-bold text-slate-900">Prof. Olushina Olawale Awe</span>
              </p>
              <p>
                This research-grade predictive simulation suite maintains standard calibration parameters under full academic and professional governance by the Project Supervisor.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
