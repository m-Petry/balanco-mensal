import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, TrendingUp, PieChart as PieChartIcon, Target } from "lucide-react";
import ChartInfoButton from "./ChartInfoButton";
import { formatCurrency } from "@/utils/currency";
import { Transaction, Category } from "@/types/finance";
import { subMonths, format, getDaysInMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  ReferenceLine,
  Tooltip,
} from "recharts";

interface UnifiedChartsProps {
  transactions: Transaction[];
  categories: Category[];
  totalIncome: number;
  totalExpense: number;
  allTransactions: Transaction[];
  currentDate: Date | { year: number; month: number };
}

const UnifiedCharts = ({ 
  transactions, 
  categories, 
  totalIncome, 
  totalExpense,
  allTransactions,
  currentDate
}: UnifiedChartsProps) => {
  // Convert currentDate to Date object if needed
  const dateObj = currentDate instanceof Date ? currentDate : new Date(currentDate.year, currentDate.month - 1);

  // Income vs Expense chart data
  const incomeExpenseData = [
    {
      name: 'Receitas',
      value: totalIncome,
      fill: 'hsl(142, 76%, 36%)'
    },
    {
      name: 'Despesas',
      value: totalExpense,
      fill: 'hsl(0, 84%, 60%)'
    }
  ];

  // Expense by category data
  const expensesByCategory = categories
    .filter(cat => cat.type === 'expense')
    .map(category => {
      const categoryExpenses = transactions
        .filter(t => t.type === 'expense' && t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        name: category.name,
        value: categoryExpenses,
        fill: category.color
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
        month: format(monthDate, 'MMM', { locale: ptBR }),
        receitas: income,
        despesas: expenses,
        saldo: balance,
      });
    }
    return months;
  };

  // Generate daily spending projection for current month
  const generateDailyProjection = () => {
    const daysInMonth = getDaysInMonth(dateObj);
    const currentDay = new Date().getDate();
    const monthKey = format(dateObj, 'yyyy-MM');
    
    const monthTransactions = allTransactions.filter(t => t.date.startsWith(monthKey));
    const totalExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const dailyAverage = currentDay > 0 ? totalExpenses / currentDay : 0;
    const projectedTotal = dailyAverage * daysInMonth;
    
    const dailyData = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTransactions = monthTransactions.filter(t => {
        const transactionDay = new Date(t.date).getDate();
        return transactionDay === day && t.type === 'expense';
      });
      
      const dayExpenses = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      dailyData.push({
        day,
        actual: day <= currentDay ? dayExpenses : null,
        projected: day > currentDay ? dailyAverage : null,
      });
    }
    
    return { dailyData, dailyAverage, projectedTotal };
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const sixMonthData = generateSixMonthTrend();
  const { dailyData, dailyAverage, projectedTotal } = generateDailyProjection();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Card 1: Receitas vs Despesas e Distribuição de Despesas */}
      <Card>
        <Tabs defaultValue="income-expense" className="w-full">
          <CardHeader className="pb-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="income-expense" className="flex items-center gap-2 text-xs">
                <BarChart className="w-3 h-3" />
                Receitas vs Despesas
              </TabsTrigger>
              <TabsTrigger value="distribution" className="flex items-center gap-2 text-xs">
                <PieChartIcon className="w-3 h-3" />
                Distribuição
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="income-expense" className="mt-0">
            <CardContent className="pt-0">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <ChartInfoButton chartType="income-expense" />
                </div>
                <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={incomeExpenseData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      width={35}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), '']}
                      labelFormatter={(label) => label}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="distribution" className="mt-0">
            <CardContent className="pt-0">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <ChartInfoButton chartType="distribution" />
                </div>
                {expensesByCategory.length === 0 ? (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  Nenhuma despesa encontrada
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          cornerRadius={4}
                          dataKey="value"
                          labelLine={false}
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.fill}
                              stroke="hsl(var(--background))"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [formatCurrency(value), '']}
                          labelFormatter={(label) => label}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-xs">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-medium">{formatCurrency(totalExpense)}</span>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="grid grid-cols-1 gap-1 max-h-20 overflow-y-auto">
                    {expensesByCategory.slice(0, 5).map((category, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category.fill }}
                          />
                          <span className="truncate">{category.name}</span>
                        </div>
                        <div className="flex gap-2 text-muted-foreground">
                          <span>{formatCurrency(category.value)}</span>
                          <span>({formatPercentage(category.value, totalExpense)})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )}
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Card 2: Projeção Diária e Tendência 6 Meses */}
      <Card>
        <Tabs defaultValue="projection" className="w-full">
          <CardHeader className="pb-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="projection" className="flex items-center gap-2 text-xs">
                <Target className="w-3 h-3" />
                Projeção Diária
              </TabsTrigger>
              <TabsTrigger value="trend" className="flex items-center gap-2 text-xs">
                <TrendingUp className="w-3 h-3" />
                Tendência 6 Meses
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="projection" className="mt-0">
            <CardContent className="pt-0">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <ChartInfoButton chartType="projection" />
                </div>
                <div className="text-sm text-muted-foreground mb-4 space-y-1">
                <p>Média diária: {formatCurrency(dailyAverage)}</p>
                <p>Projeção mês: {formatCurrency(projectedTotal)}</p>
              </div>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickFormatter={(value) => `${value.toFixed(0)}`}
                      width={35}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [formatCurrency(Number(value)), name]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    />
                    
                    <ReferenceLine 
                      y={dailyAverage} 
                      stroke="hsl(217, 91%, 60%)" 
                      strokeDasharray="5 5"
                      strokeWidth={1}
                    />
                    
                    <Line
                      name="Gastos Reais"
                      type="monotone"
                      dataKey="actual"
                      stroke="hsl(142, 76%, 36%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(142, 76%, 36%)", r: 3 }}
                      connectNulls={false}
                    />
                    <Line
                      name="Projeção"
                      type="monotone"
                      dataKey="projected"
                      stroke="hsl(45, 93%, 47%)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "hsl(45, 93%, 47%)", r: 3 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="trend" className="mt-0">
            <CardContent className="pt-0">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <ChartInfoButton chartType="trend" />
                </div>
                <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sixMonthData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickMargin={5}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      width={35}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [formatCurrency(value), name]}
                      labelFormatter={(label) => label}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    />
                    
                    <Area
                      name="Receitas"
                      type="monotone"
                      dataKey="receitas"
                      stroke="hsl(142, 76%, 36%)"
                      fill="hsl(142, 76%, 36%)"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Area
                      name="Despesas"
                      type="monotone"
                      dataKey="despesas"
                      stroke="hsl(0, 84%, 60%)"
                      fill="hsl(0, 84%, 60%)"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Area
                      name="Saldo"
                      type="monotone"
                      dataKey="saldo"
                      stroke="hsl(217, 91%, 60%)"
                      fill="hsl(217, 91%, 60%)"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default UnifiedCharts;