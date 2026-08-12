import React, { useState, useMemo } from "react";
import { 
  MapPin, 
  AlertTriangle, 
  CloudRain, 
  Search, 
  Sliders, 
  Gauge, 
  CheckCircle2, 
  Info, 
  Wind, 
  Thermometer, 
  Droplets, 
  Database, 
  Sparkles, 
  TrendingUp, 
  Compass, 
  Layers,
  ChevronRight,
  ShieldAlert,
  Moon,
  Sun
} from "lucide-react";
import { ActiveProject, RiskAlert, RiskIncident, SystemSettings } from "../types";

interface MapHotspot {
  id: string; // matches project id if applicable, or custom
  name: string;
  location: string;
  zone: 'SOUTH-WEST' | 'NORTH-CENTRAL' | 'SOUTH-SOUTH' | 'NORTH-WEST' | 'SOUTH-EAST' | 'NORTH-EAST';
  x: number; // SVG position
  y: number; // SVG position
  temperature: number;
  humidity: number;
  precipitation: number; // probability percentage
  soilStability: 'CRITICAL_RISK' | 'UNSTABLE' | 'STABLE';
  soilType: string;
  localMaterialMultiplier: number;
  crewsDeployed: number;
}

interface GeographicalMapViewProps {
  settings: SystemSettings;
  activeProjects: ActiveProject[];
  setActiveProjects: React.Dispatch<React.SetStateAction<ActiveProject[]>>;
  riskAlerts: RiskAlert[];
  setRiskAlerts: React.Dispatch<React.SetStateAction<RiskAlert[]>>;
  incidents: RiskIncident[];
  setIncidents: React.Dispatch<React.SetStateAction<RiskIncident[]>>;
}

export default function GeographicalMapView({
  settings,
  activeProjects,
  setActiveProjects,
  riskAlerts,
  setRiskAlerts,
  incidents,
  setIncidents
}: GeographicalMapViewProps) {
  // Base state filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [showPrecipitationOverlay, setShowPrecipitationOverlay] = useState(true);
  const [showConfluenceLayer, setShowConfluenceLayer] = useState(true);
  const [mapTheme, setMapTheme] = useState<'blueprint' | 'tactical-dark'>('tactical-dark');

  // Static list of geographical infrastructure projects + newly added spots 
  const [hotspots, setHotspots] = useState<MapHotspot[]>([
    {
      id: "#BP-2026-001", // Lagos Island, VI Hub
      name: "Lagos Island High-Rise Harbour & VI Hub",
      location: "Lagos Island, VI Hub",
      zone: "SOUTH-WEST",
      x: 200,
      y: 435,
      temperature: 31,
      humidity: 88,
      precipitation: 92,
      soilStability: "CRITICAL_RISK",
      soilType: "Coarse Subsurface Sand / Marine Mud",
      localMaterialMultiplier: 1.08,
      crewsDeployed: 5
    },
    {
      id: "#BP-2026-004", // Abuja Central Tech Overpass
      name: "Abuja Central Tech Overpass & Bypass",
      location: "Abuja Central Tech Overpass",
      zone: "NORTH-CENTRAL",
      x: 430,
      y: 260,
      temperature: 38,
      humidity: 42,
      precipitation: 15,
      soilStability: "STABLE",
      soilType: "Laterite Clay-Sand Mix / Low Moisture Void",
      localMaterialMultiplier: 1.12,
      crewsDeployed: 4
    },
    {
      id: "#BP-2026-009", // Port Harcourt Wharf
      name: "Port Harcourt Wharf D-Line Transit Overpass",
      location: "Port Harcourt Wharf",
      zone: "SOUTH-SOUTH",
      x: 450,
      y: 455,
      temperature: 29,
      humidity: 94,
      precipitation: 95,
      soilStability: "UNSTABLE",
      soilType: "High Subsurface Water / Saturated Silt Clay",
      localMaterialMultiplier: 1.22,
      crewsDeployed: 3
    },
    {
      id: "#BP-2026-015", // Kano Logistics Depot
      name: "Kano Logistics Depot & Dry Port Grid",
      location: "Kano Logistics Depot",
      zone: "NORTH-WEST",
      x: 410,
      y: 110,
      temperature: 41,
      humidity: 24,
      precipitation: 5,
      soilStability: "STABLE",
      soilType: "Dry Compact Silts / Consolidated Hardpan",
      localMaterialMultiplier: 0.95,
      crewsDeployed: 2
    },
    {
      id: "CUSTOM-005", // Enugu Coal-City Bridge
      name: "Enugu Coal-City Link Bridge Expansion",
      location: "Enugu, Southeast Corridor",
      zone: "SOUTH-EAST",
      x: 490,
      y: 395,
      temperature: 32,
      humidity: 62,
      precipitation: 40,
      soilStability: "STABLE",
      soilType: "Weathered Sandstone / Compact Silt",
      localMaterialMultiplier: 1.04,
      crewsDeployed: 2
    },
    {
      id: "CUSTOM-006", // Kaduna Dry Port Link
      name: "Kaduna-Kano Integrated Rail Corridor Junction",
      location: "Kaduna Rail Junction",
      zone: "NORTH-WEST",
      x: 350,
      y: 190,
      temperature: 36,
      humidity: 32,
      precipitation: 10,
      soilStability: "STABLE",
      soilType: "Deep Red Sandy Laterites",
      localMaterialMultiplier: 1.05,
      crewsDeployed: 3
    },
    {
      id: "CUSTOM-007", // Maiduguri Solar Grid
      name: "Maiduguri Solar Substation & Feed Grid",
      location: "Maiduguri East Grid",
      zone: "NORTH-EAST",
      x: 740,
      y: 90,
      temperature: 44,
      humidity: 12,
      precipitation: 2,
      soilStability: "STABLE",
      soilType: "Loose Sandy Dunes / Alluvial Fan Sands",
      localMaterialMultiplier: 1.15,
      crewsDeployed: 1
    }
  ]);

  // Selected hotspot state - default to Abuja Central
  const [activeHotspotId, setActiveHotspotId] = useState<string>("#BP-2026-004");

  // Lookup selected hotspot details
  const activeSpot = useMemo(() => {
    return hotspots.find(h => h.id === activeHotspotId) || hotspots[0];
  }, [hotspots, activeHotspotId]);

  // Connect active master project risks to hotspots
  const getProjectRiskLevel = (locationName: string): 'HIGH ALERT' | 'MODERATE' | 'STABLE' => {
    const proj = activeProjects.find(p => p.location.toLowerCase().includes(locationName.toLowerCase()) || locationName.toLowerCase().includes(p.location.toLowerCase()));
    if (proj) return proj.riskLevel;
    // For custom added spots, classify based on rainfall/stability
    const spot = hotspots.find(h => h.location === locationName);
    if (spot) {
      if (spot.precipitation > 85 || spot.soilStability === "CRITICAL_RISK") return "HIGH ALERT";
      if (spot.precipitation > 50 || spot.soilStability === "UNSTABLE") return "MODERATE";
    }
    return "STABLE";
  };

  // Filter hotspots based on search queries and select boxes
  const filteredHotspots = useMemo(() => {
    return hotspots.filter(h => {
      const matchSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.zone.toLowerCase().includes(searchQuery.toLowerCase());
      const matchZone = selectedZone === "ALL" || h.zone === selectedZone;
      
      const realRisk = getProjectRiskLevel(h.location);
      const matchSeverity = selectedSeverity === "ALL" || 
                            (selectedSeverity === "HIGH" && realRisk === "HIGH ALERT") ||
                            (selectedSeverity === "MODERATE" && realRisk === "MODERATE") ||
                            (selectedSeverity === "STABLE" && realRisk === "STABLE");

      return matchSearch && matchZone && matchSeverity;
    });
  }, [hotspots, searchQuery, selectedZone, selectedSeverity, activeProjects]);

  // Handle evacuations inside Geographical Map View
  const handleTriggerWeatherEvacuation = (id: string) => {
    const spot = hotspots.find(h => h.id === id);
    if (!spot) return;

    // First generate localized notifications
    const formatTimestamp = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }) + `, ${new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })}`;

    // Dispatch a critical log to top level
    const alertId = `ALR-MAP-${Date.now().toString().slice(-4)}`;
    const systemAlertObj: RiskAlert = {
      id: alertId,
      severity: "CRITICAL",
      time: "Just now",
      title: `Emergency Signal: evacuation at ${spot.location}`,
      description: `CEO Imo Joseph dispatched an immediate weather-induced force majeure evacuation command at ${spot.name}. Soil moisture saturation metrics reached critically high thresholds.`,
      actionMessage: "Automated SMS alerts transmitted to all regional project managers."
    };
    setRiskAlerts(prev => [systemAlertObj, ...prev]);

    // Save incident report
    const incidentId = `INC-MAP-${Date.now().toString().slice(-4)}`;
    const systemIncidentObj: RiskIncident = {
      id: incidentId,
      date: formatTimestamp,
      type: "Weather Strike",
      severity: "CRITICAL",
      description: `Active Site Shut-down ordered for ${spot.name} over critical rainfall danger (${spot.precipitation}% intensity). Structural stability compromised.`,
      status: "Logged"
    };
    setIncidents(prev => [systemIncidentObj, ...prev]);

    // Elevate matching global project level to HIGH ALERT
    setActiveProjects(prev => prev.map(p => {
      if (p.location.toLowerCase().includes(spot.location.toLowerCase()) || spot.location.toLowerCase().includes(p.location.toLowerCase())) {
        return { ...p, riskLevel: "HIGH ALERT", budgetStatus: `${p.budgetStatus.split(" ")[0]} (Canceled)` };
      }
      return p;
    }));

    // Alert completion message
    alert(`[CEO TRANSMISSION SUCCESSFUL] Emergency Evacuation Commanded!\nProject: ${spot.name}\nRegional telemetry safety records have been updated to CRITICAL. Check the Alerts log inside your workspace.`);
  };

  // Quick reset to STABLE level for audit purposes
  const handleClearRegionalAlert = (id: string) => {
    const spot = hotspots.find(h => h.id === id);
    if (!spot) return;

    setActiveProjects(prev => prev.map(p => {
      if (p.location.toLowerCase().includes(spot.location.toLowerCase()) || spot.location.toLowerCase().includes(p.location.toLowerCase())) {
        return { ...p, riskLevel: "STABLE", budgetStatus: "₦" + (p.budgetDelta > 0 ? "4.2B" : "1.8B") + " (Optimal status)" };
      }
      return p;
    }));

    alert(`Telemetry cleared! ${spot.location} status set back to STABLE.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="font-mono text-xs text-[#004ac6] uppercase font-bold tracking-widest leading-none block mb-1">
            BuildWise AI // GIS & Spatial Visualizer
          </span>
          <h2 className="font-display-lg text-3xl font-extrabold text-slate-900 leading-tight">
            Geographical Hotspots Map
          </h2>
        </div>

        {/* Configuration settings & Layer toggles */}
        <div className="flex items-center gap-3">
          {/* Theme select option */}
          <button
            onClick={() => setMapTheme(m => m === 'blueprint' ? 'tactical-dark' : 'blueprint')}
            className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs uppercase font-label-caps rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            title="Toggle theme styling of the map background texture"
          >
            {mapTheme === 'blueprint' ? <Moon className="w-3.5 h-3.5 text-blue-600" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span>Theme: {mapTheme === 'blueprint' ? "Blueprint Blue" : "Tactical Dark"}</span>
          </button>

          <button
            onClick={() => setShowPrecipitationOverlay(prev => !prev)}
            className={`px-3 py-2 border rounded-lg font-bold text-xs uppercase font-label-caps transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              showPrecipitationOverlay 
                ? "bg-sky-50 border-sky-300 text-sky-800" 
                : "bg-white border-slate-300 text-slate-500 hover:bg-slate-50"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Precipitation Layer: {showPrecipitationOverlay ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={() => setShowConfluenceLayer(prev => !prev)}
            className={`px-3 py-2 border rounded-lg font-bold text-xs uppercase font-label-caps transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              showConfluenceLayer 
                ? "bg-cyan-50 border-cyan-300 text-cyan-800" 
                : "bg-white border-slate-300 text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Niger River System: {showConfluenceLayer ? "ON" : "OFF"}</span>
          </button>
        </div>
      </div>

      {/* Filter and search utilities row */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Keyword Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search hotspots, states, names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto justify-end">
          
          <div className="flex items-center gap-2 text-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-bold uppercase tracking-wide text-[10px]">Zone:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-slate-100 border-0 rounded-md px-2.5 py-1.5 focus:outline-none text-slate-700 font-bold text-[11px]"
            >
              <option value="ALL">ALL ZONES</option>
              <option value="SOUTH-WEST">SOUTH-WEST</option>
              <option value="NORTH-CENTRAL">NORTH-CENTRAL</option>
              <option value="SOUTH-SOUTH">SOUTH-SOUTH</option>
              <option value="NORTH-WEST">NORTH-WEST</option>
              <option value="SOUTH-EAST">SOUTH-EAST</option>
              <option value="NORTH-EAST">NORTH-EAST</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wide text-[10px]">Severity Level:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-100 border-0 rounded-md px-2.5 py-1.5 focus:outline-none text-slate-700 font-bold text-[11px]"
            >
              <option value="ALL">ALL LEVELS</option>
              <option value="HIGH">CRITICAL / HIGH ALERT</option>
              <option value="MODERATE">MODERATE</option>
              <option value="STABLE">STABLE</option>
            </select>
          </div>

          <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 font-mono px-3 py-1.5 rounded-md font-bold">
            Showing {filteredHotspots.length} Hotspots
          </span>

        </div>
      </div>

      {/* Main Two Column Work Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        
        {/* Column 1: Interactive GIS SVG Geographical Map Grid (7 cols) */}
        <div className={`xl:col-span-7 rounded-2xl p-6 border flex flex-col justify-between transition-all relative overflow-hidden min-h-[580px] shadow-lg ${
          mapTheme === 'tactical-dark' 
            ? "bg-[#0b0f19] border-slate-900 text-slate-100" 
            : "bg-[#0c1a30] border-blue-900/50 text-slate-100"
        }`}>
          {/* Background Technical Grid Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] md:[background-size:24px_24px] [background-size:16px_16px] opacity-30 pointer-events-none"></div>

          {/* Map Title and Scale metadata overlay */}
          <div className="absolute top-4 left-4 z-20 space-y-1 bg-slate-950/80 p-3 rounded-lg border border-slate-800 backdrop-blur-xs">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#38bdf8]">
              <span className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full animate-ping"></span>
              FEDERAL GEO-SPATIAL SYSTEM ACTIVE
            </div>
            <p className="text-[10px] text-slate-450 font-mono leading-none m-0">COORDINATE REFERENCE: WGS 84 • NIGERIA SIGMA 4.2</p>
          </div>

          <div className="absolute top-4 right-4 z-20 bg-slate-950/80 p-3 rounded-lg border border-slate-800 backdrop-blur-xs font-mono text-[10px] text-slate-450 text-right">
            <p>RAIN HAZARD MULTIPLIERS:</p>
            <p className="text-rose-400 font-bold">COASTAL DEPRESSIONS: +22.5% max</p>
          </div>

          {/* SVG Map Container */}
          <div className="flex-1 w-full flex items-center justify-center relative my-12 z-10 select-none">
            
            <svg 
              className="w-full max-w-[800px] aspect-[4/3] drop-shadow-2xl" 
              viewBox="0 0 900 600" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* STYLISH CHANNELS KEY (Background Rivers representation) */}
              {showConfluenceLayer && (
                <g id="confluence-rivers" className="opacity-70">
                  {/* Niger River flowing from West high (Yelwa/Sokoto border) down to Lokoja */}
                  <path 
                    d="M 100 120 C 130 180, 200 240, 310 280 C 350 295, 390 305, 430 310" 
                    stroke="#0284c7" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    fill="none"
                    className="stroke-dasharray-anim"
                  />
                  {/* Benue River flowing from Far East down to meeting confluence at Lokoja/Abuja area */}
                  <path 
                    d="M 800 280 C 700 290, 600 310, 500 310 C 470 310, 440 310, 430 310" 
                    stroke="#0284c7" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    fill="none"
                  />
                  {/* Main South Channel flowing from Lokoja down to Port Harcourt delta split */}
                  <path 
                    d="M 430 310 C 435 340, 430 380, 440 420 C 445 440, 435 460, 430 480" 
                    stroke="#0284c7" 
                    strokeWidth="5.5" 
                    strokeLinecap="round" 
                    fill="none"
                  />
                  {/* Delta tributaries distributaries split */}
                  <path d="M 430 440 L 390 475" stroke="#0284c7" strokeWidth="2.5" fill="none" />
                  {/* Confluence Pulsing Beacon */}
                  <circle cx="430" cy="310" r="4" fill="#60a5fa" className="animate-pulse" />
                  <text x="440" y="305" fill="#38bdf8" className="font-mono text-[9px] font-bold">Niger-Benue Confluence</text>
                </g>
              )}

              {/* Rain layer representing southern moisture-front moving up from the Atlantic */}
              {showPrecipitationOverlay && (
                <g id="precipitation-radar-front" className="opacity-30 pointer-events-none">
                  {/* Front heavy storm shape near Atlantic Coast */}
                  <rect x="110" y="380" width="460" height="150" rx="30" fill="url(#rainGradient1)" className="animate-pulse" />
                  <rect x="360" y="360" width="280" height="180" rx="40" fill="url(#rainGradient2)" />
                  <text x="140" y="475" fill="#22d3ee" className="font-mono text-[10px] font-extrabold tracking-widest uppercase italic animate-pulse">Precipitation Storm Front (Wet Season Max)</text>
                </g>
              )}

              {/* GEPOLITICAL GEOGRAPHIC ZONES SUB-GROUPS */}
              {/* Every zone has interactive styles */}
              <g id="geopolitical-zones" className="stroke-[#1e293b]/50 stroke-width-[1.5]">
                
                {/* 1. NORTH WEST */}
                <path 
                  d="M 140 120 L 220 50 L 380 50 L 460 110 L 440 210 L 370 250 L 250 230 L 190 200 Z" 
                  fill={selectedZone === "NORTH-WEST" ? "#1e3a8a" : "#1e293b"} 
                  fillOpacity={selectedZone === "ALL" || selectedZone === "NORTH-WEST" ? "0.38" : "0.15"} 
                  className="transition-all hover:fill-blue-900/40 hover:fill-opacity-50 cursor-pointer duration-300"
                  onClick={() => setSelectedZone("NORTH-WEST")}
                />
                <text x="260" y="110" fill="#64748b" className="font-mono text-[10px] tracking-wider pointer-events-none">NORTH-WEST</text>

                {/* 2. NORTH EAST */}
                <path 
                  d="M 460 110 L 470 50 L 590 50 L 780 70 L 790 240 L 730 285 L 630 190 L 480 200 Z" 
                  fill={selectedZone === "NORTH-EAST" ? "#1e3a8a" : "#1e293b"} 
                  fillOpacity={selectedZone === "ALL" || selectedZone === "NORTH-EAST" ? "0.38" : "0.15"}
                  className="transition-all hover:fill-blue-900/40 hover:fill-opacity-50 cursor-pointer duration-300"
                  onClick={() => setSelectedZone("NORTH-EAST")}
                />
                <text x="610" y="140" fill="#64748b" className="font-mono text-[10px] tracking-wider pointer-events-none">NORTH-EAST</text>

                {/* 3. NORTH CENTRAL / MIDDLE BELT */}
                <path 
                  d="M 190 200 L 250 230 L 370 250 L 480 200 L 630 190 L 610 320 L 500 350 L 320 310 L 180 290 Z" 
                  fill={selectedZone === "NORTH-CENTRAL" ? "#1e3a8a" : "#1e293b"} 
                  fillOpacity={selectedZone === "ALL" || selectedZone === "NORTH-CENTRAL" ? "0.38" : "0.15"}
                  className="transition-all hover:fill-blue-900/40 hover:fill-opacity-50 cursor-pointer duration-300"
                  onClick={() => setSelectedZone("NORTH-CENTRAL")}
                />
                <text x="350" y="225" fill="#64748b" className="font-mono text-[10px] tracking-wider pointer-events-none">NORTH-CENTRAL</text>

                {/* 4. SOUTH WEST */}
                <path 
                  d="M 180 290 L 320 310 L 280 440 L 130 420 Z" 
                  fill={selectedZone === "SOUTH-WEST" ? "#1e3a8a" : "#1e293b"} 
                  fillOpacity={selectedZone === "ALL" || selectedZone === "SOUTH-WEST" ? "0.45" : "0.15"}
                  className="transition-all hover:fill-blue-900/40 hover:fill-opacity-50 cursor-pointer duration-300"
                  onClick={() => setSelectedZone("SOUTH-WEST")}
                />
                <text x="180" y="340" fill="#64748b" className="font-mono text-[10px] tracking-wider pointer-events-none">SOUTH-WEST</text>

                {/* 5. SOUTH EAST */}
                <path 
                  d="M 320 310 L 440 330 L 430 440 L 330 440 Z" 
                  fill={selectedZone === "SOUTH-EAST" ? "#1e3a8a" : "#1e293b"} 
                  fillOpacity={selectedZone === "ALL" || selectedZone === "SOUTH-EAST" ? "0.45" : "0.15"}
                  className="transition-all hover:fill-blue-900/40 hover:fill-opacity-50 cursor-pointer duration-300"
                  onClick={() => setSelectedZone("SOUTH-EAST")}
                />
                <text x="350" y="375" fill="#64748b" className="font-mono text-[10px] tracking-wider pointer-events-none">SOUTH-EAST</text>

                {/* 6. SOUTH SOUTH */}
                <path 
                  d="M 280 440 L 430 440 L 440 330 L 500 350 L 610 320 L 580 480 L 410 490 L 280 440" 
                  fill={selectedZone === "SOUTH-SOUTH" ? "#1e3a8a" : "#1e293b"} 
                  fillOpacity={selectedZone === "ALL" || selectedZone === "SOUTH-SOUTH" ? "0.45" : "0.15"}
                  className="transition-all hover:fill-blue-900/40 hover:fill-opacity-50 cursor-pointer duration-300"
                  onClick={() => setSelectedZone("SOUTH-SOUTH")}
                />
                <text x="490" y="425" fill="#64748b" className="font-mono text-[10px] tracking-wider pointer-events-none">SOUTH-SOUTH</text>

              </g>

              {/* Definitions mapping */}
              <defs>
                <linearGradient id="rainGradient1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0891b2" stopOpacity="0.0" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.25" />
                </linearGradient>
                <linearGradient id="rainGradient2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.0" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.3" />
                </linearGradient>
              </defs>

            </svg>

            {/* HOTSPOT COMPONENT DOTS POSITIONS OVER SVG */}
            {filteredHotspots.map((spot) => {
              const risk = getProjectRiskLevel(spot.location);
              const isActive = spot.id === activeHotspotId;

              // Color indicators corresponding to standard codes
              let pulseColor = "bg-emerald-500";
              let ringColor = "border-emerald-500/50";
              let baseBg = "bg-emerald-600";
              
              if (risk === "HIGH ALERT") {
                pulseColor = "bg-rose-500";
                ringColor = "border-rose-500/70";
                baseBg = "bg-rose-600 animate-bounce";
              } else if (risk === "MODERATE") {
                pulseColor = "bg-amber-500";
                ringColor = "border-amber-500/70";
                baseBg = "bg-amber-600";
              }

              // Direct percentage-based positions to coordinates
              // Our bounding box is SVG 900x600.
              const pctLeft = (spot.x / 900) * 100;
              const pctTop = (spot.y / 600) * 100;

              return (
                <div
                  key={spot.id}
                  style={{ left: `${pctLeft}%`, top: `${pctTop}%` }}
                  onClick={() => setActiveHotspotId(spot.id)}
                  className="absolute -translate-y-1/2 -translate-x-1/2 z-30 group cursor-pointer"
                >
                  {/* Outer glowing pulsing ring */}
                  <span className={`absolute -inset-2.5 rounded-full border-2 ${ringColor} ${isActive ? "scale-125 animate-ping opacity-90" : "animate-pulse opacity-50"}`}></span>
                  <span className={`absolute -inset-4 rounded-full border ${ringColor} opacity-20 group-hover:block hidden`}></span>
                  
                  {/* Core pointer */}
                  <span className={`relative block w-5 h-5 ${baseBg} border-2 border-[#000a16] rounded-full shadow-lg flex items-center justify-center`}>
                    {/* Tiny alert icon if critical */}
                    {risk === "HIGH ALERT" ? (
                      <span className="text-[9px] font-black text-white font-mono leading-none">!</span>
                    ) : (
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    )}
                  </span>

                  {/* Tiny floating label */}
                  <div className={`absolute left-6 top-1/2 -translate-y-1/2 bg-slate-950/90 text-white border px-2 py-0.5 rounded font-mono text-[8px] uppercase tracking-wider whitespace-nowrap z-20 ${
                    isActive ? "border-amber-400 text-amber-400" : "border-slate-800 text-slate-300"
                  }`}>
                    {spot.location.split(",")[0]}
                  </div>

                </div>
              );
            })}

          </div>

          {/* Quick Stats Summary footer bar */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 mt-4 font-sans text-xs flex flex-wrap gap-4 items-center justify-between z-15">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-400 font-mono text-[10px] uppercase">Telemetry Markers:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-600 border border-rose-500"></span>
                <span className="text-slate-300 font-mono text-[9px]">Critical Evacuation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 border border-amber-400"></span>
                <span className="text-slate-300 font-mono text-[9px]">Rain Volatility</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 border border-emerald-400"></span>
                <span className="text-slate-300 font-mono text-[9px]">Stable Operations</span>
              </div>
            </div>

            <div className="text-slate-450 font-mono text-[10px] self-end xl:self-auto uppercase">
               Active Hub Signatory: <strong>Imo Joseph (CEO)</strong>
            </div>
          </div>

        </div>

        {/* Column 2: Selected Hotspot Telemetry Dashboard Inspector (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          
          {/* Active Spot Metadata Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm font-sans m-0">{activeSpot.location}</h3>
                    <p className="text-[9px] text-[#fea619] font-mono font-bold uppercase tracking-wider">
                      {activeSpot.zone} GEOGRAPHICAL ZONE
                    </p>
                  </div>
                </div>
                
                {/* Visual Status badge */}
                <span className={`px-2.5 py-1 rounded-full font-mono text-[9px] font-black uppercase text-right ${
                  getProjectRiskLevel(activeSpot.location) === "HIGH ALERT"
                    ? "bg-rose-100 text-[#ba1a1a] border border-rose-200"
                    : getProjectRiskLevel(activeSpot.location) === "MODERATE"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}>
                  {getProjectRiskLevel(activeSpot.location)}
                </span>
              </div>

              {/* Informational Paragraph */}
              <p className="text-xs text-slate-500 leading-relaxed font-sans mb-5">
                Spatial telemetry feed capturing live environmental factors and localized resource constraints on target infrastructure grids.
              </p>

              {/* Geo Info Grid stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-br from-amber-105 to-amber-100 rounded text-amber-600 shrink-0">
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-mono font-bold leading-none mb-1">Temperature</p>
                    <p className="text-sm font-sans font-black text-slate-800 m-0">{activeSpot.temperature}°C</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex items-center gap-2.5">
                  <div className="p-2 bg-sky-50 text-sky-600 rounded shrink-0">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-mono font-bold leading-none mb-1">Humidity</p>
                    <p className="text-sm font-sans font-black text-slate-800 m-0">{activeSpot.humidity}% RH</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex items-center gap-2.5">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded shrink-0">
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-mono font-bold leading-none mb-1">Precipitation</p>
                    <p className="text-sm font-sans font-black text-slate-800 m-0">{activeSpot.precipitation}%</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded shrink-0">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-mono font-bold leading-none mb-1">Crews Active</p>
                    <p className="text-sm font-sans font-black text-slate-800 m-0">{activeSpot.crewsDeployed} Leads</p>
                  </div>
                </div>

              </div>

              {/* Sub-Surface Geological Analysis */}
              <div className="space-y-4 font-sans text-xs text-slate-700">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-400 uppercase tracking-wide text-[9px] font-mono">Geotechnical Soil Profiles & Moisture Grid</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-650 text-[11px] font-mono space-y-1">
                    <p><strong>Lithology Profile:</strong> {activeSpot.soilType}</p>
                    <p>
                      <strong>Stability Standard:</strong>{" "}
                      <span className={`font-bold ${
                        activeSpot.soilStability === "CRITICAL_RISK" ? "text-rose-600 animate-pulse" : activeSpot.soilStability === "UNSTABLE" ? "text-amber-600" : "text-emerald-700"
                      }`}>
                        {activeSpot.soilStability}
                      </span>
                    </p>
                    <p><strong>Baseline Saturation Index:</strong> {(activeSpot.precipitation * 0.85).toFixed(1)}% Sat.</p>
                  </div>
                </div>

                {/* Local Material Escalations */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-400 uppercase tracking-wide text-[9px] font-mono">Localized Procurement Price Variance</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-650 text-[11px] font-mono space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Regional Index Modifier:</span>
                      <span className="font-bold text-slate-900">
                        {activeSpot.localMaterialMultiplier > 1 
                          ? `+${((activeSpot.localMaterialMultiplier - 1) * 100).toFixed(0)}% Price Surcharge` 
                          : `${((activeSpot.localMaterialMultiplier - 1) * 100).toFixed(0)}% Under Budget`}
                      </span>
                    </div>

                    <div className="space-y-1 text-[10px] text-slate-500 border-t border-slate-200 pt-1.5">
                      <p>• Estimated Cement Surcharge: ₦{(9850 * activeSpot.localMaterialMultiplier).toLocaleString(undefined, {maximumFractionDigits: 0})} / bag</p>
                      <p>• Estimated 12mm Steel Surcharge: ₦{(1250000 * activeSpot.localMaterialMultiplier).toLocaleString(undefined, {maximumFractionDigits: 0})} / Ton</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* CEO Intervention & Evacuation commands */}
            <div className="border-t border-slate-100 pt-5 mt-6 space-y-3">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                <span>CEO COMMAND INTERVENTION LEVEL</span>
              </div>

              <div className="flex gap-3">
                
                {getProjectRiskLevel(activeSpot.location) === "HIGH ALERT" ? (
                  <button
                    type="button"
                    onClick={() => handleClearRegionalAlert(activeSpot.id)}
                    className="flex-1 py-3 bg-slate-900 text-white font-mono text-[10px] uppercase font-extrabold rounded-xl text-center cursor-pointer hover:bg-slate-800 transition-colors"
                  >
                    CLEAR ALERTMASK & AUDIT
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleTriggerWeatherEvacuation(activeSpot.id)}
                    disabled={activeSpot.precipitation < 10 && activeSpot.soilStability === "STABLE"}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-mono text-[10px] uppercase tracking-wider font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    title={activeSpot.precipitation < 10 && activeSpot.soilStability === "STABLE" ? "Precipitation level is too low for emergency evacuation" : "Command regional force majeure evacuation"}
                  >
                    <CloudRain className="w-4 h-4 animate-bounce" />
                    <span>COMMAND SITE EVACUATION</span>
                  </button>
                )}

              </div>
              <p className="text-[10px] text-slate-400 font-sans italic text-center">
                Site evacuation commands will propagate dynamic risk structures across dashboard metrics instantly.
              </p>
            </div>

          </div>

          {/* Quick Info Box on Nigerian Geography Hotspots */}
          <div className="bg-slate-900 border border-slate-950 text-white rounded-2xl p-6 shadow-sm font-sans space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 m-0 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Spatio-Temporal Insights (Q3 Wet Season)
            </h4>
            
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans m-0">
              During heavy rainfall cycles spanning June to September, the South-West and South-South delta coastlines undergo dynamic sub-surface soil softening. BuildWise spatial models dynamically adjust cement moisture ratio calibrations in these sectors.
            </p>

            <div className="space-y-2 border-t border-slate-800 pt-3">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-400">Rainfall Severity Factor:</span>
                <span className="text-amber-300 font-extrabold">+25% (Saturated Grade)</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-400">Highest Risk Hub:</span>
                <span className="text-rose-400 font-extrabold">Port Harcourt / Lagos Delta</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-400">North Logistics Status:</span>
                <span className="text-emerald-400 font-extrabold">Optimal Stable Ground</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
