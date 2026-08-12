import { useState, useEffect } from "react";
import { 
  Search, 
  Bell, 
  History, 
  HelpCircle, 
  ChevronDown, 
  User, 
  ShieldAlert, 
  Menu,
  LogOut,
  UserCheck
} from "lucide-react";
import { RegisteredUser } from "../types";

interface TopBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: RegisteredUser;
  onSignOut: () => void;
  registeredUsers: RegisteredUser[];
  onSwitchUser: (userId: string) => void;
  onNotificationClick: () => void;
  hasNewAlert: boolean;
  onToggleMobileSidebar: () => void;
}

export default function TopBar({
  searchQuery,
  setSearchQuery,
  currentUser,
  onSignOut,
  registeredUsers,
  onSwitchUser,
  onNotificationClick,
  hasNewAlert,
  onToggleMobileSidebar
}: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    // Maintain a live West Africa Time (Nigeria) display in mono font
    const timer = setInterval(() => {
      const now = new Date();
      try {
        const lagosTime = now.toLocaleTimeString("en-US", {
          timeZone: "Africa/Lagos",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        });
        setTimeStr(lagosTime + " WAT");
      } catch (e) {
        // Fallback if environment timezone database is restricted
        const utcHours = now.getUTCHours();
        const watHours = (utcHours + 1) % 24;
        const pad = (num: number) => String(num).padStart(2, '0');
        const minStr = pad(now.getUTCMinutes());
        const secStr = pad(now.getUTCSeconds());
        setTimeStr(`${pad(watHours)}:${minStr}:${secStr} WAT`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getRoleBadge = (u: RegisteredUser) => {
    if (u.id === "USER-CEO-777" || u.role === "executive") {
      return {
        title: "Project Owner",
        dept: "EXECUTIVE BOARD",
        badgeColor: "bg-blue-100 text-blue-800 border-blue-200"
      };
    }
    if (u.id === "USER-ANA-888" || u.email.toLowerCase() === "olushina.awe@buildwise.com") {
      return {
        title: "Project Supervisor",
        dept: "OVERSIGHT BOARD",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
      };
    }
    if (u.role === "analyst") {
      return {
        title: "Consulting Analyst / Estimator",
        dept: "SENIOR ANALYSIS ROOM",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
      };
    }
    return {
      title: "Consulting Engineer",
      dept: "FIELD TEAM LEDGER",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-200"
    };
  };

  const currentRole = getRoleBadge(currentUser);

  const renderAvatar = (u: RegisteredUser, sizeClass = "w-9 h-9") => {
    if (u.id === "USER-CEO-777") {
      return (
        <img
          alt={u.fullName}
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuByqZnJ6OKwqEdG_vTB05MEtYlga6mQJfzxUUsqw-ljoF9wQ6wwoklMqqANB7FJH9y_SrsKr9TMCkuxt5P2qKui4JlqoinHLFEDEoorwMnuAMhs_fBgS5DXb2xfYuyxAHSlNilCkOR66CvUE8CTXHyNxTI30ojEfHBv405Rdy_RoiVXCLLOmhcic2YXBGOdyPZbuw6DLpMfbxPZGt_01Z8G_Eo5lanLnnmLr05-T2mcYSvIoBWE6A-DGtWOGJJpQ3pwmZ8Ucy1wBhc"
          className={`${sizeClass} rounded-full border border-slate-200 object-cover`}
        />
      );
    }
    if (u.id === "USER-ANA-888" || u.email.toLowerCase() === "olushina.awe@buildwise.com" || u.email.toLowerCase() === "adeleke@buildwise.com") {
      return (
        <img
          alt={u.fullName}
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBO87VYTL8v96GZoPSAWNg_OxPxGSC_ES9S5TlAaV7ShHyDZcjv-QExvg2nKttTtR9FAqB6epixrekBJvgreCzmW4cjUWk8Wk82W6JNd9F14CNPBBxTECl7Q5Z8DgTsI9goarnV6Ggi5OJbQGurXAVm6mtVq_VWXNDcwTy5jHFn2rAbViSeFoPk_2qaeVOmHN9myEX_K0WnryWlobYeZ4vQCl18PSjs_oL3NEj2d_Wr8B_yF1cIYKWX-VPWdkbv0YAmCtg_GJ4UvFw"
          className={`${sizeClass} rounded-full border border-slate-200 object-cover`}
        />
      );
    }
    // Custom monogram builder
    const initials = u.fullName
      .split(" ")
      .map(n => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ENG";

    return (
      <div className={`${sizeClass} rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-[10px] tracking-wider select-none border border-blue-700`}>
        {initials}
      </div>
    );
  };

  return (
    <header className="flex justify-between items-center h-16 px-4 md:px-8 bg-white sticky top-0 border-b border-slate-200 shadow-xs z-30">
      
      {/* Mobile Toggle Button */}
      <button 
        onClick={onToggleMobileSidebar}
        className="mr-2 lg:hidden p-2 rounded-lg hover:bg-slate-50 text-slate-700 transition-all cursor-pointer"
        title="Open Navigation Menu"
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      {/* Search Input Bar */}
      <div className="flex items-center flex-1 max-w-sm sm:max-w-xl">
        <div className="relative w-full group focus-within:ring-2 focus-within:ring-[#2563eb] rounded-xl transition-all">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border-0 rounded-xl py-2 pl-10 pr-4 text-xs font-sans placeholder-slate-400 focus:outline-none focus:ring-0 text-slate-800"
            placeholder="Search regional stats or wallets..."
            type="text"
          />
        </div>
      </div>

      {/* Utilitarian Widget Handlers */}
      <div className="flex items-center gap-2 md:gap-4 ml-2">

        {/* Live dynamic clock for precision engineering */}
        <div className="hidden lg:flex items-center bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg">
          <span className="font-mono text-[11px] text-slate-500 tracking-wider">
            {timeStr || "12:58:35 WAT"}
          </span>
        </div>

        {/* Notifications list trigger */}
        <button
          onClick={onNotificationClick}
          className="hover:bg-slate-100 rounded-full p-2 transition-colors relative cursor-pointer"
          title="Toggle Simulated Alerts Engine"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {hasNewAlert && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => alert(`History Log Audit: Displaying active session audits for dynamic user profile ${currentUser.fullName}.`)}
          className="hover:bg-slate-100 rounded-full p-2 transition-colors cursor-pointer"
          title="Model Auditing Trail"
        >
          <History className="w-5 h-5 text-slate-600" />
        </button>

        <div className="h-8 w-px bg-slate-200 mx-1"></div>

        {/* Interactive Profile Selector */}
        <div className="relative">
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 cursor-pointer select-none py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="text-right hidden lg:block">
              <span className="block font-bold text-xs text-slate-900 leading-tight">
                {currentUser.fullName}
              </span>
              <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">
                {currentRole.title}
              </span>
            </div>
            {renderAvatar(currentUser)}
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* Dynamic Switch & Sign-Out Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-150">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 mb-1.5 flex justify-between items-center">
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                  Switch Active Account
                </p>
                <span className="px-1.5 py-0.5 text-[8px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 rounded uppercase font-mono tracking-tight">Active</span>
              </div>

              {/* Display other pre-registered users in localStorage for instant swapping */}
              <div className="max-h-52 overflow-y-auto space-y-0.5">
                {registeredUsers.map((u) => {
                  const isActive = u.id === currentUser.id;
                  const uRole = getRoleBadge(u);
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors cursor-pointer text-xs ${
                        isActive
                          ? "bg-blue-50/70 font-bold text-[#004ac6]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {renderAvatar(u, "w-7 h-7")}
                      <div className="min-w-0 flex-1">
                        <p className="leading-snug text-slate-900 font-bold truncate flex items-center gap-1">
                          {u.fullName}
                          {isActive && <UserCheck className="w-3 h-3 text-blue-600 shrink-0" />}
                        </p>
                        <p className="text-[9px] text-slate-400 uppercase font-mono tracking-tight truncate">
                          {uRole.title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="h-px bg-slate-150 my-2"></div>

              {/* Dynamic Sign-Out Button */}
              <div className="px-2">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-rose-600 hover:bg-rose-50 border border-transparent rounded-lg text-xs font-mono uppercase tracking-wider font-extrabold cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  Sign Out & Lock
                </button>
              </div>

              <div className="h-px bg-slate-100 my-1.5"></div>
              <div className="px-4 py-1 text-[8.5px] text-slate-400 font-sans italic leading-tight">
                Active group role: {currentRole.dept}. Logouts terminate browser sessions and encrypt secure wallet assets.
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
