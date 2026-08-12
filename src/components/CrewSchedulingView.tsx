import React, { useState } from "react";
import { 
  Users, 
  Calendar, 
  Clock, 
  Plus, 
  Send, 
  CheckCircle2, 
  Search, 
  FileText, 
  ShieldAlert, 
  TrendingUp,
  Sliders,
  Sparkles,
  PhoneCall,
  UserCheck,
  Smartphone,
  MessageSquare,
  Check,
  CheckCheck,
  CloudRain,
  AlertCircle
} from "lucide-react";
import { CrewMember, ScheduledShift, TimesheetEntry, SystemSettings, SMSMessage, RiskAlert, RiskIncident } from "../types";

interface CrewSchedulingViewProps {
  settings: SystemSettings;
  projectsList: { id: string; location: string }[];
  smsMessages: SMSMessage[];
  setSmsMessages: React.Dispatch<React.SetStateAction<SMSMessage[]>>;
  setRiskAlerts: React.Dispatch<React.SetStateAction<RiskAlert[]>>;
  setIncidents: React.Dispatch<React.SetStateAction<RiskIncident[]>>;
}

export default function CrewSchedulingView({ 
  settings, 
  projectsList,
  smsMessages,
  setSmsMessages,
  setRiskAlerts,
  setIncidents
}: CrewSchedulingViewProps) {
  const [activeTab, setActiveTab] = useState<"scheduler" | "directory" | "timesheets">("scheduler");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Base hourly wage computed based on Settings labor coefficients
  const baseHourlyWage = settings.baseLaborRate / 8; // assuming standard baseLaborRate is per SQM or day, let's normalize it to hourly (e.g. NGN 3,500/hr)
  const activeHourlyWage = Math.round(baseHourlyWage * settings.inflationMultiplier);

  // Default Crew Directory
  const [crews, setCrews] = useState<CrewMember[]>([
    { id: "CRW-001", name: "Oluwaseyi Benson", role: "Structural Masonry Lead", phoneNumber: "+234 803 111 2222", status: "ACTIVE_SHIFT", assignedProject: "Lagos Island, VI Hub", efficiencyIndex: 1.15 },
    { id: "CRW-002", name: "Ibrahim Yusuf", role: "Reinforced Steel Fitter", phoneNumber: "+234 812 333 4444", status: "ACTIVE_SHIFT", assignedProject: "Abuja Central Tech Overpass", efficiencyIndex: 1.05 },
    { id: "CRW-003", name: "Chinedu Okafor", role: "Concrete Casting Specialist", phoneNumber: "+234 705 555 6666", status: "ONLINE", efficiencyIndex: 1.25 },
    { id: "CRW-004", name: "Babajide Cole", role: "Heavy Equipment Excavator", phoneNumber: "+234 809 777 8888", status: "OFFLINE", efficiencyIndex: 0.95 },
    { id: "CRW-005", name: "Amara Nwosu", role: "Safety Compliance Guard", phoneNumber: "+234 802 999 0000", status: "ONLINE", efficiencyIndex: 1.10 }
  ]);

  // Default Scheduled Crew Shifts
  const [shifts, setShifts] = useState<ScheduledShift[]>([
    { id: "SFT-881", projectName: "Lagos Island, VI Hub", teamLead: "Oluwaseyi Benson", crewCount: 8, date: "2026-05-26", hoursNeeded: 8, status: "DISPATCHED" },
    { id: "SFT-882", projectName: "Abuja Central Tech Overpass", teamLead: "Ibrahim Yusuf", crewCount: 12, date: "2026-05-26", hoursNeeded: 10, status: "CHECKED_IN" },
    { id: "SFT-883", projectName: "Port Harcourt Wharf", teamLead: "Chinedu Okafor", crewCount: 6, date: "2026-05-27", hoursNeeded: 8, status: "PENDING" },
    { id: "SFT-884", projectName: "Kano Logistics Depot", teamLead: "Babajide Cole", crewCount: 4, date: "2026-05-28", hoursNeeded: 6, status: "PENDING" }
  ]);

  // Custom Form states for adding crews and creating shifts
  const [newCrewName, setNewCrewName] = useState("");
  const [newCrewRole, setNewCrewRole] = useState("Concreting Specialist");
  const [newCrewPhone, setNewCrewPhone] = useState("");
  
  const [newShiftProject, setNewShiftProject] = useState(projectsList[0]?.location || "Lagos Island, VI Hub");
  const [newShiftLead, setNewShiftLead] = useState("Oluwaseyi Benson");
  const [newShiftCount, setNewShiftCount] = useState(6);
  const [newShiftDate, setNewShiftDate] = useState("2026-05-26");
  const [newShiftHours, setNewShiftHours] = useState(8);
  const [weatherClosureLocation, setWeatherClosureLocation] = useState(projectsList[0]?.location || "Lagos Island, VI Hub");

  // Digital timesheets loaded by crew check-ins
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([
    { id: "TS-101", date: "May 24", workerName: "Oluwaseyi Benson", projectName: "Lagos Island, VI Hub", hoursWorked: 8, hourlyRate: activeHourlyWage, costImpact: activeHourlyWage * 8 * 1.15, approved: true },
    { id: "TS-102", date: "May 24", workerName: "Ibrahim Yusuf", projectName: "Abuja Central Tech Overpass", hoursWorked: 9, hourlyRate: activeHourlyWage, costImpact: activeHourlyWage * 9 * 1.05, approved: false },
    { id: "TS-103", date: "May 25", workerName: "Chinedu Okafor", projectName: "Lagos Island, VI Hub", hoursWorked: 8, hourlyRate: activeHourlyWage, costImpact: activeHourlyWage * 8 * 1.25, approved: false }
  ]);

  // Actions
  const handleAddCrew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrewName) return;
    const item: CrewMember = {
      id: `CRW-0${crews.length + 1}`,
      name: newCrewName,
      role: newCrewRole,
      phoneNumber: newCrewPhone || "+234 800 000 0000",
      status: "ONLINE",
      efficiencyIndex: parseFloat((1.0 + Math.random() * 0.3).toFixed(2))
    };
    setCrews([...crews, item]);
    setNewCrewName("");
    setNewCrewPhone("");
    alert(`Success: ${newCrewName} logged into active crew registry with verified baseline efficiency!`);
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    const item: ScheduledShift = {
      id: `SFT-0${shifts.length + 1}`,
      projectName: newShiftProject,
      teamLead: newShiftLead,
      crewCount: newShiftCount,
      date: newShiftDate,
      hoursNeeded: newShiftHours,
      status: "PENDING"
    };
    setShifts([...shifts, item]);
    alert(`Success: Dispatch itinerary filed for ${newShiftProject}. Assigned team lead: ${newShiftLead}.`);
  };

  const handleDispatch = (id: string) => {
    // Locate the scheduled shift details and automate field SMS transmission
    const targetShift = shifts.find(s => s.id === id);
    if (targetShift) {
      const leadStaff = crews.find(c => c.name === targetShift.teamLead);
      const recipientPhone = leadStaff ? leadStaff.phoneNumber : "+234 803 111 2222";
      const formatTimestamp = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }) + `, ${new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })}`;

      const dispatchSms: SMSMessage = {
        id: `SMS-DSP-${Date.now()}`,
        recipientName: targetShift.teamLead,
        phoneNumber: recipientPhone,
        message: `📢 BuildWise DISPATCH: Lead ${targetShift.teamLead}, Shift ${targetShift.id} for "${targetShift.projectName}" is authorized for ${targetShift.date}. Size: ${targetShift.crewCount} personnel. Standard PPE mandatory. - CEO Imo Joseph`,
        timestamp: formatTimestamp,
        status: "DELIVERED",
        type: "DISPATCH"
      };

      setSmsMessages(prev => [dispatchSms, ...prev]);
    }

    setShifts(prev => prev.map(s => {
      if (s.id === id) {
        // Find crew member list and toggle active shift
        const lead = s.teamLead;
        setCrews(c => c.map(member => {
          if (member.name === lead) {
            return { ...member, status: "ACTIVE_SHIFT", assignedProject: s.projectName };
          }
          return member;
        }));
        return { ...s, status: "DISPATCHED" };
      }
      return s;
    }));
    alert(`Crew Dispatch Signal Sent! Automated SMS dispatch notification transmitted to ${targetShift?.teamLead || "field lead"}.`);
  };

  const handleCheckIn = (id: string) => {
    setShifts(prev => prev.map(s => {
      if (s.id === id) {
        // Prepend timesheet when crew checked in
        const leadObj = crews.find(w => w.name === s.teamLead);
        const efficiency = leadObj ? leadObj.efficiencyIndex : 1.0;
        const ts: TimesheetEntry = {
          id: `TS-${100 + timesheets.length + 1}`,
          date: new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          workerName: s.teamLead,
          projectName: s.projectName,
          hoursWorked: s.hoursNeeded,
          hourlyRate: activeHourlyWage,
          costImpact: Math.round(activeHourlyWage * s.hoursNeeded * efficiency * s.crewCount),
          approved: false
        };
        setTimesheets(prevTs => [ts, ...prevTs]);
        return { ...s, status: "CHECKED_IN" };
      }
      return s;
    }));
    alert(`Checked In! Field check-in successfully logged. Calculated pending timesheet has been generated.`);
  };

  const handleApproveTimesheet = (id: string) => {
    setTimesheets(prev => prev.map(ts => (ts.id === id ? { ...ts, approved: true } : ts)));
    alert(`Timesheet approved! Wage metrics synchronized with main portfolio ledger budget totals.`);
  };

  const handleTriggerWeatherClosure = (sectorLocation: string) => {
    if (!sectorLocation) return;

    // Identify which crew leads are currently active or scheduled at this sector
    const targetSectorShifts = shifts.filter(s => 
      s.projectName.toLowerCase().includes(sectorLocation.toLowerCase()) || 
      sectorLocation.toLowerCase().includes(s.projectName.toLowerCase())
    );

    let emergencySMSCount = 0;
    const formatTimestamp = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }) + `, ${new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })}`;

    const newSmsList: SMSMessage[] = [];

    // Map each unique team lead in this sector to alert them
    const leadsInSector = targetSectorShifts.length > 0
      ? Array.from(new Set(targetSectorShifts.map(s => s.teamLead)))
      : crews.filter(c => c.assignedProject?.toLowerCase().includes(sectorLocation.toLowerCase())).map(c => c.name);

    leadsInSector.forEach(leadName => {
      const matchCrew = crews.find(c => c.name === leadName);
      const phoneNum = matchCrew ? matchCrew.phoneNumber : "+234 803 111 2222";

      const weatherAlertSms: SMSMessage = {
        id: `SMS-WEA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        recipientName: leadName,
        phoneNumber: phoneNum,
        message: `🚨 URGENT WEATHER SITE CLOSURE: All field operations at "${sectorLocation}" are immediately suspended due to severe rainfall & instability risk. Evacuate construction grid. - Chief Executive Officer Imo Joseph`,
        timestamp: formatTimestamp,
        status: "DELIVERED",
        type: "WEATHER_ALERT"
      };

      newSmsList.push(weatherAlertSms);
      emergencySMSCount++;
    });

    // Fallback if no matching shift leads yet: alert Amara Nwosu (Safety Guard)
    if (newSmsList.length === 0) {
      const defaultCrew = crews.find(c => c.name === "Amara Nwosu") || crews[0];
      const safetySms: SMSMessage = {
        id: `SMS-WEA-${Date.now()}`,
        recipientName: defaultCrew.name,
        phoneNumber: defaultCrew.phoneNumber,
        message: `🚨 SAFETY NOTIFICATION: CEO Imo Joseph ordered an emergency weather closure for "${sectorLocation}". Securing construction grid. - Chief Executive Officer Imo Joseph`,
        timestamp: formatTimestamp,
        status: "DELIVERED",
        type: "WEATHER_ALERT"
      };
      newSmsList.push(safetySms);
      emergencySMSCount++;
    }

    // Append to SMS stream state
    setSmsMessages(prev => [...newSmsList, ...prev]);

    // Fire matching Risk Alert in master systems dashboard (will show on overview)
    const alertId = `ALR-WEA-${Date.now().toString().slice(-4)}`;
    const systemAlertObj: RiskAlert = {
      id: alertId,
      severity: "CRITICAL",
      time: "Just now",
      title: `Emergency Weather Shut-down: ${sectorLocation}`,
      description: `Chief Executive Officer Imo Joseph declared structural site-closure under torrential conditions preventing safe grade-level soil anchoring at ${sectorLocation}.`,
      actionMessage: "Automated SMS alerts transmitted to regional team leads."
    };
    setRiskAlerts(prev => [systemAlertObj, ...prev]);

    // Fire historical Safety Incident log registry
    const incidentId = `INC-WEA-${Date.now().toString().slice(-4)}`;
    const systemIncidentObj: RiskIncident = {
      id: incidentId,
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }) + `, ${new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })}`,
      type: "Weather Strike",
      severity: "CRITICAL",
      description: `Emergency evacuation commanded by CEO Imo Joseph for "${sectorLocation}". Real-time worker SMS signals broadcasted successfully via build outbox logs.`,
      status: "Logged"
    };
    setIncidents(prev => [systemIncidentObj, ...prev]);

    alert(`EMERGENCY WEATHER SITE-CLOSURE DISPATCHED!\nCEO Imo Joseph ordered evacuation at: ${sectorLocation}\n${emergencySMSCount} Automated SMS notifications transmitted successfully to regional captains.`);
  };

  const filteredCrews = crews.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs text-[#004ac6] uppercase font-bold tracking-widest leading-none block mb-1">
            Dispatch Module: PRO_CREW_SCHEDULER_v4.2
          </span>
          <h2 className="font-display-lg text-3xl font-extrabold text-slate-900 leading-tight">
            Crew Scheduling & Live Timesheets
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Allocate field personnel, dispatch real-time team itineraries, and audit labor costs linked with dynamic estimates.
          </p>
        </div>

        {/* Dynamic Hourly rate indicator */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-sm">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest leading-none mb-1">Live Calibrated Crew Rate</p>
            <p className="text-white font-extrabold font-mono text-lg">₦{activeHourlyWage.toLocaleString()}<span className="text-slate-500 font-sans text-xs font-normal"> / hour</span></p>
          </div>
        </div>
      </div>

      {/* Mini tabs */}
      <div className="flex border-b border-slate-200 gap-1">
        <button
          onClick={() => setActiveTab("scheduler")}
          className={`px-5 py-3 font-sans text-xs font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "scheduler"
              ? "border-slate-950 text-slate-950"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Shift Dispatcher</span>
            <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-mono">{shifts.length}</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("directory")}
          className={`px-5 py-3 font-sans text-xs font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "directory"
              ? "border-slate-950 text-slate-950"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Field Staffing Directory</span>
            <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-mono">{crews.length}</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("timesheets")}
          className={`px-5 py-3 font-sans text-xs font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "timesheets"
              ? "border-slate-950 text-slate-950"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Daily Digital Timesheets</span>
            <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-mono">{timesheets.filter(t => !t.approved).length} Pnd</span>
          </div>
        </button>
      </div>

      {/* Main View Grid Switch */}
      {activeTab === "scheduler" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Shift Form Panel (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm font-sans m-0">Create Schedule Shift</h3>
                </div>

                <form onSubmit={handleCreateShift} className="space-y-4 text-xs font-sans text-slate-700">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Target Project Sector</label>
                    <select
                      value={newShiftProject}
                      onChange={(e) => setNewShiftProject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {projectsList.map(p => (
                        <option key={p.id} value={p.location}>{p.location}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Assigned Team Lead / Captain</label>
                    <select
                      value={newShiftLead}
                      onChange={(e) => setNewShiftLead(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {crews.filter(c => c.status !== "OFFLINE").map(c => (
                        <option key={c.id} value={c.name}>{c.name} ({c.role})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Crew Members Count</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={newShiftCount}
                        onChange={(e) => setNewShiftCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Shift Hours Planned</label>
                      <input
                        type="number"
                        min="2"
                        max="16"
                        value={newShiftHours}
                        onChange={(e) => setNewShiftHours(Math.max(2, parseInt(e.target.value) || 2))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Deployment Date</label>
                    <input
                      type="date"
                      value={newShiftDate}
                      onChange={(e) => setNewShiftDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-slate-950 hover:bg-slate-800 text-white font-mono text-[10px] uppercase tracking-wider font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>File Dispatch Schedule</span>
                  </button>
                </form>
              </div>

              <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl mt-6 text-[11px] text-slate-600 leading-relaxed font-sans flex gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                <p>
                  <strong>AI Scheduler:</strong> Personnel matches are filtered based on real-world competency. Dispatched leads receive automated field itineraries with weather and maps.
                </p>
              </div>
            </div>

            {/* Active Schedules Lists (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm font-sans flex items-center gap-2 m-0">
                      <span>Interactive Construction Schedule Grid</span>
                    </h3>
                    <p className="text-slate-400 text-xs font-mono tracking-wide uppercase mt-0.5">Live Shift Status Board</p>
                  </div>
                </div>

                {/* Calendar-like header banner */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {(["MON 25", "TUE 26", "WED 27", "THU 28"] as const).map((day) => (
                    <div key={day} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                      <p className="font-mono text-[10px] font-black text-slate-400 uppercase leading-none">{day.split(" ")[0]}</p>
                      <p className="font-display-lg text-lg text-slate-800 font-extrabold leading-tight mt-1">{day.split(" ")[1]}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3.5 mt-5">
                  {shifts.map((s) => {
                    const isDispatched = s.status === "DISPATCHED";
                    const isCheckedIn = s.status === "CHECKED_IN";
                    const isPending = s.status === "PENDING";

                    return (
                      <div 
                        key={s.id} 
                        className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-150 ${
                          isCheckedIn 
                            ? "bg-emerald-50/40 border-emerald-100 shadow-xs" 
                            : isDispatched 
                            ? "bg-blue-50/30 border-blue-100" 
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[9px] text-[#004ac6] font-extrabold uppercase bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5">
                              {s.id}
                            </span>
                            <span className="font-mono text-[9px] font-bold text-slate-400">
                              🕒 {s.date} ({s.hoursNeeded}h)
                            </span>
                            
                            <span className={`inline-block px-2 py-0.5 font-mono text-[8px] font-black rounded uppercase ${
                              isCheckedIn
                                ? "bg-emerald-100 text-emerald-800"
                                : isDispatched
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-700"
                            }`}>
                              {s.status}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-xs font-sans pt-1 leading-snug">
                            {s.projectName}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-sans leading-none mt-0.5">
                            Crew Leader: <strong>{s.teamLead}</strong> &bull; Size: <strong>{s.crewCount} Personnel</strong>
                          </p>
                        </div>

                        {/* Interactive triggers */}
                        <div className="flex items-center gap-2">
                          {isPending && (
                            <button
                              onClick={() => handleDispatch(s.id)}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-mono text-[9px] font-black uppercase rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              <span>DISPATCH CREW</span>
                            </button>
                          )}

                          {isDispatched && (
                            <button
                              onClick={() => handleCheckIn(s.id)}
                              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[9px] font-black uppercase rounded-lg flex items-center gap-1 cursor-pointer animate-pulse"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>FIELD CHECK-IN</span>
                            </button>
                          )}

                          {isCheckedIn && (
                            <div className="flex items-center gap-1.5 text-emerald-600 font-mono text-[9px] font-black uppercase bg-emerald-50 px-2 py-1 border border-emerald-100 rounded-lg">
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>ON SITE LOGGED</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-slate-400 font-mono text-[9px] uppercase font-bold">
                <span>Total Managed Positions: {shifts.reduce((sum, s) => sum + s.crewCount, 0)} on field</span>
                <span>ProCrew Tracker Service: ACTIVE</span>
              </div>
            </div>

          </div>

          {/* Emergency Dispatch & Simulated SMS Gateway Communications Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-8">
            
            {/* CEO Weather Site-Closure Emergency Panel (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                  <CloudRain className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-slate-900 text-sm font-sans m-0">CEO Emergency Site-Closure Command</h3>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-5 font-sans">
                  As the **Chief Executive Officer**, your authority governs force majeure operations. Triggering site-closures will immediately alert matching crew leads and safety guards via automated regional cellular SMS broadcasts.
                </p>

                <div className="space-y-4 text-xs font-sans text-slate-700">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Select Target Project Sector</label>
                    <select
                      value={weatherClosureLocation}
                      onChange={(e) => setWeatherClosureLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-rose-500 font-bold"
                    >
                      {projectsList.map(p => (
                        <option key={p.id} value={p.location}>{p.location}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Enforced Broadcast Details</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-600 font-mono text-[10px] space-y-1">
                      <p><strong>ALERT LEVEL:</strong> CRITICAL_FORCE_MAJEURE</p>
                      <p><strong>CEO ISSUER:</strong> Chief Executive Officer Imo Joseph</p>
                      <p><strong>REASON LOGGED:</strong> Soils instability, torrential precipitations, structural mudding.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleTriggerWeatherClosure(weatherClosureLocation)}
                  className="w-full py-3 bg-rose-650 hover:bg-rose-700 text-white font-mono text-[10px] uppercase tracking-wider font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <AlertCircle className="w-4 h-4 text-white animate-bounce" />
                  <span>TRIGGER WEATHER SITE-CLOSURE</span>
                </button>
              </div>
            </div>

            {/* Simulated Handset Outbox Live Stream Component (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-[#dddddd] pb-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-[#004ac6]" />
                    <h3 className="font-bold text-slate-900 text-sm font-sans m-0">Live SMS Dispatch Gateway (Simulated UI)</h3>
                  </div>
                  <span className="bg-emerald-100 border border-emerald-200 text-emerald-800 text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    GSM SERVER: ONLINE
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-sans mb-4">
                  Autonomous GSM outbox feed matching real-time micro-broadcast dispatches transmitted onto the field lead smartphone networks.
                </p>

                {/* Handset Message Stream Screen */}
                <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 h-[280px] overflow-y-auto space-y-3 font-sans">
                  {smsMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-10 space-y-2">
                      <MessageSquare className="w-7 h-7 text-slate-400/50" />
                      <p className="font-mono text-[10px] tracking-wider uppercase">SMS Gateway Outbox Empty</p>
                    </div>
                  ) : (
                    smsMessages.map((sms) => (
                      <div key={sms.id} className="border-b border-[#1e293b]/70 pb-3 last:border-0 last:pb-0">
                        {/* Header Details */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-450 mb-1.5">
                          <span className="font-bold text-[#38bdf8]">TO: {sms.recipientName} ({sms.phoneNumber})</span>
                          <span className="text-slate-500">{sms.timestamp}</span>
                        </div>

                        {/* Speech bubble */}
                        <div className={`p-3 rounded-xl text-xs font-sans leading-relaxed ${
                          sms.type === "WEATHER_ALERT" 
                            ? "bg-rose-950/40 border border-rose-900/40 text-rose-200" 
                            : "bg-slate-900 border border-slate-800 text-slate-100"
                        }`}>
                          {sms.message}
                        </div>

                        {/* Status elements */}
                        <div className="flex items-center justify-end gap-1.5 mt-1 font-mono text-[9px] text-slate-500">
                          <span className={`px-1.5 py-0.2 rounded uppercase font-black text-[8px] ${
                            sms.type === "WEATHER_ALERT" ? "bg-rose-950/80 text-rose-450" : "bg-blue-950/80 text-blue-450"
                          }`}>
                            {sms.type}
                          </span>
                          <span className="h-2 w-px bg-slate-900"></span>
                          <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                            {sms.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>Central Log Stream: {smsMessages.length} Logs</span>
                <span>Active Signatory: Imo Joseph (CEO)</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {activeTab === "directory" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Direct crew creation form (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm font-sans m-0">Add New Crew Member</h3>
                </div>

                <form onSubmit={handleAddCrew} className="space-y-4 text-xs font-sans text-slate-700">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Full Staff Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Samuel Ayoola"
                      required
                      value={newCrewName}
                      onChange={(e) => setNewCrewName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Project Craft Role</label>
                    <select
                      value={newCrewRole}
                      onChange={(e) => setNewCrewRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Steel Frame Assembler">Steel Frame Assembler</option>
                      <option value="Masonry Specialist">Masonry Specialist</option>
                      <option value="Excavator Operator">Excavator Operator</option>
                      <option value="Concreting Foreman">Concreting Foreman</option>
                      <option value="Safety Consultant">Safety Consultant</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Mobile Phone (SMS Dispatch)</label>
                    <input
                      type="text"
                      placeholder="e.g. +234 815 000 0000"
                      value={newCrewPhone}
                      onChange={(e) => setNewCrewPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-slate-950 hover:bg-slate-800 text-white font-mono text-[10px] uppercase tracking-wider font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register Staff Profile</span>
                  </button>
                </form>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/50 rounded-xl mt-6">
                <p className="font-mono text-[9px] text-slate-400 font-extrabold uppercase leading-none mb-1">Crew Credential Auditing</p>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Registered workers auto-receive daily compliance checks via SMS. Their verified telemetry updates safety threat scores dynamically.
                </p>
              </div>
            </div>

            {/* Crew Directory Registry (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm font-sans m-0">Field Personnel Registry</h3>
                  <p className="text-xs text-slate-400 font-mono tracking-wider uppercase mt-0.5">Verification Telemetry Index</p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search personnel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-sans text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 border-b border-slate-200 font-mono text-[9px] text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Personnel ID</th>
                      <th className="px-6 py-3.5">Name / Contact</th>
                      <th className="px-6 py-3.5">Craft Role</th>
                      <th className="px-6 py-3.5">Efficiency Score</th>
                      <th className="px-6 py-3.5 font-mono text-center">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans text-xs">
                    {filteredCrews.map((c) => {
                      const isActive = c.status === "ACTIVE_SHIFT";
                      const isOffline = c.status === "OFFLINE";

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-[#004ac6]">{c.id}</td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900 leading-none">{c.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono leading-none mt-1">{c.phoneNumber}</p>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600">{c.role}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-700">{(c.efficiencyIndex * 100).toFixed(0)}%</span>
                              <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${c.efficiencyIndex >= 1.1 ? "bg-emerald-500" : "bg-blue-500"}`}
                                  style={{ width: `${Math.min(100, (c.efficiencyIndex / 1.5) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase ${
                              isActive
                                ? "bg-blue-50 text-blue-800 border border-blue-100 animate-pulse"
                                : isOffline
                                ? "bg-slate-50 text-slate-400 border border-slate-100"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-100"
                            }`}>
                              {c.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => alert(`Dialing crew dispatcher for SMS dispatch to ${c.name}. Call routing initialized.`)}
                              className="text-slate-500 hover:text-slate-900 font-mono text-[9px] font-black uppercase hover:underline cursor-pointer flex items-center justify-end gap-1.5 ml-auto"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>CALL PING</span>
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

        </div>
      )}

      {activeTab === "timesheets" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-sans m-0">Daily Digital Field Timesheets</h3>
                <p className="text-xs text-slate-400 font-mono tracking-wider uppercase mt-0.5">Auditable Hourly Wage Logs</p>
              </div>

              <div className="py-1 px-3 bg-blue-50 border border-blue-200 rounded-lg text-xs font-mono text-blue-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Base Wage: ₦{activeHourlyWage}/hr calibrated with active inflation multiplier</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F1F5F9] border-b border-slate-200 font-mono text-[9px] text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Log ID</th>
                    <th className="px-6 py-3.5">Filing Date</th>
                    <th className="px-6 py-3.5">Field Rep</th>
                    <th className="px-6 py-3.5">Project Sector</th>
                    <th className="px-6 py-3.5 font-mono text-center">Hours Logs</th>
                    <th className="px-6 py-3.5">Computed wage sum</th>
                    <th className="px-6 py-3.5">Approval Code</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-xs">
                  {timesheets.map((ts) => (
                    <tr key={ts.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#004ac6]">{ts.id}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">{ts.date}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{ts.workerName}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{ts.projectName}</td>
                      <td className="px-6 py-4 font-mono text-center font-bold text-slate-700">{ts.hoursWorked} hrs</td>
                      <td className="px-6 py-4 font-mono font-extrabold text-[#0f172a]">
                        ₦{ts.costImpact.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase ${
                          ts.approved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {ts.approved ? "APPROVED & SYNCED" : "PENDING AUDIT"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!ts.approved ? (
                          <button
                            onClick={() => handleApproveTimesheet(ts.id)}
                            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white font-mono text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer"
                          >
                            APPROVE SHIFT
                          </button>
                        ) : (
                          <span className="text-slate-400 font-mono text-[9px] font-bold">LOCKED & SETTLED</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Timesheet Summary KPI card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex justify-between items-center">
              <div>
                <p className="font-mono text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Total Wages Disbursed</p>
                <p className="font-display-lg text-xl font-extrabold text-slate-800 mt-1">
                  ₦{timesheets.filter(t => t.approved).reduce((sum, t) => sum + t.costImpact, 0).toLocaleString()}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-60" />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex justify-between items-center">
              <div>
                <p className="font-mono text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Pending Approval Liability</p>
                <p className="font-display-lg text-xl font-extrabold text-slate-800 mt-1">
                  ₦{timesheets.filter(t => !t.approved).reduce((sum, t) => sum + t.costImpact, 0).toLocaleString()}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-500 opacity-60" />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex justify-between items-center">
              <div>
                <p className="font-mono text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Average Staff Productivity</p>
                <p className="font-display-lg text-xl font-extrabold text-slate-800 mt-1">112% (Exceptional)</p>
              </div>
              <Sparkles className="w-8 h-8 text-blue-500 opacity-60" />
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
