
export interface Customer {
  id: string;
  name: string;
  phoneNumber?: string;
  bagsCount: number;
  notes?: string;
  createdAt: Date;
  status: "pending" | "completed";
  seasonId?: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  date: Date;
  oilAmount: number;
  paymentMethod: "oil" | "cash" | "mixed";
  tanks: TankType[];
  returnAmount: {
    oil: number;
    cash: number;
  };
  tanksPayment: {
    plastic: number;
    metal: number;
  };
  total: {
    oil: number;
    cash: number;
  };
  notes?: string;
  seasonId?: string;
}

export interface TankType {
  type: "plastic" | "metal";
  count: number;
}

export interface MillSettings {
  oilReturnPercentage: number;
  oilBuyPrice: number;
  oilSellPrice: number;
  cashReturnPrice: number;
  tankPrices: {
    plastic: number;
    metal: number;
  };
}

export interface Worker {
  id: string;
  name: string;
  phoneNumber?: string;
  type: "hourly" | "shift";
  hourlyRate?: number;
  shiftRate?: number;
  notes?: string;
  createdAt: Date;
  seasonId?: string;
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
  seasonId?: string;
}

export interface WorkerPayment {
  id: string;
  workerId: string;
  date: Date;
  amount: number;
  notes?: string;
  seasonId?: string;
}

export interface OilTrade {
  id: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  total: number;
  personName?: string;
  date: Date;
  notes?: string;
  seasonId?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: Date;
  notes?: string;
  seasonId?: string;
}

export interface MillStatistics {
  totalCustomers: number;
  totalOilProduced: number;
  totalRevenue: number;
  currentCash: number;
  totalExpenses: number;
  currentOilStock: number;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Season {
  id: string;
  companyId: string;
  name: string;
  year: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  role: "admin" | "normal";
  companyId?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}
