import React, { useState } from "react";
import { 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Users,
  Eye,
  EyeOff,
  Phone,
  ShieldAlert,
  Check
} from "lucide-react";
import { RegisteredUser } from "../types";

interface AuthViewProps {
  users: RegisteredUser[];
  onLoginSuccess: (user: RegisteredUser) => void;
  onSignUpSuccess: (newUser: RegisteredUser) => void;
}

export default function AuthView({ users, onLoginSuccess, onSignUpSuccess }: AuthViewProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  
  // Sign Up inputs
  const [signUpFullName, setSignUpFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpCompany, setSignUpCompany] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [signUpRole, setSignUpRole] = useState<"executive" | "analyst">("executive");
  const [signUpError, setSignUpError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  
  // Sign Up verification states
  const [pendingUser, setPendingUser] = useState<RegisteredUser | null>(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [verificationInput, setVerificationInput] = useState("");
  const [verificationError, setVerificationError] = useState("");

  // Quick preset shortcuts for developers/evaluators
  const presets = [
    {
      name: "Master Imo Joseph Okon",
      email: "imojosephmiva@gmail.com",
      role: "Project Owner",
      color: "bg-blue-600",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuByqZnJ6OKwqEdG_vTB05MEtYlga6mQJfzxUUsqw-ljoF9wQ6wwoklMqqANB7FJH9y_SrsKr9TMCkuxt5P2qKui4JlqoinHLFEDEoorwMnuAMhs_fBgS5DXb2xfYuyxAHSlNilCkOR66CvUE8CTXHyNxTI30ojEfHBv405Rdy_RoiVXCLLOmhcic2YXBGOdyPZbuw6DLpMfbxPZGt_01Z8G_Eo5lanLnnmLr05-T2mcYSvIoBWE6A-DGtWOGJJpQ3pwmZ8Ucy1wBhc"
    },
    {
      name: "Prof. Olushina Olawale Awe",
      email: "olushina.awe@buildwise.com",
      role: "Project Supervisor",
      color: "bg-amber-600",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBO87VYTL8v96GZoPSAWNg_OxPxGSC_ES9S5TlAaV7ShHyDZcjv-QExvg2nKttTtR9FAqB6epixrekBJvgreCzmW4cjUWk8Wk82W6JNd9F14CNPBBxTECl7Q5Z8DgTsI9goarnV6Ggi5OJbQGurXAVm6mtVq_VWXNDcwTy5jHFn2rAbViSeFoPk_2qaeVOmHN9myEX_K0WnryWlobYeZ4vQCl18PSjs_oL3NEj2d_Wr8B_yF1cIYKWX-VPWdkbv0YAmCtg_GJ4UvFw"
    }
  ];

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");

    if (!signInEmail.trim()) {
      setSignInError("Please enter your email address.");
      return;
    }

    const matchedUser = users.find(
      u => u.email.toLowerCase() === signInEmail.trim().toLowerCase()
    );

    if (!matchedUser) {
      setSignInError("Account not found. Please review your email address or sign up below!");
      return;
    }

    // Seed/demo accounts allow any password for testing.
    // Custom signed-up users can verify their password if saved
    if (matchedUser.password && signInPassword !== matchedUser.password) {
      setSignInError("Incorrect credentials. Please verify your password and try again.");
      return;
    }

    onLoginSuccess(matchedUser);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");

    if (!signUpFullName.trim() || !signUpEmail.trim() || !signUpPhone.trim()) {
      setSignUpError("Full Name, Email Address, and Phone Number are required fields.");
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError("Passwords do not match. Please re-type your password.");
      return;
    }

    const emailInUse = users.some(
      u => u.email.toLowerCase() === signUpEmail.trim().toLowerCase()
    );

    if (emailInUse) {
      setSignUpError("This email address is already bound to another registered account.");
      return;
    }

    // Create dynamic new registered user
    const newUserId = `USER-${Date.now().toString().slice(-5)}`;
    const newWalletId = `BP-WL-${Date.now().toString().slice(-4)}-ENG`;
    
    const newUser: RegisteredUser = {
      id: newUserId,
      fullName: signUpFullName.trim(),
      email: signUpEmail.trim().toLowerCase(),
      companyName: signUpCompany.trim() || "Independent Consultant",
      registeredAt: new Date().toLocaleDateString(),
      password: signUpPassword || undefined,
      role: signUpRole,
      phoneNumber: signUpPhone.trim(),
      verified: false,
      wallet: {
        walletId: newWalletId,
        balanceUsd: 100, // Starts with instant preloaded $100 engineering signup bonus
        balanceNgn: 150000, // Preloaded at 1500 NGN conversion rate
        transactions: [
          {
            id: `TX-SGP-${Date.now().toString().slice(-4)}`,
            type: "SIGNUP_BONUS",
            amountUsd: 100,
            amountNgn: 150000,
            timestamp: new Date().toLocaleString(),
            description: "🎉 Instant Portal Registration Capitalization Credit - Approved",
            status: "COMPLETED"
          }
        ]
      }
    };

    // Generate Verification SMS/Email PIN code
    const tokenPin = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(tokenPin);
    setPendingUser(newUser);
    setVerificationInput("");
    setVerificationError("");
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError("");

    if (verificationInput.trim() !== generatedCode) {
      setVerificationError("Invalid security token. Please check and input the correct 6-digit code!");
      return;
    }

    if (pendingUser) {
      const verifiedUser: RegisteredUser = {
        ...pendingUser,
        verified: true
      };
      onSignUpSuccess(verifiedUser);
      setPendingUser(null);
      setGeneratedCode("");
      setVerificationInput("");
    }
  };

  const selectPreset = (email: string) => {
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      onLoginSuccess(matched);
    } else {
      // Fallback if not loaded yet: manually find the preset matching
      setSignInEmail(email);
      setSignInPassword("admin");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Visual background atmospheric blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-rose-950/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-950 border border-slate-800/80 rounded-2xl shadow-2xl relative z-10 p-6 md:p-8">
        
        {/* Core Branding Panel */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-[10px] font-mono font-bold tracking-widest uppercase text-blue-400 mb-3">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-blue-400 animate-pulse" />
            BuildWise Capital & AI
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight font-sans">
            {pendingUser ? "Account Security Verification" : "Construction Forecast System"}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {pendingUser 
              ? "Complete your secure dual-factor verification to activate the top predictive software in the construction industry." 
              : "Verify identity to gain access to local risk audits, NIBSS settlement pipelines, and predictive materials modeling."}
          </p>
        </div>

        {/* Toggle Controls */}
        {!pendingUser && (
          <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 mb-6">
            <button
              onClick={() => {
                setIsSignUp(false);
                setSignInError("");
              }}
              className={`flex-1 py-2 text-xs font-bold font-sans rounded-lg transition-all cursor-pointer ${
                !isSignUp 
                  ? "bg-slate-800 text-white shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign-In Portal
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setSignUpError("");
              }}
              className={`flex-1 py-2 text-xs font-bold font-sans rounded-lg transition-all cursor-pointer ${
                isSignUp 
                  ? "bg-slate-800 text-white shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Auth Forms */}
        {pendingUser ? (
          /* Verification Form & Dispatched Welcome Notification */
          <div className="space-y-5 animate-in fade-in duration-300 font-sans">
            {verificationError && (
              <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-xl text-xs text-rose-300 font-semibold text-center">
                ⚠️ {verificationError}
              </div>
            )}

            {/* Simulated Secure Inbox Welcome Message */}
            <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-500 font-mono text-[9px] font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>SECURE DISPATCH CONSOLE [SIMULATED NETWORK]</span>
              </div>
              
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-2 text-slate-300 text-[11px] leading-relaxed">
                <div className="border-b border-slate-900 pb-1.5 text-slate-400 flex flex-col gap-0.5 font-mono text-[9px]">
                  <p><strong>To:</strong> {pendingUser.fullName} &lt;{pendingUser.email}&gt;</p>
                  <p><strong>SMS Node:</strong> {pendingUser.phoneNumber}</p>
                  <p><strong>Service:</strong> welcome-handshake@buildwise.ai</p>
                </div>
                
                <p className="font-bold text-slate-100 mt-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                  <span>Welcome to BuildWise AI, {pendingUser.fullName}!</span>
                </p>
                
                <p>
                  Your credentials have been loaded. BuildWise is recognized as the best predictive application in the construction industry, driving material and risk estimations with neural precision.
                </p>

                <p className="p-2.5 bg-slate-900 border border-slate-850 rounded text-center leading-normal">
                  <span className="text-slate-400 font-bold block text-[10px]">📧 EMAIL CONFIRMATION LINK:</span>
                  <span 
                    className="text-blue-400 hover:text-blue-300 underline font-semibold cursor-pointer text-[11px] block mt-0.5 break-all font-mono" 
                    onClick={() => setVerificationInput(generatedCode)}
                  >
                    https://buildwise.ai/verify?token=BW-{generatedCode}
                  </span>
                </p>

                <div className="p-2.5 bg-slate-900 border border-slate-850 rounded text-center">
                  <span className="text-slate-400 font-bold block text-[10px] mb-0.5">📱 SMS ACTIVE TOKEN PIN:</span>
                  <strong className="text-[#fea619] tracking-widest font-mono text-base">{generatedCode}</strong>
                </div>

                <p className="text-[10px] text-slate-500 italic mt-1 text-center">
                  💡 Tip: Click the link above for instant autofill verification, or type the SMS PIN below!
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 text-center">
                  Enter Account Verification Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 text-center text-lg font-mono font-bold tracking-widest text-[#fea619] placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setPendingUser(null);
                    setGeneratedCode("");
                    setVerificationInput("");
                  }}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-400 text-[10px] uppercase font-extrabold rounded-xl transition-all border border-slate-800 cursor-pointer text-center"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-[10px] uppercase font-extrabold rounded-xl transition-all shadow-lg cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Verify & Unlock</span>
                </button>
              </div>
            </form>
          </div>
        ) : !isSignUp ? (
          /* Sign In Form */
          <form onSubmit={handleSignIn} className="space-y-4">
            {signInError && (
              <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-xl text-xs text-rose-300 font-semibold">
                ⚠️ {signInError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-sans text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Authentication Code / Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer font-semibold"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-sans text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <p className="text-[9px] text-slate-500">
                Tip: Leave password empty to quickly login using default test accounts.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-mono text-xs uppercase tracking-wider font-extrabold rounded-xl text-center shadow-lg transition-all cursor-pointer mt-2"
            >
              Sign-In & Sync Dashboard
            </button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} className="space-y-4">
            {signUpError && (
              <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-xl text-xs text-rose-300 font-semibold">
                ⚠️ {signUpError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Imo Joseph"
                  value={signUpFullName}
                  onChange={(e) => setSignUpFullName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-sans text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="imojoseph@company.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-sans text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Simulated Phone number collection */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Phone Number (SMS Security Active) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. +234 803 123 4567"
                  value={signUpPhone}
                  onChange={(e) => setSignUpPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-sans text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Company Name
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Federal Engineering Consortium"
                  value={signUpCompany}
                  onChange={(e) => setSignUpCompany(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-sans text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Operation Group Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSignUpRole("executive")}
                  className={`py-2 px-3 text-left rounded-xl text-[11px] font-sans border transition-all ${
                    signUpRole === "executive"
                      ? "bg-blue-900/20 border-blue-500 text-blue-200"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <p className="font-bold">Officer / CEO</p>
                  <p className="text-[9px] opacity-70">Oversight & Capital</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSignUpRole("analyst")}
                  className={`py-2 px-3 text-left rounded-xl text-[11px] font-sans border transition-all ${
                    signUpRole === "analyst"
                      ? "bg-amber-900/20 border-amber-500 text-amber-200"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <p className="font-bold">Estimator / Analyst</p>
                  <p className="text-[9px] opacity-70">Forecasting & Trends</p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs font-sans text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Confirm
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs font-sans text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Micro starting credit callout */}
            <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-[10px] text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Includes instant provisioned <strong>$100.00 (₦150,000)</strong> starting engineering ledger credit!</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-mono text-xs uppercase tracking-wider font-extrabold rounded-xl text-center shadow-lg transition-all cursor-pointer"
            >
              Sign Up & Open Wallet
            </button>
          </form>
        )}

        {/* Demo Fast Sandbox Switcher */}
        <div className="mt-8 pt-5 border-t border-slate-800/80">
          <p className="text-[10px] font-bold text-center uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Active Pre-seeded Team Accounts
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => selectPreset(p.email)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all cursor-pointer"
              >
                <img
                  alt={p.name}
                  src={p.avatar}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-200 truncate">{p.name}</p>
                  <p className="text-[9px] text-slate-400 truncate leading-none mt-0.5">{p.role}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-center items-center gap-1.5 mt-3.5 text-[10px] text-slate-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Secure Enterprise SSL Handshake Active</span>
          </div>
        </div>

      </div>
    </div>
  );
}
