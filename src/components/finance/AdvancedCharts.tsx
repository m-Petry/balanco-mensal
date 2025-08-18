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
  Tooltip,
  ComposedChart,
  Legend,
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
      color: "hsl(142, 76%, 36%)", // Verde mais visível
    },
    despesas: {
      label: "Despesas", 
      color: "hsl(0, 84%, 60%)", // Vermelho mais visível
    },
    saldo: {
      label: "Saldo",
      color: "hsl(217, 91%, 60%)", // Azul mais visível
    },
    actual: {
      label: "Gastos Reais",
      color: "hsl(142, 76%, 36%)", // Verde
    },
    projected: {
      label: "Projeção",
      color: "hsl(45, 93%, 47%)", // Amarelo/dourado
    },
    average: {
      label: "Média Diária",
      color: "hsl(217, 91%, 60%)", // Azul
    },
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Card 1: Tendência 6 Meses e Receitas vs Despesas */}
      <Card>
        <Tabs defaultValue="trend" className="w-full">
          <CardHeader className="pb-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trend" className="flex items-center gap-2 text-xs">
                <TrendingUp className="w-3 h-3" />
                Tendência 6 Meses
              </TabsTrigger>
              <TabsTrigger value="income-expense" className="flex items-center gap-2 text-xs">
                <Calendar className="w-3 h-3" />
                Receitas vs Despesas
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="trend" className="mt-0">
            <CardContent className="pt-0">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={sixMonthData} margin={{ top: 20, right: 10, left: 10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="saldoGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
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
                    <Legend
                      verticalAlign="top"
                      align="left"
                      height={32}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="receitas"
                      stroke="hsl(142, 76%, 36%)"
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 2, stroke: 'hsl(142, 76%, 36%)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="despesas"
                      stroke="hsl(0, 84%, 60%)"
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 2, stroke: 'hsl(0, 84%, 60%)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="saldo"
                      stroke="hsl(217, 91%, 60%)"
                      fill="url(#saldoGradient)"
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="income-expense" className="mt-0">
            <CardContent className="pt-0">
              <div className="text-center text-sm text-muted-foreground mb-4">
                Comparativo do mês atual
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{
                    name: 'Receitas',
                    receitas: sixMonthData[5]?.receitas || 0,
                    despesas: 0
                  }, {
                    name: 'Despesas',
                    receitas: 0,
                    despesas: sixMonthData[5]?.despesas || 0
                  }]} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
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
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      dataKey="receitas"
                      stroke="hsl(142, 76%, 36%)"
                      fill="hsl(142, 76%, 36%)"
                      fillOpacity={0.6}
                    />
                    <Area
                      dataKey="despesas"
                      stroke="hsl(0, 84%, 60%)"
                      fill="hsl(0, 84%, 60%)"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Card 2: Projeção Diária e Distribuição */}
      <Card>
        <Tabs defaultValue="projection" className="w-full">
          <CardHeader className="pb-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="projection" className="flex items-center gap-2 text-xs">
                <Target className="w-3 h-3" />
                Projeção Diária
              </TabsTrigger>
              <TabsTrigger value="distribution" className="flex items-center gap-2 text-xs">
                <Calendar className="w-3 h-3" />
                Distribuição
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="projection" className="mt-0">
            <CardContent className="pt-0">
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
            </CardContent>
          </TabsContent>

          <TabsContent value="distribution" className="mt-0">
            <CardContent className="pt-0">
              <div className="text-center text-sm text-muted-foreground mb-4">
                Análise de Padrões
              </div>
              <div className="h-[240px] w-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground">Maior Gasto</div>
                      <div className="text-lg font-bold text-red-500">
                        {formatCurrency(Math.max(...dailyData.map(d => d.actual || 0)))}
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground">Menor Gasto</div>
                      <div className="text-lg font-bold text-green-500">
                        {formatCurrency(Math.min(...dailyData.filter(d => d.actual && d.actual > 0).map(d => d.actual || 0)))}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">Dias sem Gastos</div>
                    <div className="text-lg font-bold text-blue-500">
                      {dailyData.filter(d => d.actual === 0).length} dias
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AdvancedCharts;