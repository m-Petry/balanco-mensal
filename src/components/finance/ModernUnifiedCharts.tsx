import { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, TrendingUp, PieChart as PieChartIcon, Target } from "lucide-react";
import ChartInfoButton from "./ChartInfoButton";
import { formatCurrency } from "@/utils/currency";
import { Transaction, Category } from "@/types/finance";
import { subMonths, format, getDaysInMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnimatedChart, AnimatedChartDataPoint } from "@/components/ui/animated-chart";

interface ModernUnifiedChartsProps {
  transactions: Transaction[];
  categories: Category[];
  totalIncome: number;
  totalExpense: number;
  allTransactions: Transaction[];
  currentDate: Date | { year: number; month: number };
  valuesVisible: boolean;
}

const ModernUnifiedCharts = ({
  transactions,
  categories,
  totalIncome,
  totalExpense,
  allTransactions,
  currentDate,
  valuesVisible
}: ModernUnifiedChartsProps) => {
  // Convert currentDate to Date object if needed
  const dateObj = currentDate instanceof Date ? currentDate : new Date(currentDate.year, currentDate.month - 1);

  // Income vs Expense chart data
  const incomeExpenseData: AnimatedChartDataPoint[] = [
    {
      label: 'Receitas',
      value: totalIncome,
      color: 'hsl(142, 76%, 36%)'
    },
    {
      label: 'Despesas',
      value: totalExpense,
      color: 'hsl(0, 84%, 60%)'
    }
  ];

  // Expense by category data
  const expensesByCategory: AnimatedChartDataPoint[] = categories
    .filter(cat => cat.type === 'expense')
    .map(category => {
      const categoryExpenses = transactions
        .filter(t => t.type === 'expense' && t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        label: category.name,
        value: categoryExpenses,
        color: category.color
      };
    })
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Generate 6-month trend data
  const generateSixMonthTrend = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(dateObj, i);
      const monthKey = format(monthDate, 'yyyy-MM');
      const monthTransactions = allTransactions.filter(t => t.date.startsWith(monthKey));

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = income - expenses;

      months.push({
        label: format(monthDate, 'MMM', { locale: ptBR }),
        value: balance,
        color: balance >= 0 ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)'
      });
    }
    return months;
  };

  // Generate daily spending projection for current month
  const generateDailyProjection = () => {
    const daysInMonth = getDaysInMonth(dateObj);
    const currentDay = new Date().getDate();
    const monthKey = format(dateObj, 'yyyy-MM');
    
    const monthExpenses = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(monthKey))
      .reduce((sum, t) => sum + t.amount, 0);

    const dailyAverage = monthExpenses / currentDay;
    const projectedTotal = dailyAverage * daysInMonth;

    const dailyData = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = `${monthKey}-${day.toString().padStart(2, '0')}`;
      const dayExpenses = transactions
        .filter(t => t.type === 'expense' && t.date === dayKey)
        .reduce((sum, t) => sum + t.amount, 0);

      const projected = dailyAverage * day;

      dailyData.push({
        label: day.toString(),
        value: dayExpenses,
        color: 'hsl(142, 76%, 36%)'
      });
    }

    return dailyData;
  };

  const sixMonthTrendData = generateSixMonthTrend();
  const dailyProjectionData = generateDailyProjection();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Análise Financeira</h2>
            </div>
          </div>
          
          <Tabs defaultValue="income-expense" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="income-expense" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Receitas vs Despesas
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                Por Categoria
              </TabsTrigger>
              <TabsTrigger value="trend" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Tendência 6 Meses
              </TabsTrigger>
              <TabsTrigger value="projection" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Projeção Diária
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="income-expense" className="mt-0">
            <CardContent className="pt-0">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <ChartInfoButton chartType="income-expense" />
                </div>
                <AnimatedChart
                  data={incomeExpenseData}
                  type="bar"
                  variant="glass"
                  size="lg"
                  animated
                  showValues={valuesVisible}
                  title="Receitas vs Despesas"
                  subtitle="Comparação mensal"
                />
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="categories" className="mt-0">
            <CardContent className="pt-0">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <ChartInfoButton chartType="categories" />
                </div>
                <AnimatedChart
                  data={expensesByCategory}
                  type="pie"
                  variant="glass"
                  size="lg"
                  animated
                  showPercentages
                  title="Despesas por Categoria"
                  subtitle="Distribuição percentual"
                />
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="trend" className="mt-0">
            <CardContent className="pt-0">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <ChartInfoButton chartType="trend" />
                </div>
                <AnimatedChart
                  data={sixMonthTrendData}
                  type="line"
                  variant="glass"
                  size="lg"
                  animated
                  showValues={valuesVisible}
                  title="Tendência de 6 Meses"
                  subtitle="Evolução do saldo mensal"
                />
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="projection" className="mt-0">
            <CardContent className="pt-0">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <ChartInfoButton chartType="projection" />
                </div>
                <AnimatedChart
                  data={dailyProjectionData}
                  type="bar"
                  variant="glass"
                  size="lg"
                  animated
                  showValues={valuesVisible}
                  title="Gastos Diários"
                  subtitle="Projeção mensal baseada na média diária"
                />
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ModernUnifiedCharts;
