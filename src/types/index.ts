
// Customer types
export interface Customer {
  id: string;
  name: string;
  phoneNumber?: string;
  bagsCount: number;
  notes?: string;
  createdAt: Date;
  status: "pending" | "completed";
}

// Invoice types
export type PaymentMethod = "oil" | "cash" | "mixed";

export interface TankType {
  type: "plastic" | "metal";
  count: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  date: Date;
  oilAmount: number; // in kg
  paymentMethod: PaymentMethod;
  tanks: TankType[];
  returnAmount: {
    oil: number; // in kg
    cash: number; // in shekels
  };
  tanksPayment: {
    oil: number; // in kg
    cash: number; // in shekels
  };
  total: {
    oil: number; // in kg
    cash: number; // in shekels
  };
  notes?: string;
}

// Settings types
export interface MillSettings {
  oilReturnPercentage: number; // e.g., 6%
  oilBuyPrice: number; // e.g., 23 shekels/kg
  oilSellPrice: number; // e.g., 25 shekels/kg
  cashReturnPrice: number; // e.g., 1.5 shekels/kg
  tankPrices: {
    plastic: number; // e.g., 10 shekels
    metal: number; // e.g., 15 shekels
  };
}

// Worker types
export type WorkerType = "hourly" | "shift";

export interface Worker {
  id: string;
  name: string;
  phoneNumber?: string;
  type: WorkerType;
  hourlyRate?: number;
  shiftRate?: number;
  notes?: string;
  createdAt: Date;
}

export interface WorkerShift {
  id: string;
  workerId: string;
  date: Date;
  hours?: number;
  shifts?: number;
  amount: number;
  isPaid: boolean;
  notes?: string;
}

export interface WorkerPayment {
  id: string;
  workerId: string;
  date: Date;
  amount: number;
  notes?: string;
}

// Oil Trading types
export type TradeType = "buy" | "sell";

export interface OilTrade {
  id: string;
  type: TradeType;
  amount: number; // in kg
  price: number; // per kg
  total: number; // total price
  personName?: string; // supplier or customer name
  date: Date;
  notes?: string;
}

// Expense types
export interface Expense {
  id: string;
  category: string; // e.g., "maintenance", "food", "transport"
  amount: number;
  date: Date;
  notes?: string;
}

// Dashboard statistics type
export interface MillStatistics {
  totalCustomers: number;
  totalOilProduced: number;
  totalRevenue: number;
  currentCash: number;
  totalExpenses: number;
  currentOilStock: number;
}
