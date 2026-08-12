import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Sparkles, Activity } from "lucide-react";
import { SystemSettings, MarketMaterial } from "../types";

interface MaterialTickerProps {
  settings: SystemSettings;
  materialsList: MarketMaterial[];
}

interface LocalTickerItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  basePrice: number;
  fluctuation: number; // small positive/negative offset
  trend: "up" | "down" | "stable";
}

export default function MaterialTicker({ settings, materialsList }: MaterialTickerProps) {
  // Store local copy of pricing with dynamic ticking changes
  const [tickerItems, setTickerItems] = useState<LocalTickerItem[]>([]);

  useEffect(() => {
    // Setup initial list from the master materials lists
    const initialItems = materialsList.map((m, index) => {
      let category = "STRUCTURAL";
      let cleanName = m.name;
      const match = m.name.match(/\[([A-Z &]+)\]/);
      if (match) {
        category = match[1];
        cleanName = m.name.replace(/\[[A-Z &]+\]/, "").trim();
      }
      return {
        id: `m-${index}-${category}`,
        name: cleanName,
        category,
        unit: m.unit,
        basePrice: m.numericPrice,
        fluctuation: 0,
        trend: m.trendDirection
      };
    });
    setTickerItems(initialItems);
  }, [materialsList]);

  // Simulate ultra-responsive micro price fluctuations inside the ticker feed (mimics live stock markets)
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerItems(prev => {
        if (prev.length === 0) return prev;
        // Turn index select
        const randomIndex = Math.floor(Math.random() * prev.length);
        return prev.map((item, idx) => {
          if (idx === randomIndex) {
            const pctChange = (Math.random() * 0.4 - 0.2); // -0.2% to +0.2% change
            const newFluc = Number((item.fluctuation + pctChange).toFixed(3));
            return {
              ...item,
              fluctuation: newFluc,
              trend: pctChange > 0 ? "up" : pctChange < 0 ? "down" : item.trend
            };
          }
          return item;
        });
      });
    }, 12000); // Slower updates for a calm, realistic feel

    return () => clearInterval(interval);
  }, []);

  // Format price helper with active multiplier
  const renderItemPrice = (item: LocalTickerItem) => {
    const rawCalibrated = item.basePrice * settings.inflationMultiplier;
    const finalPrice = rawCalibrated * (1 + item.fluctuation / 100);
    return Math.round(finalPrice).toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  // Category Color Map
  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case "CONCRETE":
        return "bg-slate-700 text-slate-100 border-slate-600";
      case "ELECTRICAL":
        return "bg-amber-950/40 text-amber-300 border-amber-900/30";
      case "ROOFING":
        return "bg-purple-950/40 text-purple-300 border-purple-900/30";
      case "PAINTING":
        return "bg-blue-950/40 text-blue-300 border-blue-900/30";
      case "LANDSCAPING":
        return "bg-emerald-950/40 text-emerald-300 border-emerald-900/30";
      case "PLUMBING":
        return "bg-cyan-950/40 text-cyan-300 border-cyan-900/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="w-full bg-[#0b0f19] border-b border-slate-900 text-slate-100 h-9 flex items-center shadow-md relative overflow-hidden select-none z-50">
      
      {/* Ticker Indicator Side Label */}
      <div className="h-full px-4 bg-[#004ac6] text-white flex items-center gap-1.5 shrink-0 z-20 shadow-lg relative font-mono text-[9px] uppercase font-black tracking-widest">
        <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="shrink-0">LIVE COST INDEX</span>
        <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-r from-transparent to-black/20 pointer-events-none"></div>
      </div>

      {/* Styled Continuous Scrolling Container */}
      <div className="flex-1 overflow-hidden h-full flex items-center relative">
        <div className="animate-ticker flex items-center gap-10">
          
          {/* Double-render items array to construct a seamless endless loop */}
          {[1, 2].map((loopId) => (
            <div key={loopId} className="flex items-center gap-10 shrink-0">
              {tickerItems.map((item, index) => {
                const totalChange = item.fluctuation;
                const isPositive = totalChange >= 0;

                return (
                  <div 
                    key={`${loopId}-${item.id}-${index}`} 
                    className="flex items-center gap-2 text-xs font-sans hover:bg-slate-800 px-2 py-0.5 rounded transition-all duration-150 group"
                  >
                    {/* Category indicator */}
                    <span className={`text-[8px] px-1.5 py-px rounded font-mono font-bold uppercase border ${getCategoryStyle(item.category)}`}>
                      {item.category}
                    </span>

                    <span className="text-slate-300 font-medium tracking-tight whitespace-nowrap">
                      {item.name} <span className="text-[10px] text-slate-550 font-mono">({item.unit})</span>: 
                    </span>
                    
                    <span className="font-mono font-extrabold text-[#ffffff] whitespace-nowrap">
                      ₦{renderItemPrice(item)}
                    </span>

                    {/* Change deviation bubbles */}
                    <div className={`flex items-center gap-0.5 font-mono text-[10px] b-1.5 px-1 py-px rounded font-bold ${
                      totalChange > 0 
                        ? "text-emerald-400 bg-emerald-950/40" 
                        : totalChange < 0 
                        ? "text-rose-400 bg-rose-950/40" 
                        : "text-slate-400 bg-slate-800/40"
                    }`}>
                      {totalChange > 0 && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                      {totalChange < 0 && <TrendingDown className="w-3 h-3 text-rose-400" />}
                      <span>{totalChange >= 0 ? "+" : ""}{totalChange.toFixed(2)}%</span>
                    </div>
                  </div>
                );
              })}
              
              {/* Extra index status logs spacer for visual aesthetics */}
              <div className="h-4 w-px bg-slate-800"></div>
              <span className="font-mono text-[10px] text-yellow-500 font-black uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>MULTILATERAL NIGERIAN PRICE SURVEYS</span>
              </span>
              <div className="h-4 w-px bg-slate-800"></div>
            </div>
          ))}

        </div>
      </div>

      {/* Custom Keyframe animation style injected cleanly */}
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-ticker {
          display: inline-flex;
          white-space: nowrap;
          animation: ticker-scroll 100s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
