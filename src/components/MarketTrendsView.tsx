import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Sparkles, 
  AlertTriangle, 
  Percent, 
  Filter, 
  CheckCircle,
  HelpCircle,
  MapPin
} from "lucide-react";
import { MarketMaterial, SystemSettings } from "../types";

interface MarketTrendsViewProps {
  settings: SystemSettings;
  materials: MarketMaterial[];
  setMaterials: React.Dispatch<React.SetStateAction<MarketMaterial[]>>;
}

export default function MarketTrendsView({ settings, materials, setMaterials }: MarketTrendsViewProps) {
  const [timeline, setTimeline] = useState<"12M" | "6M" | "30D">("12M");
  const [selectedState, setSelectedState] = useState("Lagos");
  const [searchQuery, setSearchQuery] = useState("");
  const [volatilityFilter, setVolatilityFilter] = useState<"ALL" | "CRITICAL" | "MODERATE" | "STABLE">("ALL");

  // Core historical indexes for cement bag timeline representation
  const timelineCharts = {
    "12M": [
      { point: "JUN '25", rate: 8200 },
      { point: "AUG '25", rate: 8500 },
      { point: "OCT '25", rate: 8900 },
      { point: "DEC '25", rate: 9300 },
      { point: "FEB '26", rate: 9600 },
      { point: "APR '26", rate: 9850 }
    ],
    "6M": [
      { point: "DEC '25", rate: 9300 },
      { point: "JAN '26", rate: 9450 },
      { point: "FEB '26", rate: 9600 },
      { point: "MAR '26", rate: 9750 },
      { point: "APR '26", rate: 9850 },
      { point: "MAY '26", rate: 9900 }
    ],
    "30D": [
      { point: "Week 1", rate: 9650 },
      { point: "Week 2", rate: 9720 },
      { point: "Week 3", rate: 9810 },
      { point: "Week 4", rate: 9850 }
    ]
  };

  const selectedData = timelineCharts[timeline];

  // Specific Regional construction rates deviations
  const regionalVariance = {
    Lagos: { cement: "₦9,850", steel: "₦1,250,000", sand: "₦185,000", variance: "+12.5% above national base", trend: "Steep trajectory inflation spikes due to custom delays." },
    Abuja: { cement: "₦10,400", steel: "₦1,320,000", sand: "₦210,000", variance: "+21.0% highest country premium", trend: "High logistics transit costs inland from sea ports." },
    "Port Harcourt": { cement: "₦9,650", steel: "₦1,210,000", sand: "₦175,000", variance: "+8.3% slightly elevated", trend: "Steady local dock clearances offset raw road freight." },
    Kano: { cement: "₦8,700", steel: "₦1,050,000", sand: "₦140,000", variance: "-10.0% below national baseline", trend: "Optimal supply chain links across Northern depots." }
  };

  const activeRegion = regionalVariance[selectedState as keyof typeof regionalVariance] || regionalVariance.Lagos;

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVol = volatilityFilter === "ALL" || m.volatility === volatilityFilter;
    return matchesSearch && matchesVol;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Panel */}
      <div className="border-b border-slate-200 pb-5">
        <span className="font-mono text-xs text-[#004ac6] uppercase font-bold tracking-widest leading-none block mb-1">
          Surveillance Model: PRICING_SURVEILLANCE_v1.0
        </span>
        <h2 className="font-display-lg text-3xl font-extrabold text-slate-900 leading-tight">
          Market Trends & Insights
        </h2>
        <p className="text-slate-500 text-xs mt-1">Real-time procurement audits for crucial local construction mediums</p>
      </div>

      {/* Primary Row: Cement index and volatility snapshot widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Cement index widget (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-4">
            <div>
              <span className="font-label-caps text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">
                Cement Pricing Index (Dangote 50KG Bag)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display-lg text-3xl font-black text-slate-900 leading-none">
                  ₦{(9850 * settings.inflationMultiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })}.00
                </span>
                <span className="text-red-600 font-mono text-xs font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{(4.2 * settings.inflationMultiplier).toFixed(1)}% MoM
                </span>
              </div>
            </div>

            {/* Timeline Selection filters */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
              {(["12M", "6M", "30D"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeline(t)}
                  className={`px-3 py-1.5 font-mono text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
                    timeline === t
                      ? "bg-slate-950 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t === "12M" ? "12 Months" : t === "6M" ? "6 Months" : "30 Days"}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Price Chart */}
          <div className="flex-1 bg-gradient-to-b from-slate-50/20 to-slate-50 p-6 rounded-xl border border-dashed border-slate-200 flex flex-col justify-between min-h-[200px] relative">
            
            {/* Horizontal rate lines */}
            <div className="absolute inset-x-0 inset-y-6 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="w-full border-b border-slate-200"></div>
              <div className="w-full border-b border-slate-200"></div>
              <div className="w-full border-b border-slate-200"></div>
            </div>

            {/* SVG Plot coordinates */}
            <svg className="w-full h-full absolute inset-0 pt-6" viewBox="0 0 800 120" preserveAspectRatio="none">
              <path
                d="M 50 100 Q 200 80, 400 60 T 750 20"
                fill="none"
                stroke="#F97316"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="750" cy="20" r="6" fill="#F97316" className="animate-pulse" />
            </svg>

            {/* Price values pointers */}
            <div className="flex justify-between relative z-10 w-full mt-auto">
              {selectedData.map((d) => (
                <div key={d.point} className="flex flex-col items-center">
                  <span className="font-mono text-[#F97316] text-[10px] font-extrabold bg-white px-2 py-0.5 rounded border border-slate-100 shadow-xs">
                    ₦{Math.round(d.rate * settings.inflationMultiplier).toLocaleString()}
                  </span>
                  <span className="font-mono text-[9px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                    {d.point}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI generated foresight text */}
          <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between text-xs text-slate-600 leading-snug">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#004ac6] shrink-0" />
              <p>
                <strong>AI Forecast Signal:</strong> Predictive Neural Core indicates an estimated <span className="text-red-600 font-bold">+12.4% price hike</span> in Q4 due to shipping tariff revisions.
              </p>
            </div>
          </div>
        </div>

        {/* Volatility snapshots (4 cols) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          {/* Snap 1: Steel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden flex-1 flex flex-col justify-between mb-4 lg:mb-0">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="p-1 px-2 bg-rose-50 border border-rose-200 text-[#ba1a1a] rounded text-[9px] font-mono font-black uppercase tracking-wider">
                  CRITICAL MARKET VOLATILITY
                </span>
                <span className="text-[#ba1a1a] font-mono text-[11px] font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +11.8%
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm font-sans mt-2">Reinforcement Steel (12mm)</h4>
              <p className="font-display-lg text-2xl font-black text-slate-950 mt-1">
                ₦{(1250000 * settings.inflationMultiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs text-slate-400 font-normal">/ Ton</span>
              </p>
            </div>
            
            <p className="text-[11px] text-slate-500 font-sans leading-snug pt-3 border-t border-slate-50 mt-4">
              Steel fabrication pipelines are throttled inside Lagos depots. Consider alternative suppliers.
            </p>
          </div>

          {/* Snap 2: Sand */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="p-1 px-2 bg-slate-50 border border-slate-200 text-slate-500 rounded text-[9px] font-mono font-black uppercase tracking-wider">
                  STABLE VOLATILITY VALUE
                </span>
                <span className="text-emerald-600 font-mono text-[11px] font-bold flex items-center gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  -2.4%
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm font-sans mt-2">River Sand (20 Tons)</h4>
              <p className="font-display-lg text-2xl font-black text-slate-950 mt-1">
                ₦{(185000 * settings.inflationMultiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs text-slate-400 font-normal">/ 20-Ton Load</span>
              </p>
            </div>

            <p className="text-[11px] text-slate-500 font-sans leading-snug pt-3 border-t border-slate-50 mt-4">
              Supply volumes remain optimal across Central and Abuja zones. Ground transit logistics stable.
            </p>
          </div>
        </div>

      </div>

      {/* REGIONAL COST VARIANCE SELECTOR AND MAP NODES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* State Interactive Map selection (7 cols) */}
        <div className="lg:col-span-12 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-headline-md text-slate-900 font-bold text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#2563eb]" />
                <span>Regional Cost Variance Map Explorer</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 uppercase font-mono tracking-wider">
                Compare index thresholds across major Nigerian construction nodes
              </p>
            </div>

            {/* Core states toggles selection */}
            <div className="flex flex-wrap gap-2.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              {Object.keys(regionalVariance).map((state) => (
                <button
                  key={state}
                  onClick={() => setSelectedState(state)}
                  className={`px-3 py-1.5 font-sans text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedState === state
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Left pricing summary stats */}
            <div className="md:col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-200/50 flex flex-col justify-between min-h-[220px]">
              <div>
                <span className="font-mono text-[9px] text-[#004ac6] font-bold uppercase tracking-wider block mb-1">
                  CURRENTLY ACTIVE REGION
                </span>
                <p className="font-display-lg text-2xl font-extrabold text-[#1E293B] font-display-md mb-2">
                  {selectedState}
                </p>
                <span className="inline-block px-2 py-0.5 rounded font-mono text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold uppercase">
                  {activeRegion.variance}
                </span>

                <div className="space-y-2.5 mt-5 font-sans text-xs">
                  <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                    <span className="text-slate-500">Dangote Cement 50KG Bag:</span>
                    <strong className="text-slate-800">{activeRegion.cement}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                    <span className="text-slate-500">Reinforcement Steel Ton:</span>
                    <strong className="text-slate-800">{activeRegion.steel}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                    <span className="text-slate-500">River Sand 20-Ton:</span>
                    <strong className="text-slate-800">{activeRegion.sand}</strong>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[#2563eb] italic font-medium leading-relaxed border-t border-slate-200 pt-3 mt-4">
                <strong>Local pricing behavior:</strong> {activeRegion.trend}
              </div>
            </div>

            {/* Right map vector visualization cards representing Nigerian layout nodes */}
            <div className="md:col-span-2 relative h-[240px] bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:16px_16px] opacity-25"></div>
              
              <div className="text-slate-400 font-mono text-[10px] text-center max-w-sm space-y-4">
                <p className="text-white font-bold opacity-80 uppercase tracking-widest text-[9px]">
                  Visualizing relative deviation indexes:
                </p>
                
                {/* 4 interactive node representations */}
                <div className="flex flex-wrap justify-center gap-4">
                  <div 
                    onClick={() => setSelectedState("Lagos")}
                    className={`w-28 p-3 rounded-xl border select-none cursor-pointer transition-all ${
                      selectedState === "Lagos" ? "bg-[#fea619] border-amber-600 text-slate-950 scale-105 font-bold" : "bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300"
                    }`}
                  >
                    <p className="text-[9px] uppercase font-mono opacity-80 leading-none mb-1">Southwest Group</p>
                    <p className="font-bold text-xs">LAGOS (+12%)</p>
                  </div>
                  <div 
                    onClick={() => setSelectedState("Abuja")}
                    className={`w-28 p-3 rounded-xl border select-none cursor-pointer transition-all ${
                      selectedState === "Abuja" ? "bg-[#fea619] border-amber-600 text-slate-950 scale-105 font-bold" : "bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300"
                    }`}
                  >
                    <p className="text-[9px] uppercase font-mono opacity-80 leading-none mb-1">Federal Core</p>
                    <p className="font-bold text-xs">ABUJA (+21%)</p>
                  </div>
                  <div 
                    onClick={() => setSelectedState("Port Harcourt")}
                    className={`w-28 p-3 rounded-xl border select-none cursor-pointer transition-all ${
                      selectedState === "Port Harcourt" ? "bg-[#fea619] border-amber-600 text-slate-950 scale-105 font-bold" : "bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300"
                    }`}
                  >
                    <p className="text-[9px] uppercase font-mono opacity-80 leading-none mb-1">South Niger Delta</p>
                    <p className="font-bold text-xs">P. HARCOURT (+8%)</p>
                  </div>
                  <div 
                    onClick={() => setSelectedState("Kano")}
                    className={`w-28 p-3 rounded-xl border select-none cursor-pointer transition-all ${
                      selectedState === "Kano" ? "bg-[#fea619] border-amber-600 text-slate-950 scale-105 font-bold" : "bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300"
                    }`}
                  >
                    <p className="text-[9px] uppercase font-mono opacity-80 leading-none mb-1">North Depot</p>
                    <p className="font-bold text-xs">KANO (-10%)</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* LIVE PRICE INDEX SEARCH/TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-headline-md text-slate-900 font-bold text-base leading-none">
              Live Material Volatility Registry Table
            </h4>
            <p className="text-slate-400 text-xs mt-1">Surveillance tracking of raw metrics indices</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search inputs */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-sans text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Vol filter */}
            <select
              value={volatilityFilter}
              onChange={(e) => setVolatilityFilter(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none"
            >
              <option value="ALL">ALL VOLATILITY</option>
              <option value="CRITICAL">CRITICAL ONLY</option>
              <option value="MODERATE">MODERATE ONLY</option>
              <option value="STABLE">STABLE ONLY</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F1F5F9] border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Material Component</th>
                <th className="px-6 py-3.5">Unit Metric</th>
                <th className="px-6 py-3.5">Baseline National Price</th>
                <th className="px-6 py-3.5">Monthly Index (MoM)</th>
                <th className="px-6 py-3.5">Volatility Code Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-xs">
              {filteredMaterials.map((m) => {
                const isCritical = m.volatility === "CRITICAL";
                const isMod = m.volatility === "MODERATE";

                return (
                  <tr key={m.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{m.name}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{m.unit}</td>
                    <td className="px-6 py-4 font-mono font-bold">
                      ₦{Math.round(m.numericPrice * settings.inflationMultiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })}.00
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {m.trendDirection === "up" ? (
                          <TrendingUp className="w-3.5 h-3.5 text-[#ba1a1a]" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span className={`font-mono font-bold ${m.trendDirection === "up" ? "text-[#ba1a1a]" : "text-emerald-600"}`}>
                          {m.trend}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 font-mono text-[9px] font-bold rounded uppercase ${
                        isCritical
                          ? "bg-rose-50 text-[#ba1a1a]"
                          : isMod
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {m.volatility}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => alert(`Accessing pricing ledger audits for ${m.name}. Historical pricing datasets active.`)}
                        className="text-[#004ac6] hover:text-[#2563eb] font-mono text-[9px] font-black uppercase hover:underline cursor-pointer"
                      >
                        VIEW LEDGER
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
