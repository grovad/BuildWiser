export interface ProjectParams {
  location: string;
  squareFootage: number;
  materialType: 'concrete' | 'steel';
  laborGrade: 'standard' | 'premium';
}

export interface RiskIncident {
  id: string;
  date: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  status: 'Resolved' | 'Investigating' | 'Logged' | 'Processing';
}

export interface MarketMaterial {
  name: string;
  unit: string;
  currentPrice: string;
  numericPrice: number;
  trend: string;
  trendDirection: 'up' | 'down' | 'stable';
  volatility: 'STABLE' | 'MODERATE' | 'CRITICAL';
  weight: number; // For calculations
}

export interface MitigationsPlan {
  id: string;
  category: string;
  text: string;
  approved: boolean;
}

export interface RiskAlert {
  id: string;
  severity: 'CRITICAL' | 'MARKET' | 'RESOLVED';
  time: string;
  title: string;
  description: string;
  actionMessage?: string;
}

export interface ActiveProject {
  id: string;
  location: string;
  budgetStatus: string;
  budgetDelta: number; // positive is overrun, negative is under
  riskLevel: 'HIGH ALERT' | 'MODERATE' | 'STABLE';
  completion: number;
  actualSpend: number; // in NGN
  budgetBaseline: number; // in NGN
}

export interface SystemSettings {
  modelType: string;
  baseCementPrice: number;
  baseLaborRate: number;
  inflationMultiplier: number;
  simulatedIncidents: number;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  phoneNumber: string;
  status: 'ONLINE' | 'ACTIVE_SHIFT' | 'OFFLINE';
  assignedProject?: string;
  efficiencyIndex: number; // 0.5 to 1.5
}

export interface ScheduledShift {
  id: string;
  projectName: string;
  teamLead: string;
  crewCount: number;
  date: string;
  hoursNeeded: number;
  status: 'PENDING' | 'DISPATCHED' | 'CHECKED_IN' | 'COMPLETED';
}

export interface TimesheetEntry {
  id: string;
  date: string;
  workerName: string;
  projectName: string;
  hoursWorked: number;
  hourlyRate: number;
  costImpact: number;
  approved: boolean;
}

export interface SMSMessage {
  id: string;
  recipientName: string;
  phoneNumber: string;
  message: string;
  timestamp: string;
  status: 'DELIVERED' | 'SENDING' | 'FAILED';
  type: 'DISPATCH' | 'WEATHER_ALERT' | 'SYSTEM';
}

export interface WalletTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'SIGNUP_BONUS';
  amountUsd: number;
  amountNgn: number;
  referenceProject?: string;
  recipientName?: string;
  recipientWalletId?: string;
  senderName?: string;
  senderWalletId?: string;
  timestamp: string;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface EngineeringWallet {
  walletId: string;
  balanceUsd: number; // starts at 100
  balanceNgn: number; // converted at a set rate, e.g. 1500 per USD
  transactions: WalletTransaction[];
}

export interface RegisteredUser {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  registeredAt: string;
  wallet: EngineeringWallet;
  role: "executive" | "analyst";
  password?: string;
  phoneNumber?: string;
  verified?: boolean;
}


