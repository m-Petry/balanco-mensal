import { useState, useEffect } from 'react';
import { Transaction, Category, MonthlyData, defaultCategories } from '@/types/finance';

export const useFinanceData = () => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('finance-categories');
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  const [monthlyData, setMonthlyData] = useState<{ [key: string]: MonthlyData }>(() => {
    const saved = localStorage.getItem('finance-monthly-data');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  useEffect(() => {
    localStorage.setItem('finance-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('finance-monthly-data', JSON.stringify(monthlyData));
  }, [monthlyData]);

  const getCurrentMonthKey = () => `${currentDate.year}-${currentDate.month}`;

  const getCurrentMonthData = (): MonthlyData => {
    const key = getCurrentMonthKey();
    if (!monthlyData[key]) {
      return {
        year: currentDate.year,
        month: currentDate.month,
        transactions: [],
        totalIncome: 0,
        totalExpense: 0,
        balance: 0
      };
    }
    return monthlyData[key];
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const key = getCurrentMonthKey();
    const id = Date.now().toString();
    const newTransaction = { ...transaction, id };
    
    const currentData = getCurrentMonthData();
    const updatedTransactions = [...currentData.transactions, newTransaction];
    
    const totalIncome = updatedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = updatedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const updatedData: MonthlyData = {
      ...currentData,
      transactions: updatedTransactions,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
    
    setMonthlyData(prev => ({ ...prev, [key]: updatedData }));
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const key = getCurrentMonthKey();
    const currentData = getCurrentMonthData();
    
    const updatedTransactions = currentData.transactions.map(t =>
      t.id === id ? { ...t, ...updates } : t
    );
    
    const totalIncome = updatedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = updatedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const updatedData: MonthlyData = {
      ...currentData,
      transactions: updatedTransactions,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
    
    setMonthlyData(prev => ({ ...prev, [key]: updatedData }));
  };

  const deleteTransaction = (id: string) => {
    const key = getCurrentMonthKey();
    const currentData = getCurrentMonthData();
    
    const updatedTransactions = currentData.transactions.filter(t => t.id !== id);
    
    const totalIncome = updatedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = updatedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const updatedData: MonthlyData = {
      ...currentData,
      transactions: updatedTransactions,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
    
    setMonthlyData(prev => ({ ...prev, [key]: updatedData }));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const id = Date.now().toString();
    setCategories(prev => [...prev, { ...category, id }]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev.year, prev.month - 1);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return { year: newDate.getFullYear(), month: newDate.getMonth() + 1 };
    });
  };

  const setSpecificMonth = (year: number, month: number) => {
    setCurrentDate({ year, month });
  };

  return {
    categories,
    currentMonthData: getCurrentMonthData(),
    currentDate,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    navigateMonth,
    setSpecificMonth
  };
};