import React, { useState, useEffect, useMemo } from "react";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send, 
  PlusCircle, 
  Coins, 
  CheckCircle2, 
  X, 
  Search, 
  Filter, 
  Clock, 
  CreditCard, 
  Building2, 
  Sparkles, 
  User, 
  Plus, 
  DollarSign, 
  FileText, 
  Compass,
  ArrowRight,
  TrendingUp,
  Award
} from "lucide-react";
import { ActiveProject, RegisteredUser, WalletTransaction } from "../types";

interface WalletViewProps {
  activeProjects: ActiveProject[];
  setActiveProjects: React.Dispatch<React.SetStateAction<ActiveProject[]>>;
  riskAlerts: any[];
  setRiskAlerts: React.Dispatch<React.SetStateAction<any[]>>;
  addIncident: (type: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', description: string) => void;
  users: RegisteredUser[];
  setUsers: React.Dispatch<React.SetStateAction<RegisteredUser[]>>;
  activeUserId: string;
  setActiveUserId: React.Dispatch<React.SetStateAction<string>>;
}

export default function WalletView({
  activeProjects,
  setActiveProjects,
  riskAlerts,
  setRiskAlerts,
  addIncident,
  users,
  setUsers,
  activeUserId,
  setActiveUserId
}: WalletViewProps) {
  // Exchange rate: 1 USD = ₦1,500 NGN
  const FX_RATE = 1500;

  // UI state managers
  const [isRegistering, setIsRegistering] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState<WalletTransaction | null>(null);

  // New User Registration Form states
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regCompany, setRegCompany] = useState("");

  // Transaction form states
  const [txAmount, setTxAmount] = useState("");
  const [txCurrency, setTxCurrency] = useState<'USD' | 'NGN'>('USD');
  const [fundTargetType, setFundTargetType] = useState<'USER' | 'PROJECT'>('PROJECT');
  const [targetWalletId, setTargetWalletId] = useState("");
  const [targetProjectLocation, setTargetProjectLocation] = useState("");
  const [txDescription, setTxDescription] = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [txFilter, setTxFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'BONUS'>('ALL');

  // Success celebration message
  const [partyMessage, setPartyMessage] = useState<string | null>(null);

  // Local Bank Transfer states
  const [banksList, setBanksList] = useState<{ code: string; name: string }[]>([]);
  const [targetBankCode, setTargetBankCode] = useState("");
  const [targetAccountNumber, setTargetAccountNumber] = useState("");
  const [resolvedAccountName, setResolvedAccountName] = useState("");
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [resolveAccountError, setResolveAccountError] = useState("");
  const [isTransferringFunds, setIsTransferringFunds] = useState(false);
  const [isLiveConnection, setIsLiveConnection] = useState(false);
  const [useCustomBank, setUseCustomBank] = useState(false);
  const [customBankName, setCustomBankName] = useState("");

  // Load the list of active banks from the server
  useEffect(() => {
    const loadBanks = async () => {
      try {
        const response = await fetch("/api/banks");
        const data = await response.json();
        if (data && data.status === "success" && data.banks) {
          setBanksList(data.banks);
          if (data.banks.length > 0) {
            setTargetBankCode(data.banks[0].code);
            setUseCustomBank(false);
          } else {
            setTargetBankCode("CUSTOM");
            setUseCustomBank(true);
          }
          if (data.live) {
            setIsLiveConnection(true);
          }
        } else {
          setTargetBankCode("CUSTOM");
          setUseCustomBank(true);
        }
      } catch (err) {
        console.error("Failed to query bank endpoints:", err);
        setTargetBankCode("CUSTOM");
        setUseCustomBank(true);
      }
    };
    loadBanks();
  }, []);

  // Trigger automatic name resolution as soon as account number reaches exactly 10 digits
  useEffect(() => {
    if (targetAccountNumber.length === 10 && targetBankCode && targetBankCode !== "CUSTOM") {
      const resolveAccount = async () => {
        setIsResolvingAccount(true);
        setResolveAccountError("");
        setResolvedAccountName("");
        try {
          const res = await fetch("/api/resolve-bank", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              accountNumber: targetAccountNumber,
              bankCode: targetBankCode,
            }),
          });
          const data = await res.json();
          if (res.ok && data && data.status === "success") {
            setResolvedAccountName(data.data.account_name);
          } else {
            setResolveAccountError(data.message || "Failed to resolve bank account.");
          }
        } catch (err) {
          console.error("Failed to query bank lookup:", err);
          setResolveAccountError("Network error. Could not connect to verification server.");
        } finally {
          setIsResolvingAccount(false);
        }
      };
      resolveAccount();
    } else {
      setResolveAccountError("");
    }
  }, [targetAccountNumber, targetBankCode]);

  // Sync users list to localStorage on adjustment
  const saveUsersList = (updatedUsers: RegisteredUser[]) => {
    setUsers(updatedUsers);
    localStorage.setItem("buildwise_registered_users", JSON.stringify(updatedUsers));
  };

  // Currently logged-in/active user computed details
  const currentUser = useMemo(() => {
    return users.find(u => u.id === activeUserId);
  }, [users, activeUserId]);

  // Handle registering a new user
  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim()) {
      alert("Please provide at least a Full Name and valid Email address.");
      return;
    }

    const newUserId = `USER-${Date.now().toString().slice(-5)}`;
    const newWalletId = `BP-WL-${Date.now().toString().slice(-4)}-ENG`;
    
    const newUser: RegisteredUser = {
      id: newUserId,
      fullName: regFullName.trim(),
      email: regEmail.trim(),
      companyName: regCompany.trim() || 'Independent Developer',
      registeredAt: new Date().toLocaleDateString(),
      role: "analyst",
      wallet: {
        walletId: newWalletId,
        balanceUsd: 100, // Preloaded with $100 signup credit as specified
        balanceNgn: 100 * FX_RATE,
        transactions: [
          {
            id: `TX-SGP-${Date.now().toString().slice(-4)}`,
            type: "SIGNUP_BONUS",
            amountUsd: 100,
            amountNgn: 100 * FX_RATE,
            timestamp: new Date().toLocaleString(),
            description: "🎉 Instant Sign-up Token Credit! Enjoy $100 starting engineering balance.",
            status: "COMPLETED"
          }
        ]
      }
    };

    const updated = [...users, newUser];
    saveUsersList(updated);
    setActiveUserId(newUserId);

    // Form resets
    setRegFullName("");
    setRegEmail("");
    setRegCompany("");
    setIsRegistering(false);

    // Dynamic Topbar Alert System Inject
    const formatTimestamp = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }) + `, ${new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })}`;
    setRiskAlerts(prev => [
      {
        id: `SYS-${Date.now().toString().slice(-4)}`,
        severity: "RESOLVED",
        time: "Just now",
        title: `Asset Wallet Opened: ${newUser.fullName}`,
        description: `Registered engineering wallet ${newWalletId} loaded with $100 startup credit successfully.`
      },
      ...prev
    ]);

    triggerNotificationBubble(`Welcome ${newUser.fullName}! Your construction engineering wallet has been provisioned with a $100 signup credit bonus.`);
  };

  // Deposit Action Handler
  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(txAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Invalid deposit sum. Enter a positive number.");
      return;
    }

    if (!currentUser) return;

    // Calculate added values
    const addedUsd = txCurrency === 'USD' ? numericAmount : numericAmount / FX_RATE;
    const addedNgn = txCurrency === 'NGN' ? numericAmount : numericAmount * FX_RATE;

    const newTx: WalletTransaction = {
      id: `TX-DEP-${Date.now().toString().slice(-4)}`,
      type: "DEPOSIT",
      amountUsd: addedUsd,
      amountNgn: addedNgn,
      timestamp: new Date().toLocaleString(),
      description: txDescription.trim() || `Inbound digital capitalization load (${txCurrency})`,
      status: "COMPLETED"
    };

    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          wallet: {
            ...u.wallet,
            balanceUsd: u.wallet.balanceUsd + addedUsd,
            balanceNgn: u.wallet.balanceNgn + addedNgn,
            transactions: [newTx, ...u.wallet.transactions]
          }
        };
      }
      return u;
    });

    saveUsersList(updatedUsers);
    setShowDepositModal(false);
    setTxAmount("");
    setTxDescription("");

    addIncident("Capital Funding", "LOW", `Registered user cleared capital deposits of ₦${addedNgn.toLocaleString(undefined, {maximumFractionDigits: 0})} ($${addedUsd.toFixed(2)}) into core development reserves.`);
    triggerNotificationBubble(`Successfully deposited $${addedUsd.toFixed(2)} / ₦${addedNgn.toLocaleString(undefined, {maximumFractionDigits: 0})} to your wallet.`);
  };

  // Withdraw Action Handler
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(txAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Invalid withdraw request amount.");
      return;
    }

    if (!currentUser) return;

    const deductUsd = txCurrency === 'USD' ? numericAmount : numericAmount / FX_RATE;
    const deductNgn = txCurrency === 'NGN' ? numericAmount : numericAmount * FX_RATE;

    if (currentUser.wallet.balanceUsd < deductUsd) {
      alert(`Insufficient funds! Your balance is only $${currentUser.wallet.balanceUsd.toFixed(2)} (₦${currentUser.wallet.balanceNgn.toLocaleString(undefined, {maximumFractionDigits: 0})}). Please enter a lower amount.`);
      return;
    }

    if (!resolvedAccountName.trim()) {
      alert("Please enter the Account Holder Name to authorize the outbound transaction.");
      return;
    }

    setIsTransferringFunds(true);
    try {
      const finalBankCode = useCustomBank ? "CUSTOM" : targetBankCode;
      const response = await fetch("/api/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountNumber: targetAccountNumber,
          bankCode: finalBankCode,
          accountName: resolvedAccountName,
          amountNgn: deductNgn,
          reason: txDescription.trim() || `Construction payout to: ${resolvedAccountName}`,
        }),
      });

      const data = await response.json();
      if (response.ok && data.status === "success") {
        const selectedBank = banksList.find(b => b.code === targetBankCode);
        const bankName = useCustomBank ? customBankName : (selectedBank ? selectedBank.name : "Local Bank Account");

        const newTx: WalletTransaction = {
          id: data.reference || `TX-WTH-${Date.now().toString().slice(-4)}`,
          type: "WITHDRAW",
          amountUsd: deductUsd,
          amountNgn: deductNgn,
          timestamp: new Date().toLocaleString(),
          recipientName: resolvedAccountName,
          description: txDescription.trim() || `Fund payout to ${resolvedAccountName} // ${bankName} (${targetAccountNumber})`,
          status: "COMPLETED"
        };

        const updatedUsers = users.map(u => {
          if (u.id === currentUser.id) {
            return {
              ...u,
              wallet: {
                ...u.wallet,
                balanceUsd: u.wallet.balanceUsd - deductUsd,
                balanceNgn: u.wallet.balanceNgn - deductNgn,
                transactions: [newTx, ...u.wallet.transactions]
              }
            };
          }
          return u;
        });

        saveUsersList(updatedUsers);
        setShowWithdrawModal(false);
        setTxAmount("");
        setTargetAccountNumber("");
        setResolvedAccountName("");
        setTxDescription("");

        addIncident("Capital Outflow", "MEDIUM", `Withdrew ₦${deductNgn.toLocaleString(undefined, {maximumFractionDigits: 0})} ($${deductUsd.toFixed(2)}) out of active project wallet to ${resolvedAccountName} (${bankName}).`);
        triggerNotificationBubble(`Withdraw completed! Successfully transferred ₦${deductNgn.toLocaleString(undefined, {maximumFractionDigits: 0})} to ${resolvedAccountName} (${bankName}).`);
      } else {
        alert(data.message || "Failed to process bank transfer with payout gateway.");
      }
    } catch (err) {
      console.error("Failed to execute transfer pipeline:", err);
      alert("Network error executing fund payout pipeline.");
    } finally {
      setIsTransferringFunds(false);
    }
  };

  // Handle Transfer Actions
  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(txAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Invalid transfer quantum.");
      return;
    }

    if (!currentUser) return;

    const transferUsd = txCurrency === 'USD' ? numericAmount : numericAmount / FX_RATE;
    const transferNgn = txCurrency === 'NGN' ? numericAmount : numericAmount * FX_RATE;

    if (currentUser.wallet.balanceUsd < transferUsd) {
      alert("Inadequate funding inside active wallet to proceed with transfer request.");
      return;
    }

    if (fundTargetType === 'USER') {
      // Transfer to another registered user wallet
      const recipient = users.find(u => u.wallet.walletId === targetWalletId || u.id === targetWalletId);
      if (!recipient) {
        alert("Recipient wallet address or ID not found. Ensure correct registration code.");
        return;
      }
      if (recipient.id === currentUser.id) {
        alert("Action barred! You cannot initiate a transfer to your own active wallet.");
        return;
      }

      // Debit Sender
      const senderTx: WalletTransaction = {
        id: `TX-TRF-${Date.now().toString().slice(-4)}`,
        type: "TRANSFER_OUT",
        amountUsd: transferUsd,
        amountNgn: transferNgn,
        recipientName: recipient.fullName,
        recipientWalletId: recipient.wallet.walletId,
        timestamp: new Date().toLocaleString(),
        description: txDescription.trim() || `Balance transfer to ${recipient.fullName}`,
        status: "COMPLETED"
      };

      // Credit Recipient
      const recTx: WalletTransaction = {
        id: `TX-TRF-${Date.now().toString().slice(-4)}`,
        type: "TRANSFER_IN",
        amountUsd: transferUsd,
        amountNgn: transferNgn,
        senderName: currentUser.fullName,
        senderWalletId: currentUser.wallet.walletId,
        timestamp: new Date().toLocaleString(),
        description: `Inbound transfer received from ${currentUser.fullName}`,
        status: "COMPLETED"
      };

      const updatedUsers = users.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            wallet: {
              ...u.wallet,
              balanceUsd: u.wallet.balanceUsd - transferUsd,
              balanceNgn: u.wallet.balanceNgn - transferNgn,
              transactions: [senderTx, ...u.wallet.transactions]
            }
          };
        }
        if (u.id === recipient.id) {
          return {
            ...u,
            wallet: {
              ...u.wallet,
              balanceUsd: u.wallet.balanceUsd + transferUsd,
              balanceNgn: u.wallet.balanceNgn + transferNgn,
              transactions: [recTx, ...u.wallet.transactions]
            }
          };
        }
        return u;
      });

      saveUsersList(updatedUsers);
      triggerNotificationBubble(`Transferred $${transferUsd.toFixed(2)} to ${recipient.fullName}.`);

    } else {
      // DIRECT PROJECT FUNDING
      // Subtract from wallet balance and offset actual construction budget delta representing savings
      const targetProj = activeProjects.find(p => p.location === targetProjectLocation);
      if (!targetProj) {
        alert("Please select a valid construction site to channel project capital.");
        return;
      }

      const senderTx: WalletTransaction = {
        id: `TX-PRJ-${Date.now().toString().slice(-4)}`,
        type: "TRANSFER_OUT",
        amountUsd: transferUsd,
        amountNgn: transferNgn,
        referenceProject: targetProj.location,
        timestamp: new Date().toLocaleString(),
        description: txDescription.trim() || `Material Logistics & Procurements: ${targetProj.location}`,
        status: "COMPLETED"
      };

      // Adjust the project's budget delta dynamically (decrease budget overrun or increase savings)
      const adjustedProjects = activeProjects.map(p => {
        if (p.location === targetProj.location) {
          // Funding decreases current budget overrun (or increases budget safety surplus)
          const newDelta = p.budgetDelta - transferNgn;
          const pctText = newDelta > 0 ? `+${((newDelta / 4200000000) * 100).toFixed(1)}% Overrun` : `Optional cost savings`;
          return {
            ...p,
            budgetDelta: newDelta,
            budgetStatus: `₦${((4200000000 + newDelta) / 1000000000).toFixed(1)}B (${pctText})`
          };
        }
        return p;
      });

      setActiveProjects(adjustedProjects);

      const updatedUsers = users.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            wallet: {
              ...u.wallet,
              balanceUsd: u.wallet.balanceUsd - transferUsd,
              balanceNgn: u.wallet.balanceNgn - transferNgn,
              transactions: [senderTx, ...u.wallet.transactions]
            }
          };
        }
        return u;
      });

      saveUsersList(updatedUsers);
      addIncident("Project Injection", "LOW", `Wallet injection of ₦${transferNgn.toLocaleString(undefined, {maximumFractionDigits: 0})} allocated direct to construction site: ${targetProj.location}.`);
      triggerNotificationBubble(`Allocated ₦${transferNgn.toLocaleString(undefined, {maximumFractionDigits: 0})} to offset ${targetProj.location} material budget.`);
    }

    setShowTransferModal(false);
    setTxAmount("");
    setTargetWalletId("");
    setTxDescription("");
  };

  // Toast notifier message
  const triggerNotificationBubble = (msg: string) => {
    setPartyMessage(msg);
    setTimeout(() => {
      setPartyMessage(null);
    }, 6000);
  };

  // Filtered transactions computed list
  const filteredTransactions = useMemo(() => {
    if (!currentUser) return [];
    return currentUser.wallet.transactions.filter(tx => {
      const matchesSearch = 
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.recipientName && tx.recipientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tx.senderName && tx.senderName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter = 
        txFilter === 'ALL' ||
        (txFilter === 'DEPOSIT' && tx.type === 'DEPOSIT') ||
        (txFilter === 'WITHDRAW' && tx.type === 'WITHDRAW') ||
        (txFilter === 'BONUS' && tx.type === 'SIGNUP_BONUS') ||
        (txFilter === 'TRANSFER' && (tx.type === 'TRANSFER_IN' || tx.type === 'TRANSFER_OUT'));

      return matchesSearch && matchesFilter;
    });
  }, [currentUser, searchQuery, txFilter]);

  // Aggregate stats
  const statistics = useMemo(() => {
    if (!currentUser) return { deposited: 0, withdrawn: 0, spent: 0 };
    let deposited = 0;
    let withdrawn = 0;
    let spent = 0;

    currentUser.wallet.transactions.forEach(tx => {
      if (tx.type === 'DEPOSIT') deposited += tx.amountUsd;
      if (tx.type === 'WITHDRAW') withdrawn += tx.amountUsd;
      if (tx.type === 'TRANSFER_OUT') spent += tx.amountUsd;
      if (tx.type === 'SIGNUP_BONUS') deposited += tx.amountUsd;
    });

    return { deposited, withdrawn, spent };
  }, [currentUser]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Visual Toast Notification on triggers */}
      {partyMessage && (
        <div className="fixed top-6 right-6 z-55 flex items-center gap-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl py-3.5 px-5 shadow-2xl animate-bounce border border-emerald-450 max-w-sm">
          <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
          <div className="text-xs">
            <span className="font-extrabold uppercase font-mono block">WALLET ALERT</span>
            <span className="font-sans font-medium">{partyMessage}</span>
          </div>
          <button onClick={() => setPartyMessage(null)} className="text-white/80 hover:text-white ml-2 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="font-mono text-xs text-[#004ac6] uppercase font-bold tracking-widest leading-none block mb-1">
            BuildWise AI // Capital Flow Manager
          </span>
          <h2 className="font-display-lg text-3xl font-extrabold text-slate-900 leading-tight">
            Integrated Project Wallet
          </h2>
        </div>

        {/* Change Account selectors / Register prompt */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 px-3">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Active Account:</span>
            <select
              value={activeUserId}
              onChange={(e) => {
                setActiveUserId(e.target.value);
                triggerNotificationBubble(`Switched dashboard workspace context to ${users.find(u => u.id === e.target.value)?.fullName}`);
              }}
              className="bg-transparent border-0 text-slate-700 focus:outline-none font-sans font-bold text-xs p-0 m-0 cursor-pointer"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.companyName.slice(0, 18)})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsRegistering(true)}
            className="px-3.5 py-2.5 bg-gradient-to-r from-blue-600 to-[#1e3a8a] text-white hover:brightness-110 active:scale-95 transition-all text-xs font-bold uppercase font-label-caps rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 font-bold" />
            <span>Register New Wallet</span>
          </button>

        </div>
      </div>

      {/* REGISTRATION PANEL OVERVIEW (WHEN OPENED) */}
      {isRegistering && (
        <div className="bg-[#0b1329] border border-blue-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl animate-in slide-in-from-top-4 duration-300">
          <div className="absolute top-0 right-0 p-3">
            <button 
              onClick={() => setIsRegistering(false)}
              className="p-1 px-2.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              Close <X className="inline w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-[#06b6d4] uppercase font-mono font-bold tracking-widest mb-1">
              <Award className="w-4 h-4 text-[#06b6d4] animate-pulse" />
              $100.00 USD EXCLUSIVE SIGN-UP ENTICEMENT BONUS
            </div>
            <h3 className="font-display-lg text-xl font-bold tracking-tight mb-2">
              Provision Your Precision Engineering Wallet
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Establish a centralized capital ledger. Every newly initialized engineering wallet receives an immediate <strong>$100.00 (₦150,000) Signup Token</strong> allocated from the BuildWise catalyst treasury to kickstart your operations.
            </p>

            <form onSubmit={handleRegisterUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1.5">Full Representative Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Imo Joseph, Olushina Awe"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1.5">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.org"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1.5">Engineering Firm / Guild</label>
                  <input
                    type="text"
                    placeholder="e.g. Lagos Rail Group"
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                
                <button
                  type="submit"
                  className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-2 px-4 rounded-lg font-bold uppercase font-label-caps text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-colors h-[34px]"
                >
                  <span>MINT WALLET</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WALLET METRICS OVERVIEW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Holographic Credit Card representation (5 cols) */}
        <div className="lg:col-span-4 bg-[#0a0f1d] border border-blue-950 rounded-2xl p-6 text-white flex flex-col justify-between relative overflow-hidden min-h-[260px] shadow-lg">
          {/* Subtle grid lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none"></div>
          
          {/* Wave line graph representation backing */}
          <div className="absolute bottom-0 right-0 left-0 h-28 opacity-20 pointer-events-none">
            <svg viewBox="0 0 400 150" className="w-full h-full">
              <path d="M 0 100 Q 100 20 Q 200 120 T 400 60 L 400 150 L 0 150 Z" fill="url(#cardGraphGrad)" />
              <defs>
                <linearGradient id="cardGraphGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400 rotate-12" />
              <span className="font-mono text-[9px] uppercase font-bold tracking-widest text-slate-400">
                BUILDWISE CORE PASSPORT
              </span>
            </div>
            
            <span className="text-[10px] bg-sky-950/80 border border-sky-900 text-[#06b6d4] font-mono font-bold px-2 py-0.5 rounded uppercase">
              DEBIT LEDGER
            </span>
          </div>

          <div className="my-8 relative z-10">
            <p className="text-[9px] uppercase font-mono text-slate-400 tracking-wider mb-1 block">Active Project Funds</p>
            <div className="space-y-0.5">
              <span className="text-3xl font-display-lg font-black tracking-tight text-white block">
                ${currentUser?.wallet.balanceUsd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
              <span className="text-sm font-sans font-bold text-[#38bdf8] block">
                ₦{currentUser?.wallet.balanceNgn.toLocaleString(undefined, {maximumFractionDigits: 0})} NGN
              </span>
            </div>
          </div>

          <div className="relative z-10 flex justify-between items-end border-t border-slate-800/60 pt-4">
            <div>
              <p className="text-[8px] uppercase font-mono text-slate-400 tracking-wider">Representative Holder</p>
              <p className="text-xs font-sans font-bold text-white">{currentUser?.fullName || "No User Selected"}</p>
            </div>

            <div className="text-right">
              <p className="text-[8px] uppercase font-mono text-slate-400 tracking-wider">WALLET IDENTIFIER</p>
              <p className="text-[10px] font-mono font-bold text-amber-400">{currentUser?.wallet.walletId || "N/A"}</p>
            </div>
          </div>

        </div>

        {/* Action center (DEPOSIT / WITHDRAW / TRANSFER) and Stats summary cards (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Quick Action Buttons widget box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <span className="font-mono text-[9px] text-[#004ac6] font-bold uppercase tracking-wider block mb-1">
                EXCHANGE CONTROLS
              </span>
              <h3 className="font-display-lg font-extrabold text-[#0a1128] text-base mb-1.5">
                Capital Allocation Actions
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans mb-5">
                Utilize integrated bank instruments to scale projects, fuel labour checkpoints, or withdrawal cash to site-supervisors.
              </p>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    setTxCurrency('USD');
                    setShowDepositModal(true);
                  }}
                  className="flex flex-col items-center justify-center p-3.5 bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-slate-100 rounded-xl gap-2 transition-all cursor-pointer group"
                >
                  <ArrowDownLeft className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="font-sans font-bold text-[10px] uppercase text-slate-700">Deposit</span>
                </button>

                <button
                  onClick={() => {
                    setTxCurrency('USD');
                    setShowWithdrawModal(true);
                  }}
                  className="flex flex-col items-center justify-center p-3.5 bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-slate-100 rounded-xl gap-2 transition-all cursor-pointer group"
                >
                  <ArrowUpRight className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
                  <span className="font-sans font-bold text-[10px] uppercase text-slate-700">Withdraw</span>
                </button>

                <button
                  onClick={() => {
                    setTxCurrency('NGN');
                    setFundTargetType('PROJECT');
                    setShowTransferModal(true);
                  }}
                  className="flex flex-col items-center justify-center p-3.5 bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-slate-100 rounded-xl gap-2 transition-all cursor-pointer group animate-pulse hover:animate-none"
                >
                  <Send className="w-5 h-5 text-[#004ac6] group-hover:translate-x-1.5 group-hover:-translate-y-1.5 transition-transform" />
                  <span className="font-sans font-bold text-[10px] uppercase text-slate-700">Transfer</span>
                </button>

              </div>
            </div>

            <div className="border-t border-slate-150 pt-3 mt-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Standard Baseline Exchange Ratio:</span>
              <span className="font-bold text-slate-700">1.00 USD = ₦{FX_RATE.toLocaleString()} NGN</span>
            </div>
          </div>

          {/* Core Analytics Overview Block representation of spending breakdown */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <span className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                CAPITAL VELOCITY
              </span>
              <h3 className="font-display-lg font-extrabold text-slate-900 text-base mb-1.5">
                Allocations & Reserves Statistics
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans mb-5">
                Track inbound capital receipts against outbound material offsets and structural direct payments.
              </p>

              {/* Stat figures stack */}
              <div className="space-y-3.5 font-sans text-xs">
                
                <div className="flex items-center justify-between pb-1 inline-border border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Total Received Base (Inc Signup Bonus):</span>
                  <span className="font-bold text-slate-800">
                    +${statistics.deposited.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-1 inline-border border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Total Outbound Site Injection:</span>
                  <span className="font-bold text-[#004ac6]">
                    -${statistics.spent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">ATM / Corporate Withdrawals:</span>
                  <span className="font-bold text-rose-500">
                    -${statistics.withdrawn.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>

              </div>
            </div>

            {/* Micro simple representation progress bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mb-1">
                <span>Wallet Utilization Efficiency:</span>
                <span>
                  {statistics.deposited > 0 
                    ? `${((statistics.spent / statistics.deposited) * 100).toFixed(0)}% Allocated` 
                    : "0% Allocated"}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${statistics.deposited > 0 ? Math.min(100, (statistics.spent / statistics.deposited) * 100) : 0}%` }}
                ></div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* CORE HISTORIC LEDGER LOG LIST */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        
        {/* Ledger actions toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="font-display-lg font-extrabold text-slate-900 text-base m-0">
              Corporate Account Ledger
            </h3>
            <p className="text-[11px] text-slate-450 leading-none mt-1">
              Active ledger of all deposit logs, site transfers, and token credits.
            </p>
          </div>

          {/* Filters and search utilities */}
          <div className="flex flex-wrap gap-3 items-center">
            
            {/* Search inputs */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search description, reference ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 text-slate-800"
              />
            </div>

            {/* Quick type filter tabs */}
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-[10px] font-mono">
              <button
                onClick={() => setTxFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                  txFilter === 'ALL' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTxFilter('DEPOSIT')}
                className={`px-2.5 py-1 rounded-md font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                  txFilter === 'DEPOSIT' ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Inflow
              </button>
              <button
                onClick={() => setTxFilter('WITHDRAW')}
                className={`px-2.5 py-1 rounded-md font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                  txFilter === 'WITHDRAW' ? "bg-white text-rose-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Drafts
              </button>
              <button
                onClick={() => setTxFilter('TRANSFER')}
                className={`px-2.5 py-1 rounded-md font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                  txFilter === 'TRANSFER' ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Transfers
              </button>
              <button
                onClick={() => setTxFilter('BONUS')}
                className={`px-2.5 py-1 rounded-md font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                  txFilter === 'BONUS' ? "bg-white text-purple-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Bonus
              </button>
            </div>

          </div>
        </div>

        {/* Transactions list table */}
        <div className="overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <Coins className="w-10 h-10 text-slate-300 stroke-1 mb-2 animate-bounce" />
              <p className="text-xs font-sans">No matching capital transfers or account logs found.</p>
              <p className="text-[10px] font-mono mt-1">Try resetting filters or registering a standard deposit.</p>
            </div>
          ) : (
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-450 text-[10px] font-mono uppercase font-bold">
                  <th className="pb-3 pl-2">Transaction ID</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Detailed Description</th>
                  <th className="pb-3 text-right">Value (USD)</th>
                  <th className="pb-3 text-right">Value (NGN)</th>
                  <th className="pb-3 pr-2 text-right">Instruments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-750">
                {filteredTransactions.map((tx) => {
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pl-2 font-mono text-[11px] font-bold text-slate-800">
                        {tx.id}
                      </td>
                      
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase ${
                          tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN'
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : tx.type === 'WITHDRAW'
                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                            : tx.type === 'SIGNUP_BONUS'
                            ? "bg-purple-50 text-purple-700 border border-purple-100 font-extrabold"
                            : "bg-blue-50 text-blue-700 border border-blue-100"
                        }`}>
                          {tx.type.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-3.5 text-slate-450 text-[10px] font-mono whitespace-nowrap">
                        <Clock className="inline w-3 h-3 mr-1 text-slate-400" />
                        {tx.timestamp}
                      </td>

                      <td className="py-3.5 select-all">
                        <div className="font-semibold text-slate-800 line-clamp-1">{tx.description}</div>
                        {tx.referenceProject && (
                          <div className="text-[9px] font-mono text-blue-600 mt-0.5 flex items-center gap-1 uppercase">
                            <Building2 className="w-2.5 h-2.5" />
                            <span>Destination Grid: {tx.referenceProject}</span>
                          </div>
                        )}
                        {tx.recipientName && (
                          <div className="text-[9px] font-mono text-[#004ac6] mt-0.5 flex items-center gap-1 uppercase">
                            <Send className="w-2.5 h-2.5" />
                            <span>Target Holder: {tx.recipientName} ({tx.recipientWalletId?.slice(-6)})</span>
                          </div>
                        )}
                        {tx.senderName && (
                          <div className="text-[9px] font-mono text-emerald-700 mt-0.5 flex items-center gap-1 uppercase">
                            <PlusCircle className="w-2.5 h-2.5" />
                            <span>Source Holder: {tx.senderName} ({tx.senderWalletId?.slice(-6)})</span>
                          </div>
                        )}
                      </td>

                      <td className={`py-3.5 text-right font-mono font-bold whitespace-nowrap ${
                        tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' || tx.type === 'SIGNUP_BONUS'
                          ? "text-emerald-600"
                          : "text-slate-800"
                      }`}>
                        {tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' || tx.type === 'SIGNUP_BONUS' ? "+" : "-"}
                        ${tx.amountUsd.toFixed(2)}
                      </td>

                      <td className={`py-3.5 text-right font-mono text-slate-500 whitespace-nowrap`}>
                        {tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' || tx.type === 'SIGNUP_BONUS' ? "+" : "-"}
                        ₦{tx.amountNgn.toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </td>

                      <td className="py-3.5 pr-2 text-right">
                        <button
                          onClick={() => setShowReceipt(tx)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 text-[10px] uppercase font-mono font-bold rounded cursor-pointer transition-colors"
                        >
                          Invoice
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* RENDER POPUP/MODALS FOR OPERATIONS */}
      
      {/* 1. DEPOSIT MODAL */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border text-slate-800 border-slate-200 rounded-2xl p-6 shadow-2xl max-w-sm w-full font-sans animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="font-extrabold text-slate-900 text-sm font-sans flex items-center gap-2 m-0">
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                Deposit Cash Assets
              </h4>
              <button onClick={() => setShowDepositModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Corporate Source Selector</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-none">
                  <option>E-Wire Bank Transfer Gateway</option>
                  <option>Secured Chevron Master Corporate Direct Debit</option>
                  <option>Local Interswitch Central Inflow</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 flex justify-between">
                  <span>Funding Quantum *</span>
                  <span className="text-slate-400 lowercase italic">Minimum: $1.00</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    required
                    required-placeholder="0.00"
                    placeholder="Enter amount"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <select
                    value={txCurrency}
                    onChange={(e) => setTxCurrency(e.target.value as any)}
                    className="bg-slate-100 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="NGN">NGN (₦)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Ledger Reference Description</label>
                <input
                  type="text"
                  placeholder="e.g. Funding concrete reinforcements"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[11px] uppercase tracking-wider font-extrabold rounded-lg text-center cursor-pointer shadow"
                >
                  TRANSMIT CAPITAL INFLOW
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border text-slate-800 border-slate-200 rounded-2xl p-6 shadow-2xl max-w-sm w-full font-sans animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="font-extrabold text-slate-900 text-sm font-sans flex items-center gap-2 m-0">
                <ArrowUpRight className="w-4 h-4 text-rose-500" />
                Transfer Funds Outbound
              </h4>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Connection Channel Banner */}
            <div className={`p-2.5 rounded-xl border text-[10px] space-y-0.5 mb-4 flex items-start gap-2 ${
              isLiveConnection 
                ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                : "bg-amber-50 text-amber-800 border-amber-100"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${isLiveConnection ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></div>
              <div>
                <span className="uppercase font-mono font-extrabold block">{isLiveConnection ? "Live Paystack Integration" : "Demo Sandbox Mode"}</span>
                <span className="font-sans text-slate-500">
                  {isLiveConnection 
                    ? "Direct payouts outbound to real Nigerian bank accounts are live and authorized." 
                    : "Simulated verification in effect. Configure PAYSTACK_SECRET_KEY in credentials panel to execute live bank payouts."}
                </span>
              </div>
            </div>

             <form onSubmit={handleWithdraw} className="space-y-4">
              {/* Select Bank */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Destination Bank Name *</label>
                <select 
                  required
                  value={targetBankCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setTargetBankCode(code);
                    if (code === "CUSTOM") {
                      setUseCustomBank(true);
                    } else {
                      setUseCustomBank(false);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="CUSTOM">-- Specify Other / Custom Bank --</option>
                  {banksList.map((bk) => (
                    <option key={bk.code} value={bk.code}>
                      {bk.name}
                    </option>
                  ))}
                </select>

                {useCustomBank && (
                  <div className="mt-2">
                    <input
                      type="text"
                      required
                      placeholder="Enter custom bank name (e.g. Providus Bank)"
                      value={customBankName}
                      onChange={(e) => setCustomBankName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 font-semibold"
                    />
                  </div>
                )}
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 flex justify-between">
                  <span>NUBAN Account Number *</span>
                  <span className="text-slate-400 lowercase">{targetAccountNumber.length}/10 digits</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  placeholder="Enter 10-digit Nigerian NUBAN code"
                  value={targetAccountNumber}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, "");
                    setTargetAccountNumber(cleaned);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 font-semibold font-mono"
                />
              </div>

              {/* Live Resolving Feedback */}
              {isResolvingAccount && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 text-[10px] font-sans">
                  <span className="w-2.5 h-2.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                  <span>Attempting NIBSS network lookup...</span>
                </div>
              )}

              {resolveAccountError && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-semibold text-rose-800">
                  ⚠️ {resolveAccountError} (Enter name manually below)
                </div>
              )}

              {/* Account Holder Name (Fully Editable) */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 flex justify-between">
                  <span>Account Holder Name *</span>
                  {resolvedAccountName && !isResolvingAccount && (
                    <span className="text-emerald-600 font-bold font-mono text-[9px] uppercase">Matching Account Set</span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your or recipient's verified account name"
                  value={resolvedAccountName}
                  onChange={(e) => setResolvedAccountName(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-[#b3c1d1]/70 rounded-lg p-2.5 text-xs text-slate-950 font-sans focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 font-bold uppercase"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 flex justify-between">
                  <span>Payout Sum *</span>
                  <span className="text-slate-400 lowercase">
                    Max: ₦{(currentUser?.wallet.balanceNgn || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-semibold"
                  />
                  <select
                    value={txCurrency}
                    onChange={(e) => setTxCurrency(e.target.value as any)}
                    className="bg-slate-100 border-0 rounded-lg px-2 text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="NGN">NGN (₦)</option>
                  </select>
                </div>
              </div>

              {/* Narrative */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Official Narrative / Payout Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Field contractor mobilization allowance"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isTransferringFunds || isResolvingAccount || !resolvedAccountName || (useCustomBank && !customBankName)}
                  className={`w-full py-3 text-white font-mono text-[10px] uppercase tracking-wider font-extrabold rounded-xl text-center shadow transition-all ${
                    isTransferringFunds || isResolvingAccount || !resolvedAccountName || (useCustomBank && !customBankName)
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-rose-600 hover:bg-rose-700 active:scale-95 cursor-pointer hover:shadow-md"
                  }`}
                >
                  {isTransferringFunds ? "COORDINATING SECURE SETTLEMENT..." : "DISBURSE FUNDS TO ACCOUNT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. TRANSFER MODAL */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border text-slate-800 border-slate-200 rounded-2xl p-6 shadow-2xl max-w-sm w-full font-sans animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="font-extrabold text-slate-900 text-sm font-sans flex items-center gap-2 m-0">
                <Send className="w-4 h-4 text-[#004ac6]" />
                Initiate Capital Transfer
              </h4>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4">
              
              {/* Type toggle */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Allocation Target Class</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-0.5 rounded-lg text-[10px]">
                  <button
                    type="button"
                    onClick={() => setFundTargetType('PROJECT')}
                    className={`py-1.5 rounded-md font-bold uppercase cursor-pointer ${
                      fundTargetType === 'PROJECT' ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Site Funding
                  </button>
                  <button
                    type="button"
                    onClick={() => setFundTargetType('USER')}
                    className={`py-1.5 rounded-md font-bold uppercase cursor-pointer ${
                      fundTargetType === 'USER' ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Another Wallet
                  </button>
                </div>
              </div>

              {fundTargetType === 'PROJECT' ? (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Select Target Project Route</label>
                  <select
                    value={targetProjectLocation}
                    onChange={(e) => setTargetProjectLocation(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-none"
                  >
                    <option value="">-- Choose Construction Sector --</option>
                    {activeProjects.map(p => (
                      <option key={p.id} value={p.location}>
                        {p.location} ({p.budgetStatus.split(" ")[0]})
                      </option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-400 font-sans mt-1">
                    Direct site injection dynamically offsets steel/cement cost overruns inside core aggregates analytics.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Recipient Representative / Wallet</label>
                  <select
                    value={targetWalletId}
                    onChange={(e) => setTargetWalletId(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-none"
                  >
                    <option value="">-- Choose Wallet Holder --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.wallet.walletId}>
                        {u.fullName} ({u.wallet.walletId.slice(0, 10)}...)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 flex justify-between">
                  <span>Transfer Sum *</span>
                  <span className="text-slate-400 lowercase">Max: ${currentUser?.wallet.balanceUsd.toFixed(2)}</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <select
                    value={txCurrency}
                    onChange={(e) => setTxCurrency(e.target.value as any)}
                    className="bg-slate-100 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Official Allocation Purpose / Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Steel rebar procurement dispatch"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-mono text-[11px] uppercase tracking-wider font-extrabold rounded-lg text-center cursor-pointer shadow"
                >
                  EXECUTE CORPORATE TRANSFER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. INVOICE/RECEIPT PREVIEW POPUP */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-[#fcfbf9] text-slate-900 border border-slate-300 rounded-xl p-6 shadow-2xl max-w-sm w-full font-mono text-xs relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* ATM Thermal tape styling teeth */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500"></div>

            <div className="flex justify-between items-center mb-4 pt-1.5">
              <span className="font-extrabold tracking-tight text-slate-900">BUILDWISE INC.</span>
              <button 
                onClick={() => setShowReceipt(null)}
                className="text-slate-400 hover:text-slate-700 border border-slate-200 rounded px-1.5 py-0.5"
              >
                Close
              </button>
            </div>

            <div className="text-center py-4 border-y border-dashed border-slate-350 space-y-1">
              <span className="text-[10px] text-slate-400 block font-mono">DIGITAL LEDGER DRAFT INVOICE</span>
              <span className="text-lg font-black block text-slate-900">
                {showReceipt.type === 'DEPOSIT' || showReceipt.type === 'TRANSFER_IN' || showReceipt.type === 'SIGNUP_BONUS' ? "+" : "-"}
                ${showReceipt.amountUsd.toFixed(2)} USD
              </span>
              <span className="text-xs text-slate-500 font-bold block leading-none">
                (₦{showReceipt.amountNgn.toLocaleString(undefined, {maximumFractionDigits: 0})} NGN equivalent)
              </span>
            </div>

            <div className="space-y-2.5 py-4 border-b border-dashed border-slate-350 text-[11px]">
              
              <div className="flex justify-between">
                <span className="text-slate-400">Ledger Index:</span>
                <span className="font-bold text-slate-900 select-all">{showReceipt.id}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Draft Date:</span>
                <span className="font-bold text-slate-900">{showReceipt.timestamp}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Log Type:</span>
                <span className="font-bold uppercase text-slate-950">{showReceipt.type.replace("_", " ")}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Account Owner:</span>
                <span className="font-bold text-slate-900">{currentUser?.fullName}</span>
              </div>

              <div className="pt-2 text-slate-400 uppercase text-[9px]">Draft Narrative:</div>
              <p className="bg-slate-120 border border-slate-180 p-2 text-[10px] text-slate-650 rounded-lg mt-0.5 leading-relaxed font-sans">
                {showReceipt.description}
              </p>

              {showReceipt.referenceProject && (
                <div className="flex justify-between pt-1 text-[#004ac6]">
                  <span>Site Corridor:</span>
                  <span className="font-bold text-right">{showReceipt.referenceProject}</span>
                </div>
              )}

              {showReceipt.recipientName && (
                <div className="flex justify-between pt-1 text-slate-700">
                  <span>Transfer Target:</span>
                  <span className="font-bold">{showReceipt.recipientName}</span>
                </div>
              )}

              {showReceipt.senderName && (
                <div className="flex justify-between pt-1 text-emerald-700">
                  <span>Inflow Sender:</span>
                  <span className="font-bold">{showReceipt.senderName}</span>
                </div>
              )}

            </div>

            <div className="pt-4 text-center space-y-2">
              <div className="inline-block text-[#22c55e] border border-[#22c55e]/35 bg-[#22c55e]/5 rounded-md px-3 py-1 font-bold text-[9px] uppercase tracking-widest animate-pulse">
                STATUS: SETTLED & ARCHIVED
              </div>
              <p className="text-[8px] text-slate-400 m-0">BuildWise Digital Clearing House // IMO JOSEPH</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
