
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Customer, Invoice, MillSettings, Worker, WorkerShift, WorkerPayment, OilTrade, Expense, MillStatistics, Season, Company, UserProfile } from '@/types';
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
  
  // Multi-tenant properties
  currentSeason: Season | null;
  seasons: Season[];
  companies: Company[];
  userProfile: UserProfile | null;
  allUserProfiles: UserProfile[];
  
  // Season management
  addSeason: (season: Omit<Season, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSeason: (id: string, updates: Partial<Season>) => Promise<void>;
  setActiveSeason: (seasonId: string) => Promise<void>;
  
  // Company management (admin only)
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
  
  // User management (admin only)
  updateUserRole: (userId: string, role: "admin" | "normal") => Promise<void>;
  assignUserToCompany: (userId: string, companyId: string) => Promise<void>;
  
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

  // Multi-tenant state
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allUserProfiles, setAllUserProfiles] = useState<UserProfile[]>([]);

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
        loadUserProfile(),
        loadCompanies(),
        loadSeasons(),
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

  const loadUserProfile = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user!.id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    if (data) {
      const profile: UserProfile = {
        id: data.id,
        role: data.role as "admin" | "normal",
        companyId: data.company_id,
        firstName: data.first_name,
        lastName: data.last_name,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
      setUserProfile(profile);
      
      // Load all user profiles if admin
      if (profile.role === 'admin') {
        await loadAllUserProfiles();
      }
    }
  };

  const loadAllUserProfiles = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const profiles = data.map(profile => ({
      id: profile.id,
      role: profile.role as "admin" | "normal",
      companyId: profile.company_id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at),
    }));
    
    setAllUserProfiles(profiles);
  };

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const mappedCompanies = data.map(company => ({
      id: company.id,
      name: company.name,
      description: company.description,
      createdAt: new Date(company.created_at),
      updatedAt: new Date(company.updated_at),
    }));
    
    setCompanies(mappedCompanies);
  };

  const loadSeasons = async () => {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const mappedSeasons = data.map(season => ({
      id: season.id,
      companyId: season.company_id,
      name: season.name,
      year: season.year,
      isActive: season.is_active,
      createdAt: new Date(season.created_at),
      updatedAt: new Date(season.updated_at),
    }));
    
    setSeasons(mappedSeasons);
    
    // Set current season to the active one for user's company
    const activeSeason = mappedSeasons.find(s => s.isActive && 
      (userProfile?.role === 'admin' || s.companyId === userProfile?.companyId));
    if (activeSeason) {
      setCurrentSeason(activeSeason);
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
      seasonId: customer.season_id,
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
      tanks: typeof invoice.tanks === 'string' ? JSON.parse(invoice.tanks) : invoice.tanks,
      returnAmount: typeof invoice.return_amount === 'string' ? JSON.parse(invoice.return_amount) : invoice.return_amount,
      tanksPayment: typeof invoice.tanks_payment === 'string' ? JSON.parse(invoice.tanks_payment) : invoice.tanks_payment,
      total: typeof invoice.total === 'string' ? JSON.parse(invoice.total) : invoice.total,
      notes: invoice.notes,
      seasonId: invoice.season_id,
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
      seasonId: worker.season_id,
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
      seasonId: shift.season_id,
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
      seasonId: payment.season_id,
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
      seasonId: trade.season_id,
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
      seasonId: expense.season_id,
    }));
    
    setExpenses(mappedExpenses);
  };

  // Filter data by current season
  const getSeasonFilteredData = <T extends { seasonId?: string }>(data: T[]): T[] => {
    if (!currentSeason) return data;
    return data.filter(item => item.seasonId === currentSeason.id);
  };

  // Customer functions
  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'status'>) => {
    if (!user || !currentSeason) return;
    
    const { data, error } = await supabase
      .from('customers')
      .insert({
        user_id: user.id,
        season_id: currentSeason.id,
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
      seasonId: data.season_id,
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

  // Worker functions
  const addWorker = async (worker: Omit<Worker, 'id' | 'createdAt'>) => {
    if (!user || !currentSeason) return;
    
    const { data, error } = await supabase
      .from('workers')
      .insert({
        user_id: user.id,
        season_id: currentSeason.id,
        name: worker.name,
        phone_number: worker.phoneNumber,
        type: worker.type,
        hourly_rate: worker.hourlyRate,
        shift_rate: worker.shiftRate,
        notes: worker.notes,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding worker:', error);
      toast({
        title: "خطأ في إضافة العامل",
        description: "حدث خطأ أثناء إضافة العامل",
        variant: "destructive",
      });
      throw error;
    }
    
    const newWorker: Worker = {
      id: data.id,
      name: data.name,
      phoneNumber: data.phone_number,
      type: data.type as "hourly" | "shift",
      hourlyRate: data.hourly_rate ? parseFloat(data.hourly_rate.toString()) : undefined,
      shiftRate: data.shift_rate ? parseFloat(data.shift_rate.toString()) : undefined,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      seasonId: data.season_id,
    };
    
    setWorkers(prev => [newWorker, ...prev]);
    
    toast({
      title: "تم إضافة العامل بنجاح",
      description: `تم إضافة العامل ${newWorker.name} بنجاح`,
    });
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
    
    if (error) {
      console.error('Error updating worker:', error);
      toast({
        title: "خطأ في تحديث العامل",
        description: "حدث خطأ أثناء تحديث بيانات العامل",
        variant: "destructive",
      });
      throw error;
    }
    
    const updatedWorker: Worker = {
      id: data.id,
      name: data.name,
      phoneNumber: data.phone_number,
      type: data.type as "hourly" | "shift",
      hourlyRate: data.hourly_rate ? parseFloat(data.hourly_rate.toString()) : undefined,
      shiftRate: data.shift_rate ? parseFloat(data.shift_rate.toString()) : undefined,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      seasonId: data.season_id,
    };
    
    setWorkers(prev => 
      prev.map(worker => 
        worker.id === id ? updatedWorker : worker
      )
    );
    
    toast({
      title: "تم تحديث العامل بنجاح",
      description: `تم تحديث بيانات العامل ${updatedWorker.name} بنجاح`,
    });
    
    return updatedWorker;
  };

  const removeWorker = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error removing worker:', error);
      toast({
        title: "خطأ في حذف العامل",
        description: "حدث خطأ أثناء حذف العامل",
        variant: "destructive",
      });
      throw error;
    }
    
    setWorkers(prev => prev.filter(worker => worker.id !== id));
    
    toast({
      title: "تم حذف العامل بنجاح",
      description: "تم حذف العامل من النظام",
    });
  };

  // Worker shift functions
  const addWorkerShift = async (shift: Omit<WorkerShift, 'id'>) => {
    if (!user || !currentSeason) return;
    
    const { data, error } = await supabase
      .from('worker_shifts')
      .insert({
        user_id: user.id,
        season_id: currentSeason.id,
        worker_id: shift.workerId,
        date: shift.date.toISOString(),
        hours: shift.hours,
        shifts: shift.shifts,
        amount: shift.amount,
        is_paid: shift.isPaid,
        notes: shift.notes,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding worker shift:', error);
      toast({
        title: "خطأ في تسجيل الشفت",
        description: "حدث خطأ أثناء تسجيل جلسة العمل",
        variant: "destructive",
      });
      throw error;
    }
    
    const newShift: WorkerShift = {
      id: data.id,
      workerId: data.worker_id,
      date: new Date(data.date),
      hours: data.hours ? parseFloat(data.hours.toString()) : undefined,
      shifts: data.shifts,
      amount: parseFloat(data.amount.toString()),
      isPaid: data.is_paid,
      notes: data.notes,
      seasonId: data.season_id,
    };
    
    setWorkerShifts(prev => [newShift, ...prev]);
    
    toast({
      title: "تم تسجيل الشفت بنجاح",
      description: "تم تسجيل جلسة العمل بنجاح",
    });
  };

  const updateWorkerShift = async (id: string, updates: Partial<WorkerShift>) => {
    if (!user) return {} as WorkerShift;
    
    const { data, error } = await supabase
      .from('worker_shifts')
      .update({
        worker_id: updates.workerId,
        date: updates.date?.toISOString(),
        hours: updates.hours,
        shifts: updates.shifts,
        amount: updates.amount,
        is_paid: updates.isPaid,
        notes: updates.notes,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating worker shift:', error);
      throw error;
    }
    
    const updatedShift: WorkerShift = {
      id: data.id,
      workerId: data.worker_id,
      date: new Date(data.date),
      hours: data.hours ? parseFloat(data.hours.toString()) : undefined,
      shifts: data.shifts,
      amount: parseFloat(data.amount.toString()),
      isPaid: data.is_paid,
      notes: data.notes,
      seasonId: data.season_id,
    };
    
    setWorkerShifts(prev => 
      prev.map(shift => 
        shift.id === id ? updatedShift : shift
      )
    );
    
    return updatedShift;
  };

  const removeWorkerShift = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('worker_shifts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error removing worker shift:', error);
      throw error;
    }
    
    setWorkerShifts(prev => prev.filter(shift => shift.id !== id));
  };

  // Worker payment functions
  const addWorkerPayment = async (payment: Omit<WorkerPayment, 'id'>) => {
    if (!user || !currentSeason) return;
    
    const { data, error } = await supabase
      .from('worker_payments')
      .insert({
        user_id: user.id,
        season_id: currentSeason.id,
        worker_id: payment.workerId,
        date: payment.date.toISOString(),
        amount: payment.amount,
        notes: payment.notes,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding worker payment:', error);
      toast({
        title: "خطأ في تسجيل الدفعة",
        description: "حدث خطأ أثناء تسجيل دفعة العامل",
        variant: "destructive",
      });
      throw error;
    }
    
    const newPayment: WorkerPayment = {
      id: data.id,
      workerId: data.worker_id,
      date: new Date(data.date),
      amount: parseFloat(data.amount.toString()),
      notes: data.notes,
      seasonId: data.season_id,
    };
    
    setWorkerPayments(prev => [newPayment, ...prev]);
    
    toast({
      title: "تم تسجيل الدفعة بنجاح",
      description: "تم تسجيل دفعة العامل بنجاح",
    });
  };

  const removeWorkerPayment = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('worker_payments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error removing worker payment:', error);
      throw error;
    }
    
    setWorkerPayments(prev => prev.filter(payment => payment.id !== id));
  };

  // Oil trade functions
  const addOilTrade = async (trade: Omit<OilTrade, 'id' | 'date' | 'total'>) => {
    if (!user || !currentSeason) return;
    
    const total = trade.amount * trade.price;
    
    const { data, error } = await supabase
      .from('oil_trades')
      .insert({
        user_id: user.id,
        season_id: currentSeason.id,
        type: trade.type,
        amount: trade.amount,
        price: trade.price,
        total: total,
        person_name: trade.personName,
        notes: trade.notes,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding oil trade:', error);
      throw error;
    }
    
    const newTrade: OilTrade = {
      id: data.id,
      type: data.type as "buy" | "sell",
      amount: parseFloat(data.amount.toString()),
      price: parseFloat(data.price.toString()),
      total: parseFloat(data.total.toString()),
      personName: data.person_name,
      date: new Date(data.date),
      notes: data.notes,
      seasonId: data.season_id,
    };
    
    setOilTrades(prev => [newTrade, ...prev]);
  };

  const removeOilTrade = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('oil_trades')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    setOilTrades(prev => prev.filter(trade => trade.id !== id));
  };

  // Expense functions
  const addExpense = async (expense: Omit<Expense, 'id' | 'date'>) => {
    if (!user || !currentSeason) return;
    
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        season_id: currentSeason.id,
        category: expense.category,
        amount: expense.amount,
        notes: expense.notes,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    const newExpense: Expense = {
      id: data.id,
      category: data.category,
      amount: parseFloat(data.amount.toString()),
      date: new Date(data.date),
      notes: data.notes,
      seasonId: data.season_id,
    };
    
    setExpenses(prev => [newExpense, ...prev]);
  };

  const removeExpense = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  // Invoice functions
  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'date'>) => {
    if (!user || !currentSeason) return;
    
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        customer_id: invoice.customerId,
        customer_name: invoice.customerName,
        customer_phone: invoice.customerPhone,
        season_id: currentSeason.id,
        oil_amount: invoice.oilAmount,
        payment_method: invoice.paymentMethod,
        tanks: JSON.stringify(invoice.tanks),
        return_amount: JSON.stringify(invoice.returnAmount),
        tanks_payment: JSON.stringify(invoice.tanksPayment),
        total: JSON.stringify(invoice.total),
        notes: invoice.notes,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    const newInvoice: Invoice = {
      id: data.id,
      customerId: data.customer_id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      date: new Date(data.date),
      oilAmount: parseFloat(data.oil_amount.toString()),
      paymentMethod: data.payment_method as "oil" | "cash" | "mixed",
      tanks: typeof data.tanks === 'string' ? JSON.parse(data.tanks) : data.tanks,
      returnAmount: typeof data.return_amount === 'string' ? JSON.parse(data.return_amount) : data.return_amount,
      tanksPayment: typeof data.tanks_payment === 'string' ? JSON.parse(data.tanks_payment) : data.tanks_payment,
      total: typeof data.total === 'string' ? JSON.parse(data.total) : data.total,
      notes: data.notes,
      seasonId: data.season_id,
    };
    
    setInvoices(prev => [newInvoice, ...prev]);
  };

  // Season functions
  const addSeason = async (season: Omit<Season, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('seasons')
      .insert({
        company_id: season.companyId,
        name: season.name,
        year: season.year,
        is_active: season.isActive,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    const newSeason: Season = {
      id: data.id,
      companyId: data.company_id,
      name: data.name,
      year: data.year,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
    
    setSeasons(prev => [newSeason, ...prev]);
    
    if (newSeason.isActive) {
      setCurrentSeason(newSeason);
    }
  };

  const updateSeason = async (id: string, updates: Partial<Season>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('seasons')
      .update({
        name: updates.name,
        year: updates.year,
        is_active: updates.isActive,
      })
      .eq('id', id);
    
    if (error) throw error;
    
    setSeasons(prev => prev.map(season => 
      season.id === id ? { ...season, ...updates, updatedAt: new Date() } : season
    ));
    
    if (updates.isActive && currentSeason?.id !== id) {
      const updatedSeason = seasons.find(s => s.id === id);
      if (updatedSeason) {
        setCurrentSeason({ ...updatedSeason, ...updates });
      }
    }
  };

  const setActiveSeason = async (seasonId: string) => {
    if (!user) return;
    
    // Deactivate all seasons first
    const { error: deactivateError } = await supabase
      .from('seasons')
      .update({ is_active: false })
      .neq('id', seasonId);
    
    if (deactivateError) throw deactivateError;
    
    // Activate the selected season
    const { error: activateError } = await supabase
      .from('seasons')
      .update({ is_active: true })
      .eq('id', seasonId);
    
    if (activateError) throw activateError;
    
    setSeasons(prev => prev.map(season => ({
      ...season,
      isActive: season.id === seasonId,
      updatedAt: new Date()
    })));
    
    const activeSeason = seasons.find(s => s.id === seasonId);
    if (activeSeason) {
      setCurrentSeason({ ...activeSeason, isActive: true });
    }
  };

  // Company functions
  const addCompany = async (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: company.name,
        description: company.description,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    const newCompany: Company = {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
    
    setCompanies(prev => [newCompany, ...prev]);
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('companies')
      .update({
        name: updates.name,
        description: updates.description,
      })
      .eq('id', id);
    
    if (error) throw error;
    
    setCompanies(prev => prev.map(company => 
      company.id === id ? { ...company, ...updates, updatedAt: new Date() } : company
    ));
  };

  // User management functions
  const updateUserRole = async (userId: string, role: "admin" | "normal") => {
    if (!user) return;
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('id', userId);
    
    if (error) throw error;
    
    setAllUserProfiles(prev => prev.map(profile => 
      profile.id === userId ? { ...profile, role, updatedAt: new Date() } : profile
    ));
  };

  const assignUserToCompany = async (userId: string, companyId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ company_id: companyId })
      .eq('id', userId);
    
    if (error) throw error;
    
    setAllUserProfiles(prev => prev.map(profile => 
      profile.id === userId ? { ...profile, companyId, updatedAt: new Date() } : profile
    ));
  };

  // Migration functions
  const migrateLocalData = async () => {
    // Implementation for migrating local data
    console.log('Migrating local data...');
  };

  const exportLocalData = () => {
    return JSON.stringify({
      customers,
      invoices,
      settings,
      workers,
      workerShifts,
      workerPayments,
      oilTrades,
      expenses,
      seasons,
      companies,
      userProfile,
    });
  };

  const importLocalData = async (data: string) => {
    console.log('Importing data:', data);
  };

  const getStatistics = (): MillStatistics => {
    const seasonCustomers = getSeasonFilteredData(customers);
    const seasonInvoices = getSeasonFilteredData(invoices);
    const seasonOilTrades = getSeasonFilteredData(oilTrades);
    const seasonExpenses = getSeasonFilteredData(expenses);
    const seasonWorkerPayments = getSeasonFilteredData(workerPayments);
    
    const totalOilProduced = seasonInvoices.reduce((sum, invoice) => sum + invoice.oilAmount, 0);
    const totalCashRevenue = seasonInvoices.reduce((sum, invoice) => sum + invoice.total.cash, 0);
    
    const oilTraded = seasonOilTrades.reduce((sum, trade) => {
      return trade.type === 'buy' 
        ? sum + trade.amount 
        : sum - trade.amount;
    }, 0);
    
    const oilReturnedToCustomers = seasonInvoices.reduce((sum, invoice) => sum + invoice.total.oil, 0);
    const currentOilStock = totalOilProduced + oilTraded - oilReturnedToCustomers;
    
    const cashFromTrades = seasonOilTrades.reduce((sum, trade) => {
      return trade.type === 'sell' 
        ? sum + trade.total 
        : sum - trade.total;
    }, 0);
    
    const totalExpensesAmount = seasonExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const workerPaymentsTotal = seasonWorkerPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    const currentCash = totalCashRevenue + cashFromTrades - totalExpensesAmount - workerPaymentsTotal;
    
    return {
      totalCustomers: seasonCustomers.length,
      totalOilProduced,
      totalRevenue: totalCashRevenue + cashFromTrades,
      currentCash,
      totalExpenses: totalExpensesAmount + workerPaymentsTotal,
      currentOilStock,
    };
  };

  const value = {
    // Filtered data by current season
    customers: getSeasonFilteredData(customers),
    addCustomer,
    updateCustomerStatus,
    removeCustomerFromQueue,
    invoices: getSeasonFilteredData(invoices),
    addInvoice,
    settings,
    updateSettings,
    workers: getSeasonFilteredData(workers),
    addWorker,
    updateWorker,
    removeWorker,
    workerShifts: getSeasonFilteredData(workerShifts),
    addWorkerShift,
    updateWorkerShift,
    removeWorkerShift,
    workerPayments: getSeasonFilteredData(workerPayments),
    addWorkerPayment,
    removeWorkerPayment,
    oilTrades: getSeasonFilteredData(oilTrades),
    addOilTrade,
    removeOilTrade,
    expenses: getSeasonFilteredData(expenses),
    addExpense,
    removeExpense,
    getStatistics,
    isLoading,
    
    // Multi-tenant data
    currentSeason,
    seasons,
    companies,
    userProfile,
    allUserProfiles,
    
    // Multi-tenant functions
    addSeason,
    updateSeason,
    setActiveSeason,
    addCompany,
    updateCompany,
    updateUserRole,
    assignUserToCompany,
    migrateLocalData,
    exportLocalData,
    importLocalData,
  };

  return <SupabaseMillContext.Provider value={value}>{children}</SupabaseMillContext.Provider>;
};

// Re-export for compatibility
export const useMillContext = useSupabaseMillContext;
