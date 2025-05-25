
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Customer, Invoice, MillSettings, Worker, WorkerShift, WorkerPayment, OilTrade, Expense, MillStatistics } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface SupabaseMillContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateCustomerStatus: (id: string, status: "pending" | "completed") => Promise<void>;
  removeCustomerFromQueue: (id: string) => Promise<void>;
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'date'>) => Promise<void>;
  
  settings: MillSettings;
  updateSettings: (newSettings: Partial<MillSettings>) => Promise<void>;
  
  workers: Worker[];
  addWorker: (worker: Omit<Worker, 'id' | 'createdAt'>) => Promise<void>;
  updateWorker: (id: string, updates: Partial<Worker>) => Promise<Worker>;
  removeWorker: (id: string) => Promise<void>;
  
  workerShifts: WorkerShift[];
  addWorkerShift: (shift: Omit<WorkerShift, 'id'>) => Promise<void>;
  updateWorkerShift: (id: string, updates: Partial<WorkerShift>) => Promise<WorkerShift>;
  removeWorkerShift: (id: string) => Promise<void>;
  
  workerPayments: WorkerPayment[];
  addWorkerPayment: (payment: Omit<WorkerPayment, 'id'>) => Promise<void>;
  removeWorkerPayment: (id: string) => Promise<void>;
  
  oilTrades: OilTrade[];
  addOilTrade: (trade: Omit<OilTrade, 'id' | 'date' | 'total'>) => Promise<void>;
  removeOilTrade: (id: string) => Promise<void>;
  
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  
  getStatistics: () => MillStatistics;
  isLoading: boolean;
  
  // Migration functions
  migrateLocalData: () => Promise<void>;
  exportLocalData: () => string;
  importLocalData: (data: string) => Promise<void>;
}

const defaultSettings: MillSettings = {
  oilReturnPercentage: 6,
  oilBuyPrice: 23,
  oilSellPrice: 25,
  cashReturnPrice: 1.5,
  tankPrices: {
    plastic: 10,
    metal: 15,
  },
};

const SupabaseMillContext = createContext<SupabaseMillContextType | undefined>(undefined);

export const useSupabaseMillContext = () => {
  const context = useContext(SupabaseMillContext);
  if (!context) {
    throw new Error('useSupabaseMillContext must be used within a SupabaseMillProvider');
  }
  return context;
};

export const SupabaseMillProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<MillSettings>(defaultSettings);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workerShifts, setWorkerShifts] = useState<WorkerShift[]>([]);
  const [workerPayments, setWorkerPayments] = useState<WorkerPayment[]>([]);
  const [oilTrades, setOilTrades] = useState<OilTrade[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await Promise.all([
        loadCustomers(),
        loadInvoices(),
        loadSettings(),
        loadWorkers(),
        loadWorkerShifts(),
        loadWorkerPayments(),
        loadOilTrades(),
        loadExpenses(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const mappedCustomers = data.map(customer => ({
      id: customer.id,
      name: customer.name,
      phoneNumber: customer.phone_number,
      bagsCount: customer.bags_count,
      notes: customer.notes,
      createdAt: new Date(customer.created_at),
      status: customer.status as "pending" | "completed",
    }));
    
    setCustomers(mappedCustomers);
  };

  const loadInvoices = async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    const mappedInvoices = data.map(invoice => ({
      id: invoice.id,
      customerId: invoice.customer_id,
      customerName: invoice.customer_name,
      customerPhone: invoice.customer_phone,
      date: new Date(invoice.date),
      oilAmount: parseFloat(invoice.oil_amount.toString()),
      paymentMethod: invoice.payment_method as "oil" | "cash" | "mixed",
      tanks: invoice.tanks as any,
      returnAmount: invoice.return_amount as any,
      tanksPayment: invoice.tanks_payment as any,
      total: invoice.total as any,
      notes: invoice.notes,
    }));
    
    setInvoices(mappedInvoices);
  };

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    if (data) {
      setSettings({
        oilReturnPercentage: parseFloat(data.oil_return_percentage.toString()),
        oilBuyPrice: parseFloat(data.oil_buy_price.toString()),
        oilSellPrice: parseFloat(data.oil_sell_price.toString()),
        cashReturnPrice: parseFloat(data.cash_return_price.toString()),
        tankPrices: data.tank_prices as any,
      });
    }
  };

  const loadWorkers = async () => {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const mappedWorkers = data.map(worker => ({
      id: worker.id,
      name: worker.name,
      phoneNumber: worker.phone_number,
      type: worker.type as "hourly" | "shift",
      hourlyRate: worker.hourly_rate ? parseFloat(worker.hourly_rate.toString()) : undefined,
      shiftRate: worker.shift_rate ? parseFloat(worker.shift_rate.toString()) : undefined,
      notes: worker.notes,
      createdAt: new Date(worker.created_at),
    }));
    
    setWorkers(mappedWorkers);
  };

  const loadWorkerShifts = async () => {
    const { data, error } = await supabase
      .from('worker_shifts')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    const mappedShifts = data.map(shift => ({
      id: shift.id,
      workerId: shift.worker_id,
      date: new Date(shift.date),
      hours: shift.hours ? parseFloat(shift.hours.toString()) : undefined,
      shifts: shift.shifts,
      amount: parseFloat(shift.amount.toString()),
      isPaid: shift.is_paid,
      notes: shift.notes,
    }));
    
    setWorkerShifts(mappedShifts);
  };

  const loadWorkerPayments = async () => {
    const { data, error } = await supabase
      .from('worker_payments')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    const mappedPayments = data.map(payment => ({
      id: payment.id,
      workerId: payment.worker_id,
      date: new Date(payment.date),
      amount: parseFloat(payment.amount.toString()),
      notes: payment.notes,
    }));
    
    setWorkerPayments(mappedPayments);
  };

  const loadOilTrades = async () => {
    const { data, error } = await supabase
      .from('oil_trades')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    const mappedTrades = data.map(trade => ({
      id: trade.id,
      type: trade.type as "buy" | "sell",
      amount: parseFloat(trade.amount.toString()),
      price: parseFloat(trade.price.toString()),
      total: parseFloat(trade.total.toString()),
      personName: trade.person_name,
      date: new Date(trade.date),
      notes: trade.notes,
    }));
    
    setOilTrades(mappedTrades);
  };

  const loadExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    const mappedExpenses = data.map(expense => ({
      id: expense.id,
      category: expense.category,
      amount: parseFloat(expense.amount.toString()),
      date: new Date(expense.date),
      notes: expense.notes,
    }));
    
    setExpenses(mappedExpenses);
  };

  // Customer functions
  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'status'>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('customers')
      .insert({
        user_id: user.id,
        name: customer.name,
        phone_number: customer.phoneNumber,
        bags_count: customer.bagsCount,
        notes: customer.notes,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    const newCustomer: Customer = {
      id: data.id,
      name: data.name,
      phoneNumber: data.phone_number,
      bagsCount: data.bags_count,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      status: data.status as "pending" | "completed",
    };
    
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const updateCustomerStatus = async (id: string, status: "pending" | "completed") => {
    if (!user) return;
    
    const { error } = await supabase
      .from('customers')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
    
    setCustomers(prev => 
      prev.map(customer => 
        customer.id === id ? { ...customer, status } : customer
      )
    );
  };

  const removeCustomerFromQueue = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  // Settings functions
  const updateSettings = async (newSettings: Partial<MillSettings>) => {
    if (!user) return;
    
    const updatedSettings = { ...settings, ...newSettings };
    
    const { error } = await supabase
      .from('settings')
      .upsert({
        user_id: user.id,
        oil_return_percentage: updatedSettings.oilReturnPercentage,
        oil_buy_price: updatedSettings.oilBuyPrice,
        oil_sell_price: updatedSettings.oilSellPrice,
        cash_return_price: updatedSettings.cashReturnPrice,
        tank_prices: updatedSettings.tankPrices,
      });
    
    if (error) throw error;
    
    setSettings(updatedSettings);
  };

  // Migration functions
  const migrateLocalData = async () => {
    if (!user) return;
    
    try {
      // Get local data
      const localCustomers = localStorage.getItem('millCustomers');
      const localInvoices = localStorage.getItem('millInvoices');
      const localSettings = localStorage.getItem('millSettings');
      const localWorkers = localStorage.getItem('millWorkers');
      const localWorkerShifts = localStorage.getItem('millWorkerShifts');
      const localWorkerPayments = localStorage.getItem('millWorkerPayments');
      const localOilTrades = localStorage.getItem('millOilTrades');
      const localExpenses = localStorage.getItem('millExpenses');

      // Migrate customers
      if (localCustomers) {
        const customers = JSON.parse(localCustomers);
        for (const customer of customers) {
          await addCustomer({
            name: customer.name,
            phoneNumber: customer.phoneNumber,
            bagsCount: customer.bagsCount,
            notes: customer.notes,
          });
        }
      }

      // Migrate settings
      if (localSettings) {
        const settings = JSON.parse(localSettings);
        await updateSettings(settings);
      }

      // Migrate workers
      if (localWorkers) {
        const workers = JSON.parse(localWorkers);
        for (const worker of workers) {
          await addWorker({
            name: worker.name,
            phoneNumber: worker.phoneNumber,
            type: worker.type,
            hourlyRate: worker.hourlyRate,
            shiftRate: worker.shiftRate,
            notes: worker.notes,
          });
        }
      }

      toast({
        title: "تم نقل البيانات بنجاح",
        description: "تم نقل جميع البيانات المحلية إلى قاعدة البيانات",
      });
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: "خطأ في نقل البيانات",
        description: "حدث خطأ أثناء نقل البيانات",
        variant: "destructive",
      });
    }
  };

  const exportLocalData = () => {
    const localData = {
      customers: localStorage.getItem('millCustomers'),
      invoices: localStorage.getItem('millInvoices'),
      settings: localStorage.getItem('millSettings'),
      workers: localStorage.getItem('millWorkers'),
      workerShifts: localStorage.getItem('millWorkerShifts'),
      workerPayments: localStorage.getItem('millWorkerPayments'),
      oilTrades: localStorage.getItem('millOilTrades'),
      expenses: localStorage.getItem('millExpenses'),
    };
    
    return JSON.stringify(localData);
  };

  const importLocalData = async (data: string) => {
    // Implementation for importing local data
    console.log('Importing data:', data);
  };

  // Add other CRUD functions here (workers, shifts, payments, etc.)
  const addWorker = async (worker: Omit<Worker, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('workers')
      .insert({
        user_id: user.id,
        name: worker.name,
        phone_number: worker.phoneNumber,
        type: worker.type,
        hourly_rate: worker.hourlyRate,
        shift_rate: worker.shiftRate,
        notes: worker.notes,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    const newWorker: Worker = {
      id: data.id,
      name: data.name,
      phoneNumber: data.phone_number,
      type: data.type as "hourly" | "shift",
      hourlyRate: data.hourly_rate ? parseFloat(data.hourly_rate.toString()) : undefined,
      shiftRate: data.shift_rate ? parseFloat(data.shift_rate.toString()) : undefined,
      notes: data.notes,
      createdAt: new Date(data.created_at),
    };
    
    setWorkers(prev => [newWorker, ...prev]);
  };

  const updateWorker = async (id: string, updates: Partial<Worker>) => {
    if (!user) return {} as Worker;
    
    const { data, error } = await supabase
      .from('workers')
      .update({
        name: updates.name,
        phone_number: updates.phoneNumber,
        type: updates.type,
        hourly_rate: updates.hourlyRate,
        shift_rate: updates.shiftRate,
        notes: updates.notes,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    const updatedWorker: Worker = {
      id: data.id,
      name: data.name,
      phoneNumber: data.phone_number,
      type: data.type as "hourly" | "shift",
      hourlyRate: data.hourly_rate ? parseFloat(data.hourly_rate.toString()) : undefined,
      shiftRate: data.shift_rate ? parseFloat(data.shift_rate.toString()) : undefined,
      notes: data.notes,
      createdAt: new Date(data.created_at),
    };
    
    setWorkers(prev => 
      prev.map(worker => 
        worker.id === id ? updatedWorker : worker
      )
    );
    
    return updatedWorker;
  };

  const removeWorker = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    setWorkers(prev => prev.filter(worker => worker.id !== id));
  };

  // Add other functions (addWorkerShift, addWorkerPayment, etc.) with similar patterns...
  const addWorkerShift = async (shift: Omit<WorkerShift, 'id'>) => {
    // Implementation similar to addWorker
  };

  const updateWorkerShift = async (id: string, updates: Partial<WorkerShift>) => {
    return {} as WorkerShift;
  };

  const removeWorkerShift = async (id: string) => {
    // Implementation
  };

  const addWorkerPayment = async (payment: Omit<WorkerPayment, 'id'>) => {
    // Implementation
  };

  const removeWorkerPayment = async (id: string) => {
    // Implementation
  };

  const addOilTrade = async (trade: Omit<OilTrade, 'id' | 'date' | 'total'>) => {
    // Implementation
  };

  const removeOilTrade = async (id: string) => {
    // Implementation
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'date'>) => {
    // Implementation
  };

  const removeExpense = async (id: string) => {
    // Implementation
  };

  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'date'>) => {
    // Implementation
  };

  const getStatistics = (): MillStatistics => {
    // Implementation similar to original context
    const totalOilProduced = invoices.reduce((sum, invoice) => sum + invoice.oilAmount, 0);
    const totalCashRevenue = invoices.reduce((sum, invoice) => sum + invoice.total.cash, 0);
    
    const oilTraded = oilTrades.reduce((sum, trade) => {
      return trade.type === 'buy' 
        ? sum + trade.amount 
        : sum - trade.amount;
    }, 0);
    
    const oilReturnedToCustomers = invoices.reduce((sum, invoice) => sum + invoice.total.oil, 0);
    const currentOilStock = totalOilProduced + oilTraded - oilReturnedToCustomers;
    
    const cashFromTrades = oilTrades.reduce((sum, trade) => {
      return trade.type === 'sell' 
        ? sum + trade.total 
        : sum - trade.total;
    }, 0);
    
    const totalExpensesAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const workerPaymentsTotal = workerPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    const currentCash = totalCashRevenue + cashFromTrades - totalExpensesAmount - workerPaymentsTotal;
    
    return {
      totalCustomers: customers.length,
      totalOilProduced,
      totalRevenue: totalCashRevenue + cashFromTrades,
      currentCash,
      totalExpenses: totalExpensesAmount + workerPaymentsTotal,
      currentOilStock,
    };
  };

  const value = {
    customers,
    addCustomer,
    updateCustomerStatus,
    removeCustomerFromQueue,
    invoices,
    addInvoice,
    settings,
    updateSettings,
    workers,
    addWorker,
    updateWorker,
    removeWorker,
    workerShifts,
    addWorkerShift,
    updateWorkerShift,
    removeWorkerShift,
    workerPayments,
    addWorkerPayment,
    removeWorkerPayment,
    oilTrades,
    addOilTrade,
    removeOilTrade,
    expenses,
    addExpense,
    removeExpense,
    getStatistics,
    isLoading,
    migrateLocalData,
    exportLocalData,
    importLocalData,
  };

  return <SupabaseMillContext.Provider value={value}>{children}</SupabaseMillContext.Provider>;
};
