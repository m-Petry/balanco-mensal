import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { MonthlyData } from "@/types/finance";

interface FinancialSummaryProps {
  monthlyData: MonthlyData;
}

const FinancialSummary = ({ monthlyData }: FinancialSummaryProps) => {
  const { totalIncome, totalExpense, balance } = monthlyData;
  
  const spentPercentage = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
  const savingsPercentage = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Income */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          <TrendingUp className="h-4 w-4 text-income" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-income">
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
          <div className="text-2xl font-bold text-expense">
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
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-balance-positive' : 'text-balance-negative'}`}>
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
  );
};

export default FinancialSummary;