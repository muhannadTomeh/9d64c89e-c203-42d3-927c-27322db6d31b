import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Customer, Invoice, MillSettings, Worker, WorkerShift, WorkerPayment, OilTrade, Expense, MillStatistics } from '@/types';

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
  // Existing state
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const savedCustomers = localStorage.getItem('millCustomers');
    return savedCustomers 
      ? JSON.parse(savedCustomers).map((customer: any) => ({
          ...customer,
          createdAt: new Date(customer.createdAt)
        }))
      : [];
  });
  
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const savedInvoices = localStorage.getItem('millInvoices');
    return savedInvoices 
      ? JSON.parse(savedInvoices).map((invoice: any) => ({
          ...invoice,
          date: new Date(invoice.date)
        }))
      : [];
  });
  
  const [settings, setSettings] = useState<MillSettings>(() => {
    const savedSettings = localStorage.getItem('millSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // New state
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const savedWorkers = localStorage.getItem('millWorkers');
    return savedWorkers 
      ? JSON.parse(savedWorkers).map((worker: any) => ({
          ...worker,
          createdAt: new Date(worker.createdAt)
        }))
      : [];
  });
  
  const [workerShifts, setWorkerShifts] = useState<WorkerShift[]>(() => {
    const savedShifts = localStorage.getItem('millWorkerShifts');
    return savedShifts 
      ? JSON.parse(savedShifts).map((shift: any) => ({
          ...shift,
          date: new Date(shift.date)
        }))
      : [];
  });
  
  const [workerPayments, setWorkerPayments] = useState<WorkerPayment[]>(() => {
    const savedPayments = localStorage.getItem('millWorkerPayments');
    return savedPayments 
      ? JSON.parse(savedPayments).map((payment: any) => ({
          ...payment,
          date: new Date(payment.date)
        }))
      : [];
  });
  
  const [oilTrades, setOilTrades] = useState<OilTrade[]>(() => {
    const savedTrades = localStorage.getItem('millOilTrades');
    return savedTrades 
      ? JSON.parse(savedTrades).map((trade: any) => ({
          ...trade,
          date: new Date(trade.date)
        }))
      : [];
  });
  
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const savedExpenses = localStorage.getItem('millExpenses');
    return savedExpenses 
      ? JSON.parse(savedExpenses).map((expense: any) => ({
          ...expense,
          date: new Date(expense.date)
        }))
      : [];
  });

  // Existing useEffect hooks
  useEffect(() => {
    localStorage.setItem('millCustomers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('millInvoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('millSettings', JSON.stringify(settings));
  }, [settings]);

  // New useEffect hooks
  useEffect(() => {
    localStorage.setItem('millWorkers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('millWorkerShifts', JSON.stringify(workerShifts));
  }, [workerShifts]);

  useEffect(() => {
    localStorage.setItem('millWorkerPayments', JSON.stringify(workerPayments));
  }, [workerPayments]);

  useEffect(() => {
    localStorage.setItem('millOilTrades', JSON.stringify(oilTrades));
  }, [oilTrades]);

  useEffect(() => {
    localStorage.setItem('millExpenses', JSON.stringify(expenses));
  }, [expenses]);

  // Existing functions
  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt' | 'status'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: `customer-${Date.now()}`,
      createdAt: new Date(),
      status: "pending",
    };
    setCustomers(prev => [...prev, newCustomer]);
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

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'date'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: `invoice-${Date.now()}`,
      date: new Date(),
    };
    setInvoices(prev => [...prev, newInvoice]);
  };

  const updateSettings = (newSettings: Partial<MillSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // New functions
  const addWorker = (worker: Omit<Worker, 'id' | 'createdAt'>) => {
    const newWorker: Worker = {
      ...worker,
      id: `worker-${Date.now()}`,
      createdAt: new Date(),
    };
    setWorkers(prev => [...prev, newWorker]);
  };

  const updateWorker = (id: string, updates: Partial<Worker>) => {
    let updatedWorker: Worker | undefined;
    
    setWorkers(prev => 
      prev.map(worker => {
        if (worker.id === id) {
          updatedWorker = { ...worker, ...updates };
          return updatedWorker;
        }
        return worker;
      })
    );
    
    return updatedWorker!;
  };

  const removeWorker = (id: string) => {
    setWorkers(prev => prev.filter(worker => worker.id !== id));
  };

  const addWorkerShift = (shift: Omit<WorkerShift, 'id'>) => {
    const newShift: WorkerShift = {
      ...shift,
      id: `shift-${Date.now()}`,
    };
    setWorkerShifts(prev => [...prev, newShift]);
  };

  const updateWorkerShift = (id: string, updates: Partial<WorkerShift>) => {
    let updatedShift: WorkerShift | undefined;
    
    setWorkerShifts(prev => 
      prev.map(shift => {
        if (shift.id === id) {
          updatedShift = { ...shift, ...updates };
          return updatedShift;
        }
        return shift;
      })
    );
    
    return updatedShift!;
  };

  const removeWorkerShift = (id: string) => {
    setWorkerShifts(prev => prev.filter(shift => shift.id !== id));
  };

  const addWorkerPayment = (payment: Omit<WorkerPayment, 'id'>) => {
    const newPayment: WorkerPayment = {
      ...payment,
      id: `payment-${Date.now()}`,
    };
    setWorkerPayments(prev => [...prev, newPayment]);
  };

  const removeWorkerPayment = (id: string) => {
    setWorkerPayments(prev => prev.filter(payment => payment.id !== id));
  };

  const addOilTrade = (trade: Omit<OilTrade, 'id' | 'date' | 'total'>) => {
    const total = trade.amount * trade.price;
    
    const newTrade: OilTrade = {
      ...trade,
      id: `trade-${Date.now()}`,
      date: new Date(),
      total,
    };
    setOilTrades(prev => [...prev, newTrade]);
  };

  const removeOilTrade = (id: string) => {
    setOilTrades(prev => prev.filter(trade => trade.id !== id));
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `expense-${Date.now()}`,
      date: new Date(),
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  // Statistics calculation
  const getStatistics = (): MillStatistics => {
    // Calculate total oil produced
    const totalOilProduced = invoices.reduce((sum, invoice) => sum + invoice.oilAmount, 0);
    
    // Calculate total cash revenue
    const totalCashRevenue = invoices.reduce((sum, invoice) => sum + invoice.total.cash, 0);
    
    // Calculate oil stock based on trades
    const oilTraded = oilTrades.reduce((sum, trade) => {
      return trade.type === 'buy' 
        ? sum + trade.amount 
        : sum - trade.amount;
    }, 0);
    
    // Calculate current oil stock (produced + purchased - sold - returned to customers)
    const oilReturnedToCustomers = invoices.reduce((sum, invoice) => sum + invoice.total.oil, 0);
    const currentOilStock = totalOilProduced + oilTraded - oilReturnedToCustomers;
    
    // Calculate cash balance
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
    // Existing values
    customers,
    addCustomer,
    updateCustomerStatus,
    removeCustomerFromQueue,
    invoices,
    addInvoice,
    settings,
    updateSettings,
    
    // New values
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
  };

  return <MillContext.Provider value={value}>{children}</MillContext.Provider>;
};
