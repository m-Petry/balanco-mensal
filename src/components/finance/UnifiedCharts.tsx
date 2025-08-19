import { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, TrendingUp, PieChart as PieChartIcon, Target, BookOpenText } from "lucide-react";
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
  Area,
  Line,
  ReferenceLine,
  Tooltip,
  LabelList,
  ComposedChart,
  Legend,
  type LabelProps,
  type TooltipProps,
} from "recharts";

interface UnifiedChartsProps {
  transactions: Transaction[];
  categories: Category[];
  totalIncome: number;
  totalExpense: number;
  allTransactions: Transaction[];
  currentDate: Date | { year: number; month: number };
  valuesVisible: boolean;
}

const UnifiedCharts = ({
  transactions,
  categories,
  totalIncome,
  totalExpense,
  allTransactions,
  currentDate,
  valuesVisible
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
    const today = new Date();
    const currentDay = dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear() ? today.getDate() : daysInMonth;

    const monthKey = format(dateObj, 'yyyy-MM');

    const monthTransactions = allTransactions.filter(t => t.date.startsWith(monthKey) && t.type === 'expense');
    
    const expensesUpToCurrentDay = monthTransactions
      .filter(t => new Date(t.date).getDate() <= currentDay)
      .reduce((sum, t) => sum + t.amount, 0);

    const dailyAverage = currentDay > 0 ? expensesUpToCurrentDay / currentDay : 0;
    const projectedTotal = dailyAverage * daysInMonth;

    let cumulativeActual = 0;
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayExpenses = monthTransactions
        .filter(t => new Date(t.date).getDate() === day)
        .reduce((sum, t) => sum + t.amount, 0);
      
      if (day <= currentDay) {
        cumulativeActual += dayExpenses;
      }

      return {
        day: `Dia ${day}`,
        actual: day <= currentDay ? dayExpenses : null,
        projected: day >= currentDay ? dailyAverage : null,
        cumulative: day <= currentDay ? cumulativeActual : null,
      };
    });
    
    if (currentDay > 0 && currentDay <= daysInMonth) {
      dailyData[currentDay - 1].projected = dailyData[currentDay - 1].actual;
    }

    return { dailyData, dailyAverage, projectedTotal };
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const renderIncomeExpenseTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="px-2 py-1 rounded border text-xs space-y-1"
        style={{
          backgroundColor: 'hsl(var(--card))',
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--foreground))',
          fontSize: '12px'
        }}
      >
        <div>{label}</div>
        <div>{formatCurrency(Number(payload[0].value))}</div>
      </div>
    );
  };

  const renderCategoryTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="px-2 py-1 rounded border text-xs space-y-1 pointer-events-none shadow-lg z-50 relative"
        style={{
          backgroundColor: 'hsl(var(--card))',
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--foreground))',
          filter: valuesVisible ? 'none' : 'blur(4px)',
          zIndex: 1000,
        }}
      >
        <div>{payload[0].name}</div>
        <div>{formatPercentage(Number(payload[0].value), totalExpense)}</div>
      </div>
    );
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
                Visão Geral
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
                    <RechartsBarChart
                      data={incomeExpenseData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                      barCategoryGap={0}
                    >
                      <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.2} />
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
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
                        cursor={{ fill: 'hsl(var(--foreground))', opacity: 0.05 }}
                        content={renderIncomeExpenseTooltip}
                        wrapperStyle={{ filter: valuesVisible ? 'none' : 'blur(4px)' }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={120}>
                        {incomeExpenseData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={
                              entry.name === 'Receitas'
                                ? 'url(#incomeGradient)'
                                : 'url(#expenseGradient)'
                            }
                          />
                        ))}
                        <LabelList
                          dataKey="value"
                          position="top"
                          content={(props: LabelProps) => {
                            const { value, viewBox } = props;
                            if (!viewBox) return null;
                            const { x, y, width } = viewBox as { x: number; y: number; width: number };
                            return (
                              <text
                                x={x + width / 2}
                                y={y - 4}
                                textAnchor="middle"
                                fill="hsl(var(--foreground))"
                                fontSize={12}
                                className={!valuesVisible ? 'blur-sm select-none' : ''}
                              >
                                {formatCurrency(Number(value))}
                              </text>
                            );
                          }}
                        />
                      </Bar>
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
                          key={expensesByCategory.map(c => c.name).join('-')}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          cornerRadius={4}
                          dataKey="value"
                          labelLine={false}
                        >
                          {expensesByCategory.map((entry) => (
                            <Cell
                              key={`cell-${entry.name}`}
                              fill={entry.fill}
                              stroke="hsl(var(--background))"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={renderCategoryTooltip}
                          cursor={{ fill: 'hsl(var(--foreground))', opacity: 0.1 }}
                          wrapperStyle={{ zIndex: 50 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-xs pointer-events-none z-10">
                      <span className="text-muted-foreground">Total</span>
                      <span className={`font-medium ${!valuesVisible ? 'blur-md select-none' : ''}`}>{formatCurrency(totalExpense)}</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-1 gap-1 max-h-20 overflow-y-auto">
                    {expensesByCategory.map((category) => (
                      <div key={category.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category.fill }}
                          />
                          <span className="truncate">{category.name}</span>
                        </div>
                        <div className={`flex gap-2 text-muted-foreground ${!valuesVisible ? 'blur-sm select-none' : ''}`}>
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
                <div className={`text-sm text-muted-foreground mb-4 space-y-1 ${!valuesVisible ? 'blur-sm select-none' : ''}`}>
                  <p>Média diária de gastos: <span className="font-semibold text-primary">{formatCurrency(dailyAverage)}</span></p>
                  <p>Projeção de gastos para o mês: <span className="font-semibold text-primary">{formatCurrency(projectedTotal)}</span></p>
                </div>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dailyData} margin={{ top: 20, right: 10, left: 10, bottom: 10 }}>
                      <defs>
                        <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis 
                        dataKey="day" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `${formatCurrency(value)}`}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
                                <div className="font-bold">{label}</div>
                                {payload.map(p => (
                                  <div key={p.name} style={{ color: p.color }}>
                                    {`${p.name}: ${formatCurrency(p.value as number)}`}
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}                        wrapperStyle={{ filter: valuesVisible ? 'none' : 'blur(4px)' }}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '12px', top: 0 }}/>
                      <Bar dataKey="actual" name="Gasto Real" fill="hsl(142, 76%, 36%)" barSize={10} radius={[4, 4, 0, 0]} />
                      <Line 
                        type="monotone" 
                        dataKey="projected" 
                        name="Projeção de Gasto"
                        stroke="hsl(45, 93%, 47%)" 
                        strokeWidth={2} 
                        strokeDasharray="5 5" 
                        dot={false}
                        connectNulls
                      />
                      <Area 
                        type="monotone" 
                        dataKey="cumulative" 
                        name="Gasto Acumulado" 
                        fill="url(#colorCumulative)" 
                        stroke="hsl(217, 91%, 60%)" 
                        strokeWidth={2}
                        connectNulls
                      />
                    </ComposedChart>
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
                      wrapperStyle={{ filter: valuesVisible ? 'none' : 'blur(4px)' }}
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
                      name="Receitas"
                      type="monotone"
                      dataKey="receitas"
                      stroke="hsl(142, 76%, 36%)"
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 2, stroke: 'hsl(142, 76%, 36%)' }}
                    />
                    <Line
                      name="Despesas"
                      type="monotone"
                      dataKey="despesas"
                      stroke="hsl(0, 84%, 60%)"
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 2, stroke: 'hsl(0, 84%, 60%)' }}
                    />
                    <Area
                      name="Saldo"
                      type="monotone"
                      dataKey="saldo"
                      stroke="hsl(217, 91%, 60%)"
                      fill="url(#saldoGradient)"
                      strokeWidth={2}
                    />
                  </ComposedChart>
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