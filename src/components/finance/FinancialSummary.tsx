import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Eye, EyeOff } from "lucide-react";
import { MonthlyData } from "@/types/finance";
import { formatCurrency } from "@/utils/currency";

interface FinancialSummaryProps {
  monthlyData: MonthlyData;
}

const FinancialSummary = ({ monthlyData }: FinancialSummaryProps) => {
  const { totalIncome, totalExpense, balance } = monthlyData;
  const [valuesVisible, setValuesVisible] = useState(false);
  
  const spentPercentage = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
  const savingsPercentage = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  // Auto-hide values after 5 minutes
  useEffect(() => {
    if (valuesVisible) {
      const timer = setTimeout(() => {
        setValuesVisible(false);
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearTimeout(timer);
    }
  }, [valuesVisible]);

  const toggleValuesVisibility = () => {
    setValuesVisible(!valuesVisible);
  };


  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleValuesVisibility}
          className="gap-2"
        >
          {valuesVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {valuesVisible ? 'Ocultar valores' : 'Mostrar valores'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Income */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-income" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-income transition-all duration-300 ${!valuesVisible ? 'blur-md select-none' : ''}`}>
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas do mês
            </p>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-expense" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-expense transition-all duration-300 ${!valuesVisible ? 'blur-md select-none' : ''}`}>
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">
              Despesas do mês
            </p>
          </CardContent>
        </Card>

        {/* Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className={`h-4 w-4 ${balance >= 0 ? 'text-balance-positive' : 'text-balance-negative'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-balance-positive' : 'text-balance-negative'} transition-all duration-300 ${!valuesVisible ? 'blur-md select-none' : ''}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
            </p>
          </CardContent>
        </Card>

        {/* Spending Percentage */}
        <Card className="bg-accent/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">% da Renda Total Mensal</CardTitle>
            <div className="text-accent font-bold text-lg">
              {spentPercentage.toFixed(0)}%
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {spentPercentage > 100 ? 'Gastou mais que ganhou' : 'Do total de receitas'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialSummary;