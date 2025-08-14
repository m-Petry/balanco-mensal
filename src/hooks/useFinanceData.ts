import { useState, useEffect } from 'react';
import { Transaction, Category, MonthlyData } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';

export const useFinanceData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [previousBalance, setPreviousBalance] = useState<number | null>(null);
  const [showBalancePrompt, setShowBalancePrompt] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  // Load categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('type', { ascending: true });
      
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        const mappedCategories: Category[] = (data || []).map(cat => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
          type: cat.type as 'income' | 'expense'
        }));
        setCategories(mappedCategories);
      }
    };

    fetchCategories();
  }, []);

  // Load transactions for current month and check previous balance
  useEffect(() => {
    const fetchTransactions = async () => {
      const startDate = new Date(currentDate.year, currentDate.month - 1, 1);
      const endDate = new Date(currentDate.year, currentDate.month, 0);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching transactions:', error);
      } else {
        const mappedTransactions: Transaction[] = (data || []).map(t => ({
          id: t.id,
          description: t.description,
          amount: Number(t.amount),
          type: t.type as 'income' | 'expense',
          categoryId: t.category_id,
          date: t.date
        }));
        setTransactions(mappedTransactions);
      }
    };

  const checkPreviousBalance = async () => {
      const now = new Date();
      const currentActualMonth = now.getMonth() + 1;
      const currentActualYear = now.getFullYear();
      
      // Only show for future months (months after current actual month)
      const isCurrentMonthFuture = currentDate.year > currentActualYear || 
        (currentDate.year === currentActualYear && currentDate.month > currentActualMonth);
      
      if (!isCurrentMonthFuture) {
        setShowBalancePrompt(false);
        setPreviousBalance(null);
        return;
      }
      
      // Calculate previous month
      const prevDate = new Date(currentDate.year, currentDate.month - 2, 1);
      const prevYear = prevDate.getFullYear();
      const prevMonth = prevDate.getMonth() + 1;
      
      const prevStartDate = new Date(prevYear, prevMonth - 1, 1);
      const prevEndDate = new Date(prevYear, prevMonth, 0);
      
      // Check if current month has any transactions
      const currentMonthStartDate = new Date(currentDate.year, currentDate.month - 1, 1);
      const currentMonthEndDate = new Date(currentDate.year, currentDate.month, 0);
      
      const { data: currentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', currentMonthStartDate.toISOString().split('T')[0])
        .lte('date', currentMonthEndDate.toISOString().split('T')[0]);
      
      // Only show prompt if current month has no transactions
      if ((currentTransactions || []).length === 0) {
        // Fetch previous month transactions
        const { data: prevTransactions, error: prevError } = await supabase
          .from('transactions')
          .select('*')
          .gte('date', prevStartDate.toISOString().split('T')[0])
          .lte('date', prevEndDate.toISOString().split('T')[0]);
        
        if (!prevError && prevTransactions && prevTransactions.length > 0) {
          const prevIncome = prevTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
          
          const prevExpense = prevTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
          
          const balance = prevIncome - prevExpense;
          
          if (balance !== 0) {
            setPreviousBalance(balance);
            setShowBalancePrompt(true);
          }
        }
      } else {
        setShowBalancePrompt(false);
        setPreviousBalance(null);
      }
    };

    fetchTransactions();
    checkPreviousBalance();
  }, [currentDate]);

  const getCurrentMonthData = (): MonthlyData => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      year: currentDate.year,
      month: currentDate.month,
      transactions,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category_id: transaction.categoryId,
        date: transaction.date
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
    } else if (data) {
      const newTransaction: Transaction = {
        id: data.id,
        description: data.description,
        amount: Number(data.amount),
        type: data.type as 'income' | 'expense',
        categoryId: data.category_id,
        date: data.date
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const updateData: any = {};
    if (updates.description) updateData.description = updates.description;
    if (updates.amount) updateData.amount = updates.amount;
    if (updates.type) updateData.type = updates.type;
    if (updates.categoryId) updateData.category_id = updates.categoryId;
    if (updates.date) updateData.date = updates.date;

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
    } else if (data) {
      const updatedTransaction: Transaction = {
        id: data.id,
        description: data.description,
        amount: Number(data.amount),
        type: data.type as 'income' | 'expense',
        categoryId: data.category_id,
        date: data.date
      };
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
    }
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name: category.name,
        color: category.color,
        type: category.type
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
    } else if (data) {
      const newCategory: Category = {
        id: data.id,
        name: data.name,
        color: data.color,
        type: data.type as 'income' | 'expense'
      };
      setCategories(prev => [...prev, newCategory]);
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
    } else if (data) {
      const updatedCategory: Category = {
        id: data.id,
        name: data.name,
        color: data.color,
        type: data.type as 'income' | 'expense'
      };
      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
    }
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
    } else {
      setCategories(prev => prev.filter(cat => cat.id !== id));
    }
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

  const handleAcceptPreviousBalance = async (transaction: Omit<Transaction, 'id'>) => {
    // Find a general category or use the first available category
    const availableCategory = categories.find(cat => cat.type === transaction.type) || categories[0];
    
    if (!availableCategory) {
      console.error('No category available for transaction');
      return;
    }
    
    const transactionWithValidCategory = {
      ...transaction,
      categoryId: availableCategory.id
    };
    
    await addTransaction(transactionWithValidCategory);
    setShowBalancePrompt(false);
    setPreviousBalance(null);
  };

  const handleRejectPreviousBalance = () => {
    setShowBalancePrompt(false);
    setPreviousBalance(null);
  };

  return {
    categories,
    currentMonthData: getCurrentMonthData(),
    currentDate,
    previousBalance,
    showBalancePrompt,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    navigateMonth,
    setSpecificMonth,
    handleAcceptPreviousBalance,
    handleRejectPreviousBalance
  };
};