import { useState } from "react";
import { 
  LayoutDashboard, 
  TrendingUp, 
  AlertTriangle, 
  Coins, 
  Settings, 
  LogOut, 
  HelpCircle, 
  BarChart4,
  PlusSquare,
  Users,
  Map,
  Wallet,
  X
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewAnalysisClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onNewAnalysisClick, isOpen, onClose }: SidebarProps) {
  const [showSupportModal, setShowSupportModal] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { id: "cost-predictions", label: "Cost Predictions", Icon: Coins },
    { id: "project-wallet", label: "Project Wallet", Icon: Wallet },
    { id: "risk-analysis", label: "Risk Analysis", Icon: AlertTriangle },
    { id: "geographical-map", label: "Hotspot Map", Icon: Map },
    { id: "market-trends", label: "Market Trends", Icon: TrendingUp },
    { id: "crew-scheduling", label: "Crew & Scheduling", Icon: Users },
    { id: "project-settings", label: "Project Settings", Icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-35 lg:hidden animate-in fade-in duration-300"
        />
      )}

      <aside className={`bg-blueprint-ink h-screen w-64 fixed left-0 top-0 border-r border-[#334155]/20 flex flex-col py-6 px-4 z-40 text-white transition-transform duration-350 ease-out-quint ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        {/* Brand Header */}
        <div className="mb-8 px-2 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-2 rounded bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-extrabold text-sm tracking-tighter">AI</span>
              <h1 className="font-display-lg text-2xl font-bold tracking-tight text-white m-0">
                BuildWise
              </h1>
            </div>
            <p className="font-label-caps text-[10px] tracking-widest text-[#F97316] font-bold mt-1 uppercase">
              Precision Engineering
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Elements */}
        <nav className="flex-1 space-y-1.5">
          {menuItems.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer text-left ${
                  isActive
                    ? "bg-[#fea619] text-[#2a1700] hover:brightness-105 shadow-sm font-bold scale-[1.02]"
                    : "text-slate-300 hover:text-white hover:bg-[#656d84]/20"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "stroke-[2.5px]" : "stroke-current opacity-80"}`} />
                <span className="font-label-caps">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Lower Sidebar Actions */}
        <div className="mt-auto space-y-3 pt-4 border-t border-slate-700/30">
          <button 
            onClick={onNewAnalysisClick}
            className="w-full py-3 px-4 bg-primary-container hover:bg-opacity-95 text-white text-xs font-bold font-label-caps rounded-xl flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer shadow-md hover:translate-y-[-1px] active:translate-y-[1px]"
          >
            <PlusSquare className="w-4 h-4" />
            <span>New Analysis</span>
          </button>

          <div className="space-y-0.5">
            <button
              onClick={() => setShowSupportModal(true)}
              className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white rounded-lg transition-colors text-xs font-medium uppercase font-label-caps tracking-wide cursor-pointer text-left"
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Support</span>
            </button>
            <button
              onClick={() => {
                alert("Thank you for using BuildWise AI. To manage your credentials or log out, configure your user keys under Project Settings.");
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white rounded-lg transition-colors text-xs font-medium uppercase font-label-caps tracking-wide cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Support Dialog */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-headline-md text-lg text-slate-900 font-bold font-sans">
                  Precision Engineering Support
                </h4>
                <p className="text-xs text-slate-500 font-mono">BuildWise Operational Grid</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-slate-600 font-sans leading-relaxed">
              <p>
                Welcome to the <strong>BuildWise Intelligence Center</strong>. This workspace delivers real-time forecasting, LSTM-powered cost index modeling, and site incident telemetry.
              </p>
              <p>
                To generate live simulations or dynamic neural estimations, click <strong>"Run AI Simulation"</strong> or customize parameters inside the Cost Engine.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-xs text-slate-500 space-y-1">
                <p>📍 Location: Abuja Central Hub</p>
                <p>👑 Project Owner: Master Imo Joseph Okon</p>
                <p>🎓 Supervisor: Prof. Olushina Olawale Awe</p>
                <p>⚙️ Engine Level: Neural Core v4.2</p>
                <p>📧 Enterprise Support: support@buildwise.ai</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSupportModal(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-label-caps text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Close Gateway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
