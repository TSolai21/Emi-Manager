import React, { createContext, useContext, useEffect, useState } from 'react';

export interface EMI {
  id: string;
  month: string;
  amount: number;
  isPaid: boolean;
  dueDate: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  aadhaarPhoto?: string;
  productName: string;
  totalPrice: number;
  downPayment: number;
  months: number;
  emiAmount: number;
  remainingAmount: number;
  emis: EMI[];
  createdAt: string;
}

interface AppContextType {
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  markAsPaid: (customerId: string, emiId: string) => void;
  totalGiven: number;
  totalPending: number;
  language: 'en' | 'ta';
  setLanguage: (lang: 'en' | 'ta') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('emi_manager_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [language, setLanguage] = useState<'en' | 'ta'>(() => {
    return (localStorage.getItem('emi_manager_lang') as 'en' | 'ta') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('emi_manager_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('emi_manager_lang', language);
  }, [language]);

  const addCustomer = (customer: Customer) => {
    setCustomers((prev) => [...prev, customer]);
  };

  const markAsPaid = (customerId: string, emiId: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updatedEmis = c.emis.map((e) =>
            e.id === emiId ? { ...e, isPaid: true } : e
          );
          const paidAmount = updatedEmis.filter(e => e.isPaid).reduce((sum, e) => sum + e.amount, 0);
          return {
            ...c,
            emis: updatedEmis,
            remainingAmount: Number((c.totalPrice - c.downPayment - paidAmount).toFixed(2)),
          };
        }
        return c;
      })
    );
  };

  const totalGiven = Number(customers.reduce((sum, c) => sum + (c.totalPrice - c.downPayment), 0).toFixed(2));
  const totalCollected = Number(customers.reduce((sum, c) => {
    const paidEmis = c.emis.filter(e => e.isPaid).reduce((s, e) => s + e.amount, 0);
    return sum + paidEmis;
  }, 0).toFixed(2));
  const totalPending = Number((totalGiven - totalCollected).toFixed(2));

  return (
    <AppContext.Provider value={{ customers, addCustomer, markAsPaid, totalGiven, totalCollected, totalPending, language, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
