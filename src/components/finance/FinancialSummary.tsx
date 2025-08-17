import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { MonthlyData } from "@/types/finance";
import { formatCurrency } from "@/utils/currency";

interface FinancialSummaryProps {
  monthlyData: MonthlyData;
  valuesVisible: boolean;
}

const FinancialSummary = ({ monthlyData, valuesVisible }: FinancialSummaryProps) => {
  const { totalIncome, totalExpense, balance } = monthlyData;
  
  const spentPercentage = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

        {/* Spending Percentage */}
        <Card className="bg-accent/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">% da Renda Mensal Gasta</CardTitle>
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