import React, { useState } from "react";
import { 
  Download, 
  TrendingUp, 
  Wallet, 
  Activity, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  MoreVertical,
  Layers,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { RiskAlert, ActiveProject, SystemSettings } from "../types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend as RechartsLegend, 
  ResponsiveContainer 
} from "recharts";

interface DashboardViewProps {
  settings: SystemSettings;
  riskAlerts: RiskAlert[];
  setRiskAlerts: React.Dispatch<React.SetStateAction<RiskAlert[]>>;
  aggregateRisk: number;
  activeProjects: ActiveProject[];
  setActiveProjects: React.Dispatch<React.SetStateAction<ActiveProject[]>>;
  onNavigateToTab: (tab: string) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
}

export default function DashboardView({
  settings,
  riskAlerts,
  setRiskAlerts,
  aggregateRisk,
  activeProjects,
  setActiveProjects,
  onNavigateToTab,
  onRunSimulation,
  isSimulating
}: DashboardViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>("SEP");
  const [selectedMapNode, setSelectedMapNode] = useState<string | null>(null);

  // Spend Benchmark comparisons
  const spendBenchmarkData = activeProjects.map(p => {
    // Extract short location node name for neat XAxis rendering
    const nameMatch = p.location.match(/^([^(]+)/);
    const shortLabel = nameMatch ? nameMatch[1].trim() : p.location;
    return {
      name: shortLabel,
      "Actual Spend": p.actualSpend,
      "Budget Baseline": p.budgetBaseline,
      rawProject: p
    };
  });

  const formatYAxis = (value: number) => {
    if (value >= 1_000_000_000) return `₦ ${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `₦ ${(value / 1_000_000).toFixed(0)}M`;
    return `₦ ${value}`;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const actual = payload[0].value;
      const budget = payload[1].value;
      const difference = actual - budget;
      const pctDev = budget > 0 ? ((difference) / budget) * 100 : 0;
      
      const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
          maximumFractionDigits: 0
        }).format(val);
      };

      return (
        <div className="bg-slate-900 border border-slate-750 p-4 rounded-xl shadow-2xl space-y-2 text-xs font-sans max-w-[280px] text-left">
          <p className="font-bold text-slate-100 border-b border-slate-800 pb-1.5 text-[12px]">{label}</p>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Budget Baseline:</span>
            <span className="font-mono font-bold text-blue-400">{formatCurrency(budget)}</span>
          </div>
          <div className="flex justify-between gap-5">
            <span className="text-slate-400">Actual Spend:</span>
            <span className="font-mono font-bold text-orange-400">{formatCurrency(actual)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-2 text-[11px] leading-tight mt-1.5">
            <span className="text-slate-400">Budget Deviation:</span>
            <span className={`font-mono font-bold ${difference > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {difference > 0 ? `+${formatCurrency(difference)} (+${pctDev.toFixed(1)}%)` : `${formatCurrency(difference)} (${pctDev.toFixed(1)}%)`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Hardcoded timeline chart coordinates with hover support
  const timelineData = [
    { month: "JAN", forecast: 250, actual: 250, details: "Project Bootstage baseline matching." },
    { month: "MAR", forecast: 220, actual: 236, details: "Mobilization at Lekki site and materials purchase." },
    { month: "MAY", forecast: 180, actual: 210, details: "Piling stage excavations finalized. Aggregates delivered." },
    { month: "JUL", forecast: 150, actual: 172, details: "Rainy season dampening concrete pour timelines." },
    { month: "SEP", forecast: 120, actual: 140, details: "Active gap tracking - current margin offset: ₦140M." },
    { month: "NOV", forecast: 100, actual: 110, details: "Predicted structural envelope completion phase." },
  ];

  const handleDismissAlert = (id: string) => {
    setRiskAlerts(prev => prev.filter(al => al.id !== id));
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="font-mono text-xs text-[#004ac6] uppercase font-bold tracking-widest leading-none block mb-1">
            BuildWise AI // System Overview
          </span>
          <h2 className="font-display-lg text-3xl font-extrabold text-slate-900 leading-tight">
            Executive Dashboard
          </h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            <p className="text-xs text-slate-500 font-sans flex items-center gap-1.5">
              <span className="p-0.5 px-2 bg-blue-100 text-blue-700 text-[10px] font-mono font-bold rounded">PROJECT SUPERVISOR</span>
              <span className="font-bold text-slate-800">Prof. Olushina Olawale Awe</span>
            </p>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <p className="text-xs text-slate-500 font-sans flex items-center gap-1.5">
              <span className="p-0.5 px-2 bg-emerald-100 text-emerald-700 text-[10px] font-mono font-bold rounded">PROJECT OWNER</span>
              <span className="font-bold text-slate-800">Master Imo Joseph Okon</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRunSimulation}
            disabled={isSimulating}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs uppercase font-label-caps rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-sm relative overflow-hidden"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
            <span>{isSimulating ? "Simulating..." : "Run AI Simulation"}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs uppercase font-label-caps rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Report</span>
          </button>

          <div className="bg-slate-900 text-white px-4 py-2 flex items-center gap-2 rounded-lg shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
              Q3 {new Date().getFullYear()} / Abuja Central
            </span>
          </div>
        </div>
      </div>

      {/* Top row 4 Bento KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Project Budget Performance */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden group hover:border-[#2563eb] transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="font-label-caps text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Project Budget Performance
            </span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-headline-md text-2xl text-slate-950 font-bold">
              ₦4.20B <span className="text-xs text-slate-400 font-normal">/ ₦3.8B Est.</span>
            </h3>
            <p className="text-[#F97316] font-bold text-xs flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 stroke-[2.5px]" />
              <span>{(settings.inflationMultiplier * 10.5).toFixed(1)}% Cost Variance</span>
            </p>
          </div>
          <div className="mt-5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#F97316] h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, 75 * settings.inflationMultiplier)}%` }}
            ></div>
          </div>
        </div>

        {/* Inflation Impact */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden group hover:border-red-400 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="font-label-caps text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Nigeria Inflation Impact
            </span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-headline-md text-2xl text-slate-950 font-bold">
              +{(settings.inflationMultiplier * 24.8).toFixed(1)}%
            </h3>
            <p className="text-[#ba1a1a] font-bold text-xs flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
              <span>High Volatility Index</span>
            </p>
          </div>
          {/* Sparkline simulation using miniature bars */}
          <div className="mt-4 h-8 flex items-end gap-1.5 px-1 bg-slate-50 rounded-md p-1">
            <div className="bg-rose-200 w-full h-[30%] rounded-xs"></div>
            <div className="bg-rose-200 w-full h-[45%] rounded-xs"></div>
            <div className="bg-rose-200 w-full h-[40%] rounded-xs"></div>
            <div className="bg-rose-200 w-full h-[60%] rounded-xs"></div>
            <div className="bg-rose-200 w-full h-[75%] rounded-xs"></div>
            <div className="bg-[#ba1a1a] w-full h-[90%] rounded-xs"></div>
          </div>
        </div>

        {/* Aggregate Risk Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="font-label-caps text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Aggregate Risk Index
            </span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-headline-md text-2xl text-slate-950 font-bold">
              {aggregateRisk} <span className="text-xs text-slate-400 font-normal">/100</span>
            </h3>
            <p className="text-emerald-600 font-bold text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5px]" />
              <span>Stable Core Level</span>
            </p>
          </div>
          {/* Custom Multi-Segment Progress bar */}
          <div className="flex gap-1 py-1.5 mt-4">
            <div className="h-2 flex-1 bg-[#ba1a1a] rounded-sm" title="Critical Zone: 20%"></div>
            <div className="h-2 flex-[2.5] bg-[#fea619] rounded-sm" title="Moderate Margin: 50%"></div>
            <div className="h-2 flex-[1.5] bg-[#10B981] rounded-sm" title="Optimal Compliant: 30%"></div>
          </div>
        </div>

        {/* Active Deployments */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden group hover:border-indigo-400 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="font-label-caps text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Active Deployments
            </span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-headline-md text-2xl text-slate-950 font-bold">
              14 Projects
            </h3>
            <p className="text-indigo-600 font-bold text-xs flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>8 Active in Abuja Central Hub</span>
            </p>
          </div>
          {/* Group tags */}
          <div className="mt-3.5 flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-700">L1</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-700">A3</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-700">P7</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-800 text-white flex items-center justify-center text-[9px] font-bold">
              +11
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: CPI Chart + Risk Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CPI Timeline (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="font-headline-md text-slate-900 font-bold text-base">
                Cost Performance Index (CPI)
              </h4>
              <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                Project Lifecycle: 24 Months baseline
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-dashed bg-[#2563eb] border border-[#2563eb] inline-block"></span>
                <span className="font-label-caps text-[10px] text-slate-500 font-bold uppercase">Forecast</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-[#F97316] rounded-full inline-block"></span>
                <span className="font-label-caps text-[10px] text-slate-500 font-bold uppercase">Actual Spend</span>
              </div>
            </div>
          </div>

          {/* SVG Drawn Line Chart */}
          <div className="flex-1 bg-slate-50/50 hover:bg-slate-50 rounded-xl relative overflow-hidden border border-dashed border-slate-200 p-8 min-h-[280px]">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-0 inset-y-8 flex flex-col justify-between pointer-events-none">
              <div className="w-full border-b border-slate-100"></div>
              <div className="w-full border-b border-slate-100"></div>
              <div className="w-full border-b border-slate-100"></div>
              <div className="w-full border-b border-slate-100"></div>
            </div>

            {/* SVG Content wrapper */}
            <svg className="w-full h-full absolute inset-0 pt-8" viewBox="0 0 800 200" preserveAspectRatio="none">
              {/* Forecast path dashed (representing standard curves) */}
              <path
                d="M 50 160 Q 250 130, 450 90 T 750 30"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeDasharray="6,4"
              />

              {/* Actual path solid */}
              <path
                d="M 50 160 Q 200 155, 300 130 Q 450 110, 580 75"
                fill="none"
                stroke="#F97316"
                strokeWidth="4.5"
                strokeLinecap="round"
              />

              {/* Pulsing checkpoint element on current status */}
              <circle cx="580" cy="75" r="7" fill="#F97316" className="animate-pulse" />
            </svg>

            {/* Selected Month Tooltip Detail */}
            {selectedMonth && (
              <div className="absolute top-4 left-4 right-4 sm:left-auto sm:right-4 bg-slate-900 text-white rounded-lg p-3 text-xs shadow-lg max-w-sm border border-slate-700 font-sans z-10">
                <div className="flex justify-between items-center font-mono font-bold text-[#fea619] mb-1">
                  <span>MONTH: {selectedMonth}</span>
                  <span>MARGINE: ₦140M OVERRUN</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {timelineData.find(t => t.month === selectedMonth)?.details}
                </p>
              </div>
            )}

            {/* Interaction points for selections */}
            <div className="absolute bottom-10 inset-x-8 flex justify-between">
              {timelineData.map((t, idx) => (
                <button
                  key={t.month}
                  onClick={() => setSelectedMonth(t.month)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-[10px] font-bold transition-all cursor-pointer ${
                    selectedMonth === t.month
                      ? "bg-slate-900 text-amber-400 scale-110 shadow-md border border-slate-700"
                      : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {t.month}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time alerts feed (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h4 className="font-headline-md text-slate-900 font-bold text-base leading-none">
                Risk Alerts
              </h4>
              <p className="font-mono text-[9px] text-[#ba1a1a] uppercase tracking-wider font-bold mt-1">
                Real-time System Stream
              </p>
            </div>
            {riskAlerts.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-[#ba1a1a] font-mono text-[9px] font-bold">
                {riskAlerts.length} ACTIVE
              </span>
            )}
          </div>

          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[380px]">
            {riskAlerts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-sans">
                <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold">No High-Risk Signals Detected</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Click 'Run AI Simulation' dynamically in the header to generate a simulated live construction alert.
                </p>
              </div>
            ) : (
              riskAlerts.map((alert) => {
                const isCritical = alert.severity === "CRITICAL";
                const isMarket = alert.severity === "MARKET";

                return (
                  <div
                    key={alert.id}
                    className="p-4 hover:bg-slate-50/50 transition-colors group relative"
                  >
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isCritical
                          ? "bg-red-50 text-[#ba1a1a]"
                          : isMarket
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-mono text-[9px] font-bold uppercase ${
                            isCritical ? "text-[#ba1a1a]" : isMarket ? "text-amber-700" : "text-emerald-700"
                          }`}>
                            {alert.severity} • {alert.id}
                          </span>
                          <span className="font-mono text-[9px] text-slate-400">{alert.time}</span>
                        </div>

                        <p className="font-bold text-slate-900 text-xs leading-snug">
                          {alert.title}
                        </p>

                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          {alert.description}
                        </p>

                        <div className="pt-2 flex items-center justify-between">
                          <div className="flex gap-2">
                            {isCritical && (
                              <button
                                onClick={() => onNavigateToTab("risk-analysis")}
                                className="font-mono text-[9px] text-[#004ac6] font-extrabold uppercase hover:underline cursor-pointer"
                              >
                                ASSIGN TEAM
                              </button>
                            )}
                            <button
                              onClick={() => handleDismissAlert(alert.id)}
                              className="font-mono text-[9px] text-slate-400 font-extrabold uppercase hover:text-slate-700 cursor-pointer"
                            >
                              DISMISS
                            </button>
                          </div>
                          
                          <Sparkles className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Spend Benchmark Analytics: Baseline Budget vs. Actual Capital Mobilization */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h4 className="font-headline-md text-slate-900 font-bold text-base leading-none flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-blue-600 animate-pulse" />
              <span>Project Budget Comparison Analysis</span>
            </h4>
            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mt-1">
              Federal Portfolio Spend Benchmark: Actual Spend vs. Budget Baseline
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-blue-600 rounded-sm"></span>
              <span className="text-slate-500 font-semibold">Budget Baseline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-orange-500 rounded-sm"></span>
              <span className="text-slate-500 font-semibold">Actual Spend</span>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={spendBenchmarkData}
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={formatYAxis}
                tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: '#e2e8f0', fillOpacity: 0.3 }} />
              <Bar 
                dataKey="Actual Spend" 
                fill="#f97316" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={45} 
              />
              <Bar 
                dataKey="Budget Baseline" 
                fill="#2563eb" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={45} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Geographical hot spots Nigeria Map */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h4 className="font-headline-md text-slate-900 font-bold text-base leading-none">
              Geographical Risk Map
            </h4>
            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mt-1">
              Active Nigerian Infrastructure Project Hotspots
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigateToTab("geographical-map")}
              className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-[#004ac6] hover:brightness-110 active:scale-95 text-white font-bold text-xs uppercase font-label-caps rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>EXPLORE FULL INTERACTIVE MAP</span>
            </button>
          </div>
        </div>

        {/* Map visualization layout with vector coordinates */}
        <div className="relative h-[360px] w-full bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
          {/* Background map grid illustration */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40"></div>
          
          {/* Visual stylized representation of Nigeria outline inside SVG */}
          <svg className="absolute inset-0 w-full h-full p-6 text-slate-600/30" viewBox="0 0 800 300" preserveAspectRatio="none">
            <path
              d="M 200 100 Q 300 30, 480 50 T 650 120 T 600 250 T 350 280 T 150 230 Z"
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          </svg>

          {/* Interactive map hotspots pointers */}
          {/* Node 1: Lagos Port Extension */}
          <div 
            onClick={() => setSelectedMapNode("lagos")}
            className="absolute top-[65%] left-[28%] group cursor-pointer"
          >
            <span className="absolute w-4 h-4 bg-red-500 rounded-full animate-ping opacity-70"></span>
            <span className="relative block w-4 h-4 bg-[#ba1a1a] border-2 border-white rounded-full shadow-lg"></span>
            
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-2.5 rounded-lg w-48 shadow-2xl border border-slate-700 z-10 transition-all font-sans">
              <p className="font-bold text-[11px] text-white">Lagos Port Extension</p>
              <p className="text-[9px] font-mono text-red-400 font-bold">RISK STATUS: 8.9 / CRITICAL</p>
              <p className="text-[10px] text-slate-400 leading-snug mt-1">Delayed cement cargo transit off Apapa dock.</p>
            </div>
          </div>

          {/* Node 2: Abuja Tech Hub */}
          <div 
            onClick={() => setSelectedMapNode("abuja")}
            className="absolute top-[35%] left-[48%] group cursor-pointer"
          >
            <span className="relative block w-4 h-4 bg-[#fea619] border-2 border-white rounded-full shadow-lg"></span>
            
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-2.5 rounded-lg w-40 shadow-2xl border border-slate-700 z-10 transition-all font-sans">
              <p className="font-bold text-[11px] text-white">Abuja Tech Hub</p>
              <p className="text-[9px] font-mono text-amber-400 font-bold">RISK STATUS: 4.2 / MODERATE</p>
              <p className="text-[10px] text-slate-400 leading-snug mt-1">Aggregates procurement price volatility.</p>
            </div>
          </div>

          {/* Node 3: Port Harcourt Refinery */}
          <div 
            onClick={() => setSelectedMapNode("ph")}
            className="absolute top-[80%] left-[42%] group cursor-pointer"
          >
            <span className="relative block w-4 h-4 bg-[#10B981] border-2 border-white rounded-full shadow-lg"></span>

            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-2.5 rounded-lg w-44 shadow-2xl border border-slate-700 z-10 transition-all font-sans">
              <p className="font-bold text-[11px] text-white">PH Refinery Overpass</p>
              <p className="text-[9px] font-mono text-emerald-400 font-bold">RISK STATUS: 2.1 / STABLE</p>
              <p className="text-[10px] text-slate-400 leading-snug mt-1">All safety logs fully cleared for Zone F.</p>
            </div>
          </div>

          {/* Technical Map Legend box */}
          <div className="absolute bottom-4 right-4 bg-[#1E293B]/95 border border-slate-700 rounded-lg p-3.5 shadow-md text-white font-sans max-w-xs">
            <h5 className="font-label-caps text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-2">
              Coordinate Reference
            </h5>
            <div className="space-y-1.5 font-mono text-[9px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
                <span className="text-slate-300">Cost Overrun Risk / Delay</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#fea619]"></span>
                <span className="text-slate-300">Materials Volatility</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                <span className="text-slate-300">Operational Safety Optimal</span>
              </div>
            </div>
          </div>

          <div className="absolute top-4 left-4 font-mono text-[9px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-700">
            RADAR SCAN OUTLINE: LAGOS-ABUJA-PH CORE METRICS
          </div>
        </div>
      </div>

      {/* Active Portfolio Data Dense Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-headline-md text-slate-900 font-bold text-base leading-none">
              Active Analysis Portfolio
            </h4>
            <p className="text-slate-400 text-xs mt-1">Real-time status tracking and baseline overruns</p>
          </div>
          <button
            onClick={() => onNavigateToTab("cost-predictions")}
            className="text-[#004ac6] font-bold text-xs uppercase font-label-caps hover:underline cursor-pointer flex items-center gap-1.5"
          >
            <span>View All Estimates</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F1F5F9] border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Analysis Code</th>
                <th className="px-6 py-3.5">Location Hub</th>
                <th className="px-6 py-3.5">Budget Deviation Status</th>
                <th className="px-6 py-3.5">Risk Level Code</th>
                <th className="px-6 py-3.5">Milestone Completion</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-xs">
              {activeProjects.map((p) => {
                const isHigh = p.riskLevel === "HIGH ALERT";
                const isMod = p.riskLevel === "MODERATE";

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#004ac6]">
                      {p.id}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {p.location}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${p.budgetDelta > 0 ? "bg-[#ba1a1a]" : "bg-[#10B981]"}`}></span>
                        <span className="font-bold">
                          {p.budgetStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 font-mono text-[9px] font-bold rounded uppercase ${
                        isHigh
                          ? "bg-rose-50 text-[#ba1a1a]"
                          : isMod
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {p.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0">
                          <div
                            className="bg-[#2563eb] h-full rounded-full"
                            style={{ width: `${p.completion}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500 font-bold">{p.completion}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => alert(`Project ${p.id} parameters selected in Cost Engineering tab.`)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
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
  );
}
