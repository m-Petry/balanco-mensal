import { useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import PasswordLock from "@/components/auth/PasswordLock";
import Header from "@/components/layout/Header";
import FinancialSummary from "@/components/finance/FinancialSummary";
import FinancialCharts from "@/components/finance/FinancialCharts";
import TransactionsList from "@/components/finance/TransactionsList";
import { useFinanceData } from "@/hooks/useFinanceData";

const FinanceDashboard = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const {
    categories,
    currentMonthData,
    currentDate,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    navigateMonth,
    setSpecificMonth
  } = useFinanceData();

  // Check if already unlocked in session
  useEffect(() => {
    const unlocked = sessionStorage.getItem('finance-unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = () => {
    setIsUnlocked(true);
    sessionStorage.setItem('finance-unlocked', 'true');
  };

  if (!isUnlocked) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen bg-background">
          <PasswordLock onUnlock={handleUnlock} />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background">
        <Header
          currentDate={currentDate}
          categories={categories}
          onNavigateMonth={navigateMonth}
          onSetMonth={setSpecificMonth}
          onAddTransaction={addTransaction}
          onAddCategory={addCategory}
          onUpdateCategory={updateCategory}
          onDeleteCategory={deleteCategory}
        />
        
        <main className="container mx-auto px-4 py-6 space-y-6">
          <FinancialSummary monthlyData={currentMonthData} />
          
          <FinancialCharts 
            transactions={currentMonthData.transactions}
            categories={categories}
            totalIncome={currentMonthData.totalIncome}
            totalExpense={currentMonthData.totalExpense}
          />
          
          <TransactionsList
            transactions={currentMonthData.transactions}
            categories={categories}
            onUpdateTransaction={updateTransaction}
            onDeleteTransaction={deleteTransaction}
          />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default FinanceDashboard;