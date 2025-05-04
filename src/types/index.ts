
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
