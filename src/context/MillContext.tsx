
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Customer, Invoice, MillSettings } from '@/types';

interface MillContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'status'>) => void;
  updateCustomerStatus: (id: string, status: "pending" | "completed") => void;
  removeCustomerFromQueue: (id: string) => void;
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'date'>) => void;
  settings: MillSettings;
  updateSettings: (newSettings: Partial<MillSettings>) => void;
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

  useEffect(() => {
    localStorage.setItem('millCustomers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('millInvoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('millSettings', JSON.stringify(settings));
  }, [settings]);

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

  const value = {
    customers,
    addCustomer,
    updateCustomerStatus,
    removeCustomerFromQueue,
    invoices,
    addInvoice,
    settings,
    updateSettings,
  };

  return <MillContext.Provider value={value}>{children}</MillContext.Provider>;
};
