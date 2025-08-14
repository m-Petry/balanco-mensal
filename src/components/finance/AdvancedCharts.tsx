import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Calendar, Target } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { Transaction, Category } from "@/types/finance";
import { addMonths, subMonths, format, getDaysInMonth, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface AdvancedChartsProps {
  transactions: Transaction[];
  categories: Category[];
  currentDate: Date | { year: number; month: number };
}

const AdvancedCharts = ({ transactions, categories, currentDate }: AdvancedChartsProps) => {
  // Convert currentDate to Date object if needed
  const dateObj = currentDate instanceof Date ? currentDate : new Date(currentDate.year, currentDate.month - 1);
  
  // Generate 6-month trend data
  const generateSixMonthTrend = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(dateObj, i);
      const monthKey = format(monthDate, 'yyyy-MM');
      const monthTransactions = transactions.filter(t => t.date.startsWith(monthKey));
      
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
    
    const monthTransactions = transactions.filter(t => t.date.startsWith(monthKey));
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
      const projectedValue = day <= currentDay ? dayExpenses : dailyAverage;
      
      dailyData.push({
        day,
        actual: day <= currentDay ? dayExpenses : null,
        projected: day > currentDay ? projectedValue : null,
        average: dailyAverage,
      });
    }
    
    return { dailyData, dailyAverage, projectedTotal };
  };

  const sixMonthData = generateSixMonthTrend();
  const { dailyData, dailyAverage, projectedTotal } = generateDailyProjection();

  const chartConfig = {
    receitas: {
      label: "Receitas",
      color: "hsl(var(--chart-income))",
    },
    despesas: {
      label: "Despesas", 
      color: "hsl(var(--chart-expense))",
    },
    saldo: {
      label: "Saldo",
      color: "hsl(var(--chart-1))",
    },
    actual: {
      label: "Gastos Reais",
      color: "hsl(var(--chart-income))",
    },
    projected: {
      label: "Projeção",
      color: "hsl(var(--chart-2))",
    },
    average: {
      label: "Média Diária",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="trend" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trend" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Tendência 6 Meses
          </TabsTrigger>
          <TabsTrigger value="projection" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Projeção Diária
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tendência dos Últimos 6 Meses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sixMonthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value) => formatCurrency(Number(value))}
                      />} 
                    />
                    
                    <Area
                      type="monotone"
                      dataKey="receitas"
                      stackId="1"
                      stroke="hsl(var(--chart-income))"
                      fill="hsl(var(--chart-income))"
                      fillOpacity={0.8}
                    />
                    <Area
                      type="monotone"
                      dataKey="despesas"
                      stackId="2"
                      stroke="hsl(var(--chart-expense))"
                      fill="hsl(var(--chart-expense))"
                      fillOpacity={0.8}
                    />
                    <Area
                      type="monotone"
                      dataKey="saldo"
                      stackId="3"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Projeção de Gastos Diários
              </CardTitle>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Média diária atual: {formatCurrency(dailyAverage)}</p>
                <p>Projeção para o mês: {formatCurrency(projectedTotal)}</p>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value) => formatCurrency(Number(value))}
                      />} 
                    />
                    
                    <ReferenceLine 
                      y={dailyAverage} 
                      stroke="hsl(var(--chart-1))" 
                      strokeDasharray="5 5"
                      label={{ value: "Média", position: "insideTopRight" }}
                    />
                    
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="hsl(var(--chart-income))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-income))" }}
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="projected"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "hsl(var(--chart-2))" }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedCharts;