import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Customer, Invoice, MillSettings, Worker, WorkerShift, WorkerPayment, OilTrade, Expense, MillStatistics, Season, Company, UserProfile } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface MillContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'status'>) => void;
  updateCustomerStatus: (id: string, status: "pending" | "completed") => void;
  removeCustomerFromQueue: (id: string) => void;
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'date'>) => void;
  
  settings: MillSettings;
  updateSettings: (newSettings: Partial<MillSettings>) => void;
  
  workers: Worker[];
  addWorker: (worker: Omit<Worker, 'id' | 'createdAt'>) => void;
  updateWorker: (id: string, updates: Partial<Worker>) => Worker;
  removeWorker: (id: string) => void;
  
  workerShifts: WorkerShift[];
  addWorkerShift: (shift: Omit<WorkerShift, 'id'>) => void;
  updateWorkerShift: (id: string, updates: Partial<WorkerShift>) => WorkerShift;
  removeWorkerShift: (id: string) => void;
  
  workerPayments: WorkerPayment[];
  addWorkerPayment: (payment: Omit<WorkerPayment, 'id'>) => void;
  removeWorkerPayment: (id: string) => void;
  
  oilTrades: OilTrade[];
  addOilTrade: (trade: Omit<OilTrade, 'id' | 'date' | 'total'>) => void;
  removeOilTrade: (id: string) => void;
  
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  removeExpense: (id: string) => void;
  
  getStatistics: () => MillStatistics;
  
  // New properties for multi-tenant support
  currentSeason: Season | null;
  seasons: Season[];
  companies: Company[];
  userProfile: UserProfile | null;
  
  // Season management
  addSeason: (season: Omit<Season, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSeason: (id: string, updates: Partial<Season>) => void;
  setActiveSeason: (seasonId: string) => void;
  
  // Company management (admin only)
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  
  // User management (admin only)
  allUserProfiles: UserProfile[];
  updateUserRole: (userId: string, role: "admin" | "normal") => void;
  assignUserToCompany: (userId: string, companyId: string) => void;
}

const defaultSettings: MillSettings = {
  oilReturnPercentage: 6, // 6%
  oilBuyPrice: 23, // 23 shekels/kg
  oilSellPrice: 25, // 25 shekels/kg
  cashReturnPrice: 1.5, // 1.5 shekels/kg
  tankPrices: {
    plastic: 10, // 10 shekels
    metal: 15, // 15 shekels
  },
};

const MillContext = createContext<MillContextType | undefined>(undefined);

export const useMillContext = () => {
  const context = useContext(MillContext);
  if (!context) {
    throw new Error('useMillContext must be used within a MillProvider');
  }
  return context;
};

export const MillProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Basic state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<MillSettings>(defaultSettings);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workerShifts, setWorkerShifts] = useState<WorkerShift[]>([]);
  const [workerPayments, setWorkerPayments] = useState<WorkerPayment[]>([]);
  const [oilTrades, setOilTrades] = useState<OilTrade[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // Multi-tenant state
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allUserProfiles, setAllUserProfiles] = useState<UserProfile[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    loadDataFromStorage();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    saveDataToStorage();
  }, [customers, invoices, settings, workers, workerShifts, workerPayments, oilTrades, expenses, seasons, companies, userProfile]);

  const loadDataFromStorage = () => {
    try {
      const storedCustomers = localStorage.getItem('millCustomers');
      const storedInvoices = localStorage.getItem('millInvoices');
      const storedSettings = localStorage.getItem('millSettings');
      const storedWorkers = localStorage.getItem('millWorkers');
      const storedWorkerShifts = localStorage.getItem('millWorkerShifts');
      const storedWorkerPayments = localStorage.getItem('millWorkerPayments');
      const storedOilTrades = localStorage.getItem('millOilTrades');
      const storedExpenses = localStorage.getItem('millExpenses');
      const storedSeasons = localStorage.getItem('millSeasons');
      const storedCompanies = localStorage.getItem('millCompanies');
      const storedUserProfile = localStorage.getItem('millUserProfile');

      if (storedCustomers) {
        const parsedCustomers = JSON.parse(storedCustomers);
        setCustomers(parsedCustomers.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt)
        })));
      }

      if (storedInvoices) {
        const parsedInvoices = JSON.parse(storedInvoices);
        setInvoices(parsedInvoices.map((i: any) => ({
          ...i,
          date: new Date(i.date)
        })));
      }

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }

      if (storedWorkers) {
        const parsedWorkers = JSON.parse(storedWorkers);
        setWorkers(parsedWorkers.map((w: any) => ({
          ...w,
          createdAt: new Date(w.createdAt)
        })));
      }

      if (storedWorkerShifts) {
        const parsedShifts = JSON.parse(storedWorkerShifts);
        setWorkerShifts(parsedShifts.map((s: any) => ({
          ...s,
          date: new Date(s.date)
        })));
      }

      if (storedWorkerPayments) {
        const parsedPayments = JSON.parse(storedWorkerPayments);
        setWorkerPayments(parsedPayments.map((p: any) => ({
          ...p,
          date: new Date(p.date)
        })));
      }

      if (storedOilTrades) {
        const parsedTrades = JSON.parse(storedOilTrades);
        setOilTrades(parsedTrades.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        })));
      }

      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses);
        setExpenses(parsedExpenses.map((e: any) => ({
          ...e,
          date: new Date(e.date)
        })));
      }

      if (storedSeasons) {
        const parsedSeasons = JSON.parse(storedSeasons);
        const seasonsWithDates = parsedSeasons.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt)
        }));
        setSeasons(seasonsWithDates);
        
        // Set current season to the active one
        const activeSeason = seasonsWithDates.find((s: Season) => s.isActive);
        if (activeSeason) {
          setCurrentSeason(activeSeason);
        }
      }

      if (storedCompanies) {
        const parsedCompanies = JSON.parse(storedCompanies);
        setCompanies(parsedCompanies.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt)
        })));
      }

      if (storedUserProfile) {
        const parsedProfile = JSON.parse(storedUserProfile);
        setUserProfile({
          ...parsedProfile,
          createdAt: new Date(parsedProfile.createdAt),
          updatedAt: new Date(parsedProfile.updatedAt)
        });
      }
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  };

  const saveDataToStorage = () => {
    try {
      localStorage.setItem('millCustomers', JSON.stringify(customers));
      localStorage.setItem('millInvoices', JSON.stringify(invoices));
      localStorage.setItem('millSettings', JSON.stringify(settings));
      localStorage.setItem('millWorkers', JSON.stringify(workers));
      localStorage.setItem('millWorkerShifts', JSON.stringify(workerShifts));
      localStorage.setItem('millWorkerPayments', JSON.stringify(workerPayments));
      localStorage.setItem('millOilTrades', JSON.stringify(oilTrades));
      localStorage.setItem('millExpenses', JSON.stringify(expenses));
      localStorage.setItem('millSeasons', JSON.stringify(seasons));
      localStorage.setItem('millCompanies', JSON.stringify(companies));
      localStorage.setItem('millUserProfile', JSON.stringify(userProfile));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  };

  // Filter data by current season
  const getSeasonFilteredData = <T extends { seasonId?: string }>(data: T[]): T[] => {
    if (!currentSeason) return data;
    return data.filter(item => item.seasonId === currentSeason.id);
  };

  // Customer functions
  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt' | 'status'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      status: 'pending',
      seasonId: currentSeason?.id,
    };
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const updateCustomerStatus = (id: string, status: "pending" | "completed") => {
    setCustomers(prev => 
      prev.map(customer => 
        customer.id === id ? { ...customer, status } : customer
      )
    );
  };

  const removeCustomerFromQueue = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  // Invoice functions
  const addInvoice = (invoice: Omit<Invoice, 'id' | 'date'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(),
      seasonId: currentSeason?.id,
    };
    setInvoices(prev => [newInvoice, ...prev]);
  };

  // Settings functions
  const updateSettings = (newSettings: Partial<MillSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Worker functions
  const addWorker = (worker: Omit<Worker, 'id' | 'createdAt'>) => {
    const newWorker: Worker = {
      ...worker,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      seasonId: currentSeason?.id,
    };
    setWorkers(prev => [newWorker, ...prev]);
  };

  const updateWorker = (id: string, updates: Partial<Worker>) => {
    const updatedWorker = workers.find(w => w.id === id);
    if (!updatedWorker) return {} as Worker;
    
    const newWorker = { ...updatedWorker, ...updates };
    setWorkers(prev => prev.map(worker => worker.id === id ? newWorker : worker));
    return newWorker;
  };

  const removeWorker = (id: string) => {
    setWorkers(prev => prev.filter(worker => worker.id !== id));
    // Also remove related shifts and payments
    setWorkerShifts(prev => prev.filter(shift => shift.workerId !== id));
    setWorkerPayments(prev => prev.filter(payment => payment.workerId !== id));
  };

  // Worker shift functions
  const addWorkerShift = (shift: Omit<WorkerShift, 'id'>) => {
    const newShift: WorkerShift = {
      ...shift,
      id: Math.random().toString(36).substr(2, 9),
      seasonId: currentSeason?.id,
    };
    setWorkerShifts(prev => [newShift, ...prev]);
  };

  const updateWorkerShift = (id: string, updates: Partial<WorkerShift>) => {
    const updatedShift = workerShifts.find(s => s.id === id);
    if (!updatedShift) return {} as WorkerShift;
    
    const newShift = { ...updatedShift, ...updates };
    setWorkerShifts(prev => prev.map(shift => shift.id === id ? newShift : shift));
    return newShift;
  };

  const removeWorkerShift = (id: string) => {
    setWorkerShifts(prev => prev.filter(shift => shift.id !== id));
  };

  // Worker payment functions
  const addWorkerPayment = (payment: Omit<WorkerPayment, 'id'>) => {
    const newPayment: WorkerPayment = {
      ...payment,
      id: Math.random().toString(36).substr(2, 9),
      seasonId: currentSeason?.id,
    };
    setWorkerPayments(prev => [newPayment, ...prev]);
  };

  const removeWorkerPayment = (id: string) => {
    setWorkerPayments(prev => prev.filter(payment => payment.id !== id));
  };

  // Oil trade functions
  const addOilTrade = (trade: Omit<OilTrade, 'id' | 'date' | 'total'>) => {
    const newTrade: OilTrade = {
      ...trade,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(),
      total: trade.amount * trade.price,
      seasonId: currentSeason?.id,
    };
    setOilTrades(prev => [newTrade, ...prev]);
  };

  const removeOilTrade = (id: string) => {
    setOilTrades(prev => prev.filter(trade => trade.id !== id));
  };

  // Expense functions
  const addExpense = (expense: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(),
      seasonId: currentSeason?.id,
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  // Season functions
  const addSeason = (season: Omit<Season, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSeason: Season = {
      ...season,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // If this is the first season or marked as active, make it current
    if (seasons.length === 0 || season.isActive) {
      // Deactivate other seasons
      setSeasons(prev => prev.map(s => ({ ...s, isActive: false })));
      setCurrentSeason(newSeason);
    }
    
    setSeasons(prev => [newSeason, ...prev]);
  };

  const updateSeason = (id: string, updates: Partial<Season>) => {
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

  const setActiveSeason = (seasonId: string) => {
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
  const addCompany = (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCompany: Company = {
      ...company,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCompanies(prev => [newCompany, ...prev]);
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies(prev => prev.map(company => 
      company.id === id ? { ...company, ...updates, updatedAt: new Date() } : company
    ));
  };

  // User management functions
  const updateUserRole = (userId: string, role: "admin" | "normal") => {
    setAllUserProfiles(prev => prev.map(profile => 
      profile.id === userId ? { ...profile, role, updatedAt: new Date() } : profile
    ));
  };

  const assignUserToCompany = (userId: string, companyId: string) => {
    setAllUserProfiles(prev => prev.map(profile => 
      profile.id === userId ? { ...profile, companyId, updatedAt: new Date() } : profile
    ));
  };

  // Statistics
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
    invoices: getSeasonFilteredData(invoices),
    workers: getSeasonFilteredData(workers),
    workerShifts: getSeasonFilteredData(workerShifts),
    workerPayments: getSeasonFilteredData(workerPayments),
    oilTrades: getSeasonFilteredData(oilTrades),
    expenses: getSeasonFilteredData(expenses),
    
    // Functions
    addCustomer,
    updateCustomerStatus,
    removeCustomerFromQueue,
    addInvoice,
    settings,
    updateSettings,
    addWorker,
    updateWorker,
    removeWorker,
    addWorkerShift,
    updateWorkerShift,
    removeWorkerShift,
    addWorkerPayment,
    removeWorkerPayment,
    addOilTrade,
    removeOilTrade,
    addExpense,
    removeExpense,
    getStatistics,
    
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
  };

  return <MillContext.Provider value={value}>{children}</MillContext.Provider>;
};
