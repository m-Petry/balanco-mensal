import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Balance Card - New Design */}
      <Card className="lg:col-span-1 bg-gradient-to-b from-card to-background p-4 rounded-2xl shadow-lg transform md:hover:scale-105 transition-transform duration-300 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-bold text-foreground">Saldo</CardTitle>
          <Wallet className={`h-5 w-5 ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`} />
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold text-foreground transition-all duration-300 ${!valuesVisible ? 'blur-md select-none' : ''}`}>
            {formatCurrency(balance)}
          </p>
          <p className={`${balance >= 0 ? 'text-green-400' : 'text-red-400'} text-xs`}>
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
  );
};

export default FinancialSummary;