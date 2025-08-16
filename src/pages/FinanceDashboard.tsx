
import { useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import PasswordLock from "@/components/auth/PasswordLock";
import Header from "@/components/layout/Header";
import MobileNavigation from "@/components/layout/MobileNavigation";
import FinancialSummary from "@/components/finance/FinancialSummary";
import UnifiedCharts from "@/components/finance/UnifiedCharts";
import TransactionsList from "@/components/finance/TransactionsList";
import PreviousBalancePrompt from "@/components/finance/PreviousBalancePrompt";
import { useFinanceData } from "@/hooks/useFinanceData";

const FinanceDashboard = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'transactions' | 'charts'>('summary');
  const [valuesVisible, setValuesVisible] = useState(false);
  
  const {
    categories,
    currentMonthData,
    allTransactions,
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

  const handleLock = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('finance-unlocked');
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
          onLock={handleLock}
        />
        
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Desktop Layout */}
          <div className="hidden sm:block space-y-4 sm:space-y-6">
            <FinancialSummary
              monthlyData={currentMonthData}
              valuesVisible={valuesVisible}
              setValuesVisible={setValuesVisible}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column - Transactions List */}
              <TransactionsList
                transactions={currentMonthData.transactions}
                categories={categories}
                onUpdateTransaction={updateTransaction}
                onDeleteTransaction={deleteTransaction}
                previousBalance={previousBalance}
                showBalancePrompt={showBalancePrompt}
                onAcceptBalance={handleAcceptPreviousBalance}
                onRejectBalance={handleRejectPreviousBalance}
                currentDate={currentDate}
                onAddCategory={addCategory}
                onUpdateCategory={updateCategory}
                onDeleteCategory={deleteCategory}
                valuesVisible={valuesVisible}
                setValuesVisible={setValuesVisible}
              />
              
              {/* Right Column - Unified Charts */}
              <UnifiedCharts
                transactions={currentMonthData.transactions}
                categories={categories}
                totalIncome={currentMonthData.totalIncome}
                totalExpense={currentMonthData.totalExpense}
                allTransactions={allTransactions}
                currentDate={currentDate}
                valuesVisible={valuesVisible}
              />
            </div>
          </div>

          {/* Mobile Layout with Tabs */}
          <div className="sm:hidden pb-20">
            {/* Tab Content */}
            {activeTab === 'summary' && (
              <div className="space-y-4">
                <FinancialSummary
                  monthlyData={currentMonthData}
                  valuesVisible={valuesVisible}
                  setValuesVisible={setValuesVisible}
                />
              </div>
            )}
            
            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <TransactionsList
                  transactions={currentMonthData.transactions}
                  categories={categories}
                  onUpdateTransaction={updateTransaction}
                  onDeleteTransaction={deleteTransaction}
                  previousBalance={previousBalance}
                  showBalancePrompt={showBalancePrompt}
                  onAcceptBalance={handleAcceptPreviousBalance}
                  onRejectBalance={handleRejectPreviousBalance}
                  currentDate={currentDate}
                  onAddCategory={addCategory}
                  onUpdateCategory={updateCategory}
                  onDeleteCategory={deleteCategory}
                  valuesVisible={valuesVisible}
                  setValuesVisible={setValuesVisible}
                />
              </div>
            )}
            
            {activeTab === 'charts' && (
              <div className="space-y-4">
                <UnifiedCharts
                  transactions={currentMonthData.transactions}
                  categories={categories}
                  totalIncome={currentMonthData.totalIncome}
                  totalExpense={currentMonthData.totalExpense}
                  allTransactions={allTransactions}
                  currentDate={currentDate}
                  valuesVisible={valuesVisible}
                />
              </div>
            )}
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </ThemeProvider>
  );
};

export default FinanceDashboard;
