import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import DashboardView from "./components/DashboardView";
import CostPredictionsView from "./components/CostPredictionsView";
import RiskAnalysisView from "./components/RiskAnalysisView";
import MarketTrendsView from "./components/MarketTrendsView";
import ProjectSettingsView from "./components/ProjectSettingsView";
import CrewSchedulingView from "./components/CrewSchedulingView";
import GeographicalMapView from "./components/GeographicalMapView";
import WalletView from "./components/WalletView";
import MaterialTicker from "./components/MaterialTicker";
import AuthView from "./components/AuthView";
import { RiskAlert, ActiveProject, MarketMaterial, RiskIncident, SystemSettings, SMSMessage, RegisteredUser } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [aggregateRisk, setAggregateRisk] = useState(78);
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);

  // Shared persistent users and authorization session state
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("buildwise_registered_users");
    let currentUsersListList: RegisteredUser[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          currentUsersListList = parsed.map((u: RegisteredUser) => {
            if (u.id === "USER-ANA-888" && (u.fullName === "Engr. Adeleke" || u.fullName === "Dr. Olushina Olawale Awe" || u.email === "adeleke@buildwise.com")) {
              return {
                ...u,
                fullName: "Prof. Olushina Olawale Awe",
                email: "olushina.awe@buildwise.com",
                companyName: "Federal Engineering Consortium"
              };
            }
            if (u.id === "USER-CEO-777") {
              return {
                ...u,
                fullName: "Master Imo Joseph Okon",
                email: "imojosephmiva@gmail.com",
                companyName: "Federal Engineering Consortium"
              };
            }
            return u;
          });
          // Update persistent item with any migration
          localStorage.setItem("buildwise_registered_users", JSON.stringify(currentUsersListList));
        }
      } catch (e) {
        console.error("Failed to parse users", e);
      }
    }

    if (currentUsersListList.length === 0) {
      // Seed preloaded developer accounts
      currentUsersListList = [
        {
          id: "USER-CEO-777",
          fullName: "Master Imo Joseph Okon",
          email: "imojosephmiva@gmail.com",
          companyName: "Federal Engineering Consortium",
          registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          role: "executive",
          wallet: {
            walletId: "BP-WL-777-CEO",
            balanceUsd: 100,
            balanceNgn: 150000,
            transactions: [
              {
                id: "TX-BONUS-001",
                type: "SIGNUP_BONUS",
                amountUsd: 100,
                amountNgn: 150000,
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleString(),
                description: "Instant Signup Token Credit - Construction Catalyst Fund",
                status: "COMPLETED"
              }
            ]
          }
        },
        {
          id: "USER-ANA-888",
          fullName: "Prof. Olushina Olawale Awe",
          email: "olushina.awe@buildwise.com",
          companyName: "Federal Engineering Consortium",
          registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          role: "analyst",
          wallet: {
            walletId: "BP-WL-888-ANA",
            balanceUsd: 100,
            balanceNgn: 150000,
            transactions: [
              {
                id: "TX-BONUS-002",
                type: "SIGNUP_BONUS",
                amountUsd: 100,
                amountNgn: 150000,
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleString(),
                description: "Instant Signup Token Credit - Construction Catalyst Fund",
                status: "COMPLETED"
              }
            ]
          }
        }
      ];
      localStorage.setItem("buildwise_registered_users", JSON.stringify(currentUsersListList));
    }
    setUsers(currentUsersListList);

    const savedActiveId = localStorage.getItem("buildwise_current_user_id");
    if (savedActiveId) {
      const exists = currentUsersListList.some(u => u.id === savedActiveId);
      if (exists) {
        setActiveUserId(savedActiveId);
      } else {
        setActiveUserId("");
      }
    } else {
      setActiveUserId("");
    }
  }, []);

  const currentUser = users.find(u => u.id === activeUserId) || null;

  // Calibration System baseline parameters
  const [settings, setSettings] = useState<SystemSettings>({
    modelType: "LSTMRF",
    baseCementPrice: 85000,
    baseLaborRate: 28000,
    inflationMultiplier: 1.0,
    simulatedIncidents: 4
  });

  // Default initial active threat alert notifications feed
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([
    {
      id: "INC-2026-004",
      severity: "CRITICAL",
      time: "12m ago",
      title: "Lagos Metro Blue Line: Concrete Grade Shortage",
      description: "Severe lack of moisture-cured reinforcement aggregates is holding back Sector B concrete molds progress. Adjusting timelines."
    },
    {
      id: "ALR-2026-002",
      severity: "MARKET",
      time: "2h ago",
      title: "Surge Forecast: Premium Diesel Fuel (+15.2% Q3)",
      description: "Supply bottlenecks on Lagos expressway expected to boost transport aggregate base rates across primary construction sites during wet season."
    },
    {
      id: "ALR-2026-003",
      severity: "RESOLVED",
      time: "Yesterday",
      title: "Abuja Core Ring Road: Environmental Clean-up",
      description: "Sub-surface moisture pump inspections cleared by district safety. Structural foundation filling resumed."
    }
  ]);

  // Default initial historical incidents registry tables
  const [incidents, setIncidents] = useState<RiskIncident[]>([
    {
      id: "INC-2026-001",
      date: "May 12, 11:24",
      type: "Weather Strike",
      severity: "MEDIUM",
      description: "Heavy subsurface water infiltration registered inside Lekki Zone excavation grids. Trench excavation suspended.",
      status: "Resolved"
    },
    {
      id: "INC-2026-002",
      date: "May 18, 08:45",
      type: "Resource Delay",
      severity: "HIGH",
      description: "Cement supply vessel delayed at Apapa port due to container stack overlap congestion. Sand logistics adjusted.",
      status: "Investigating"
    },
    {
      id: "INC-2026-003",
      date: "May 22, 15:30",
      type: "Safety Violation",
      severity: "LOW",
      description: "Incorrect excavation grade PPE compliance during site structural inspection. Standard reprimand log dispatched.",
      status: "Resolved"
    }
  ]);

  // Default initial portfolio projects list
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([
    {
      id: "#BP-2026-004",
      location: "Abuja Central Tech Overpass",
      budgetStatus: "₦4.2B (+10.5% Overrun)",
      budgetDelta: 140000000,
      riskLevel: "HIGH ALERT",
      completion: 58,
      actualSpend: 3940000000,
      budgetBaseline: 3800000000
    },
    {
      id: "#BP-2026-001",
      location: "Lagos Island, VI Hub",
      budgetStatus: "₦3.4B (Optimal status)",
      budgetDelta: -12000000,
      riskLevel: "STABLE",
      completion: 82,
      actualSpend: 3388000000,
      budgetBaseline: 3400000000
    },
    {
      id: "#BP-2026-009",
      location: "Port Harcourt Wharf",
      budgetStatus: "₦2.1B (+4.1% Slight Change)",
      budgetDelta: 45000000,
      riskLevel: "MODERATE",
      completion: 42,
      actualSpend: 2100000000,
      budgetBaseline: 2055000000
    },
    {
      id: "#BP-2026-015",
      location: "Kano Logistics Depot",
      budgetStatus: "₦1.8B (-3.3% optimal cost)",
      budgetDelta: -22000000,
      riskLevel: "STABLE",
      completion: 94,
      actualSpend: 1800000000,
      budgetBaseline: 1822000000
    }
  ]);

  // Default initial material indices checklist
  const [materials, setMaterials] = useState<MarketMaterial[]>([
    // Concrete Materials
    { name: "Dangote Cement (50kg Bag) [CONCRETE]", unit: "50kg Bag", currentPrice: "₦9,850", numericPrice: 9850, trend: "+4.2%", trendDirection: "up", volatility: "CRITICAL", weight: 0.35 },
    { name: "Ready-Mix Concrete (C25/30 Strength) [CONCRETE]", unit: "Cubic Metre", currentPrice: "₦95,000", numericPrice: 95000, trend: "+3.8%", trendDirection: "up", volatility: "MODERATE", weight: 0.25 },
    { name: "BRC Reinforcement Steel Mesh (A142) [CONCRETE]", unit: "Sheet", currentPrice: "₦38,500", numericPrice: 38500, trend: "+6.4%", trendDirection: "up", volatility: "CRITICAL", weight: 0.18 },
    { name: "River Sand (20 Tons) [CONCRETE]", unit: "20-Ton Load", currentPrice: "₦185,000", numericPrice: 185000, trend: "-1.5%", trendDirection: "down", volatility: "STABLE", weight: 0.10 },
    { name: "Coarse Aggregates (Granite/Gravel) [CONCRETE]", unit: "20-Ton Load", currentPrice: "₦210,000", numericPrice: 210000, trend: "+3.0%", trendDirection: "up", volatility: "MODERATE", weight: 0.08 },

    // Steel & Structural
    { name: "Reinforcement Steel (12mm)", unit: "Ton", currentPrice: "₦1,250,000", numericPrice: 1250000, trend: "+8.2%", trendDirection: "up", volatility: "CRITICAL", weight: 0.45 },
    { name: "Diesel Fuel (Litre)", unit: "Litre", currentPrice: "₦1,420", numericPrice: 1420, trend: "+14.8%", trendDirection: "up", volatility: "CRITICAL", weight: 0.02 },

    // Electrical Materials
    { name: "16mm Single Core Copper Cable [ELECTRICAL]", unit: "100m Coil", currentPrice: "₦245,000", numericPrice: 245000, trend: "+5.1%", trendDirection: "up", volatility: "CRITICAL", weight: 0.15 },
    { name: "100A 3-Phase Distribution Board [ELECTRICAL]", unit: "Unit", currentPrice: "₦380,000", numericPrice: 380000, trend: "+2.5%", trendDirection: "up", volatility: "MODERATE", weight: 0.12 },
    { name: "PVC Conduit Pipes (20mm, Qty 50) [ELECTRICAL]", unit: "Pack", currentPrice: "₦62,000", numericPrice: 62000, trend: "+1.0%", trendDirection: "up", volatility: "STABLE", weight: 0.05 },

    // Roofing Materials
    { name: "Metcopo Aluminum Roofing Sheets (0.55mm) [ROOFING]", unit: "Sq Metre", currentPrice: "₦8,700", numericPrice: 8700, trend: "+7.1%", trendDirection: "up", volatility: "CRITICAL", weight: 0.22 },
    { name: "Treated Wood Timber Rafters (2x4x12) [ROOFING]", unit: "Length", currentPrice: "₦4,800", numericPrice: 4800, trend: "-1.2%", trendDirection: "down", volatility: "STABLE", weight: 0.08 },

    // Painting Materials
    { name: "Dulux WeatherShield Emulsion Paint [PAINTING]", unit: "20L Drum", currentPrice: "₦85,000", numericPrice: 85000, trend: "+2.8%", trendDirection: "up", volatility: "MODERATE", weight: 0.10 },
    { name: "Gloss Oil Paint (Premium White) [PAINTING]", unit: "4L Gallon", currentPrice: "₦18,500", numericPrice: 18500, trend: "Stable", trendDirection: "stable", volatility: "STABLE", weight: 0.04 },

    // Landscaping & Irrigation
    { name: "Classic Grey Driveway Paving Interlocks [LANDSCAPING]", unit: "Sq Metre", currentPrice: "₦12,500", numericPrice: 12500, trend: "+1.5%", trendDirection: "up", volatility: "STABLE", weight: 0.06 },
    { name: "HDPE Irrigation Drag Line Pipes (32mm) [LANDSCAPING]", unit: "100m Roll", currentPrice: "₦78,000", numericPrice: 78000, trend: "-2.0%", trendDirection: "down", volatility: "MODERATE", weight: 0.04 },

    // Plumbing Materials
    { name: "PPR Plumbing Pipe (25mm Class 20) [PLUMBING]", unit: "Length (4m)", currentPrice: "₦6,500", numericPrice: 6500, trend: "+3.2%", trendDirection: "up", volatility: "STABLE", weight: 0.07 },
    { name: "High-Pressure Cast Iron Water Pump (1.5HP) [PLUMBING]", unit: "Unit", currentPrice: "₦145,000", numericPrice: 145000, trend: "+9.5%", trendDirection: "up", volatility: "CRITICAL", weight: 0.12 }
  ]);

  // List of Nigerian locations supported by calculations
  const locations = [
    "Abuja FCT (Central Infrastructure Hub)",
    "Abia (Umuahia Industrial Grid)",
    "Adamawa (Yola Solar Fields)",
    "Akwa Ibom (Uyo Coastal Terminal)",
    "Anambra (Onitsha Overpass Sectors)",
    "Bauchi (Yankari Eco-Reserve)",
    "Bayelsa (Yenagoa Marine Piles)",
    "Benue (Makurdi River Crossing)",
    "Borno (Maiduguri Power Grid)",
    "Cross River (Calabar Port Extension)",
    "Delta (Asaba Bridgehead)",
    "Ebonyi (Abakaliki Concrete Roadways)",
    "Edo (Benin Bypass Core)",
    "Ekiti (Ado-Ekiti Tech Valley)",
    "Enugu (Coal City Metro Line)",
    "Gombe (Ashaka Supply Network)",
    "Imo (Owerri Drainage Bypass)",
    "Jigawa (Dutse Ground Baselines)",
    "Kaduna (Zaria Rail Transit)",
    "Kano (Metropolitan Trading Ring)",
    "Katsina (Wind Farm Junction)",
    "Kebbi (Birnin Kebbi Irrigation)",
    "Kogi (Lokoja Steel Confluence)",
    "Kwara (Ilorin Cargo Extension)",
    "Lagos (Lekki/Ajah Zone)",
    "Nasarawa (Lafia Transit Hub)",
    "Niger (Kainji Hydro Station)",
    "Ogun (Abeokuta Industrial Corridor)",
    "Ondo (Akure Cocoa Bypass)",
    "Osun (Osogbo Power Grid)",
    "Oyo (Ibadan Ring Expressway)",
    "Plateau (Jos Rock Solid Anchors)",
    "Rivers (Port Harcourt Wharf)",
    "Sokoto (Sokoto Cement Terminal)",
    "Taraba (Mambilla Power Grid)",
    "Yobe (Damaturu Pipeline Core)",
    "Zamfara (Gusau Mining Support)"
  ];

  // Live Simulated SMS Outbox Logs with Chief Executive Officer authority (Imo Joseph)
  const [smsMessages, setSmsMessages] = useState<SMSMessage[]>([
    {
      id: "SMS-101",
      recipientName: "Oluwaseyi Benson",
      phoneNumber: "+234 803 111 2222",
      message: "BuildWise Dispatch: You have been assigned as lead to shift SFT-881 at Lagos Island, VI Hub on 2026-05-26. Plan: 8 hrs. Stay safe. - CEO Imo Joseph",
      timestamp: "May 25, 14:32",
      status: "DELIVERED",
      type: "DISPATCH"
    },
    {
      id: "SMS-102",
      recipientName: "Ibrahim Yusuf",
      phoneNumber: "+234 812 333 4444",
      message: "BuildWise Dispatch: You have been assigned as lead to shift SFT-882 at Abuja Central Tech Overpass on 2026-05-26. Plan: 10 hrs. - CEO Imo Joseph",
      timestamp: "May 25, 15:10",
      status: "DELIVERED",
      type: "DISPATCH"
    },
    {
      id: "SMS-103",
      recipientName: "Chinedu Okafor",
      phoneNumber: "+234 705 555 6666",
      message: "URGENT SAFETY ALERT: Severe storm closure in Port Harcourt Wharf sector. All dispatch assignments canceled. Return to base immediately. Secure all steel molds. - CEO Imo Joseph",
      timestamp: "May 24, 09:12",
      status: "DELIVERED",
      type: "WEATHER_ALERT"
    }
  ]);

  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  // Run AI Simulation pipeline triggers
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const response = await fetch("/api/run-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeView: activeTab, aggregateRiskScore: aggregateRisk }),
      });
      const data = await response.json();
      
      if (data.alert) {
        // Prepend new risk alerts
        setRiskAlerts(prev => [data.alert, ...prev]);
        setShowNotificationBadge(true);

        // Adjust aggregate risk score based on the simulation outcome safely
        if (data.newScoreAdjustment) {
          setAggregateRisk(prev => Math.max(20, Math.min(100, prev + data.newScoreAdjustment)));
        }

        // Add matching item into incident list
        const dateStr = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }) + `, ${new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })}`;
        const simulatedInc: RiskIncident = {
          id: data.alert.id,
          date: dateStr,
          type: data.alert.severity === "MARKET" ? "Resource Delay" : "Equipment Failure",
          severity: data.alert.severity === "CRITICAL" ? "HIGH" : "MEDIUM",
          description: data.alert.description,
          status: "Logged"
        };
        setIncidents(prev => [simulatedInc, ...prev]);

        alert(`AI Simulation Dispatched! A new live threat condition was introduced to Lagos/Abuja grids.`);
      }
    } catch (err) {
      console.error("AI Simulation endpoint query error, proceeding on baseline simulation metrics:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleNewAnalysis = () => {
    setActiveTab("cost-predictions");
    alert("New baseline construction parameters initialized. Calibrate inputs below; tap 'GENERATE AI FORECAST' for neural pathways.");
  };

  const addIncident = (type: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', description: string) => {
    const formatTimestamp = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }) + `, ${new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })}`;
    const newInc: RiskIncident = {
      id: `INC-WAL-${Date.now().toString().slice(-4)}`,
      date: formatTimestamp,
      type,
      severity,
      description,
      status: "Logged"
    };
    setIncidents(prev => [newInc, ...prev]);
  };

  // Auth gate check
  if (!currentUser) {
    return (
      <AuthView
        users={users}
        onLoginSuccess={(user) => {
          setActiveUserId(user.id);
          localStorage.setItem("buildwise_current_user_id", user.id);
          if (user.id === "USER-CEO-777" || user.role === "executive") {
            setActiveTab("dashboard");
          } else {
            setActiveTab("cost-predictions");
          }
          alert(`Welcome back, ${user.fullName}! Session initiated.`);
        }}
        onSignUpSuccess={(newUser) => {
          const updated = [...users, newUser];
          setUsers(updated);
          localStorage.setItem("buildwise_registered_users", JSON.stringify(updated));
          setActiveUserId(newUser.id);
          localStorage.setItem("buildwise_current_user_id", newUser.id);
          if (newUser.role === "executive") {
            setActiveTab("dashboard");
          } else {
            setActiveTab("cost-predictions");
          }
          alert(`Congratulations ${newUser.fullName}! Your engineering wallet has been provisioned with a $100 sign-up bonus.`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex flex-row min-h-screen text-slate-800 font-sans relative overflow-x-hidden">
        {/* Responsive Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onNewAnalysisClick={handleNewAnalysis}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Viewport Container */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all duration-300">
          <MaterialTicker settings={settings} materialsList={materials} />
          
          <TopBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentUser={currentUser}
            onSignOut={() => {
              setActiveUserId("");
              localStorage.removeItem("buildwise_current_user_id");
              alert("Logged out successfully! Secure session expired.");
            }}
            registeredUsers={users}
            onSwitchUser={(userId) => {
              setActiveUserId(userId);
              localStorage.setItem("buildwise_current_user_id", userId);
              const target = users.find(u => u.id === userId);
              if (target) {
                if (target.id === "USER-CEO-777" || target.role === "executive") {
                  setActiveTab("dashboard");
                } else {
                  setActiveTab("cost-predictions");
                }
                alert(`Switched active context successfully to: ${target.fullName}`);
              }
            }}
            onNotificationClick={() => {
              setShowNotificationBadge(false);
              setActiveTab("dashboard");
              alert("Threat alerts feed shown on Executive Overview.");
            }}
            hasNewAlert={showNotificationBadge}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />

          {/* Dynamic Route views based on active tab state */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50">
            {activeTab === "dashboard" && (
              <DashboardView
                settings={settings}
                riskAlerts={riskAlerts}
                setRiskAlerts={setRiskAlerts}
                aggregateRisk={aggregateRisk}
                activeProjects={activeProjects}
                setActiveProjects={setActiveProjects}
                onNavigateToTab={handleNavigateToTab}
                onRunSimulation={handleRunSimulation}
                isSimulating={isSimulating}
              />
            )}

            {activeTab === "cost-predictions" && (
              <CostPredictionsView
                settings={settings}
                locations={locations}
              />
            )}

            {activeTab === "project-wallet" && (
              <WalletView
                activeProjects={activeProjects}
                setActiveProjects={setActiveProjects}
                riskAlerts={riskAlerts}
                setRiskAlerts={setRiskAlerts}
                addIncident={addIncident}
                users={users}
                setUsers={setUsers}
                activeUserId={activeUserId}
                setActiveUserId={setActiveUserId}
              />
            )}

            {activeTab === "risk-analysis" && (
              <RiskAnalysisView
                settings={settings}
                aggregateRisk={aggregateRisk}
                setAggregateRisk={setAggregateRisk}
                incidents={incidents}
                setIncidents={setIncidents}
                onRunSimulation={handleRunSimulation}
                isSimulating={isSimulating}
              />
            )}

            {activeTab === "market-trends" && (
              <MarketTrendsView
                settings={settings}
                materials={materials}
                setMaterials={setMaterials}
              />
            )}

            {activeTab === "crew-scheduling" && (
              <CrewSchedulingView
                settings={settings}
                projectsList={activeProjects}
                smsMessages={smsMessages}
                setSmsMessages={setSmsMessages}
                setRiskAlerts={setRiskAlerts}
                setIncidents={setIncidents}
              />
            )}

            {activeTab === "geographical-map" && (
              <GeographicalMapView
                settings={settings}
                activeProjects={activeProjects}
                setActiveProjects={setActiveProjects}
                riskAlerts={riskAlerts}
                setRiskAlerts={setRiskAlerts}
                incidents={incidents}
                setIncidents={setIncidents}
              />
            )}

            {activeTab === "project-settings" && (
              <ProjectSettingsView
                settings={settings}
                setSettings={setSettings}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
