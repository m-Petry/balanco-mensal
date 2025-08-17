
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, TrendingUp, PieChart as PieChartIcon, Target } from "lucide-react";
import ChartInfoButton from "./ChartInfoButton";
import { formatCurrency } from "@/utils/currency";
import { Transaction, Category } from "@/types/finance";
import { subMonths, format, getDaysInMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
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
  Line,
  ReferenceLine,
  Tooltip,
  LabelList,
  ComposedChart,
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
  const [activeTab, setActiveTab] = useState("income-expense");
  const [hoveredData, setHoveredData] = useState<any>(null);
  
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

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.6,
        delay: 0.2,
        ease: "easeOut"
      }
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const renderIncomeExpenseTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        transition={{ duration: 0.2 }}
        className="px-3 py-2 rounded-lg border shadow-lg backdrop-blur-sm"
        style={{
          backgroundColor: 'hsl(var(--card))',
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--foreground))',
        }}
      >
        <div className="font-medium">{label}</div>
        <div className="text-lg font-bold">{formatCurrency(Number(payload[0].value))}</div>
      </motion.div>
    );
  };

  const renderCategoryTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="px-3 py-2 rounded-lg border shadow-lg backdrop-blur-sm pointer-events-none"
        style={{
          backgroundColor: 'hsl(var(--card))',
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--foreground))',
          filter: valuesVisible ? 'none' : 'blur(4px)',
        }}
      >
        <div className="font-medium">{payload[0].name}</div>
        <div className="text-lg font-bold">{formatCurrency(Number(payload[0].value))}</div>
        <div className="text-sm text-muted-foreground">{formatPercentage(Number(payload[0].value), totalExpense)}</div>
      </motion.div>
    );
  };

  const pieContainerRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>();

  const handlePieMouseMove = (_: unknown, __: number, e: { chartX: number; chartY: number }) => {
    if (!pieContainerRef.current) return;
    const rect = pieContainerRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const outerRadius = 80;
    const dx = e.chartX - cx;
    const dy = e.chartY - cy;
    const angle = Math.atan2(dy, dx);
    const offset = 12;
    const x = cx + Math.cos(angle) * (outerRadius + offset);
    const y = cy + Math.sin(angle) * (outerRadius + offset);
    setTooltipPos({ x, y });
  };

  const handlePieMouseLeave = () => {
    setTooltipPos(undefined);
  };

  const sixMonthData = generateSixMonthTrend();
  const { dailyData, dailyAverage, projectedTotal } = generateDailyProjection();

  return (
    <motion.div 
      className="space-y-4 sm:space-y-6"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {/* Card 1: Receitas vs Despesas e Distribuição de Despesas */}
      <motion.div variants={cardVariants}>
        <Card className="overflow-hidden backdrop-blur-sm bg-card/95 border shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="pb-3">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="income-expense" className="flex items-center gap-2 text-xs transition-all duration-200">
                    <BarChart className="w-3 h-3" />
                    Receitas vs Despesas
                  </TabsTrigger>
                  <TabsTrigger value="distribution" className="flex items-center gap-2 text-xs transition-all duration-200">
                    <PieChartIcon className="w-3 h-3" />
                    Distribuição
                  </TabsTrigger>
                </TabsList>
              </motion.div>
            </CardHeader>

            <AnimatePresence mode="wait">
              <TabsContent key={activeTab} value="income-expense" className="mt-0">
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <CardContent className="pt-0">
                    <div className="relative">
                      <div className="absolute top-2 right-2 z-10">
                        <ChartInfoButton chartType="income-expense" />
                      </div>
                      <motion.div 
                        className="h-[280px] w-full"
                        variants={chartVariants}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart
                            data={incomeExpenseData}
                            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                            barCategoryGap={0}
                          >
                            <defs>
                              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.9} />
                                <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                              </linearGradient>
                              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.9} />
                                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
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
                            <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={120}>
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
                                  const { x, y, width } = viewBox;
                                  return (
                                    <motion.text
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.5, duration: 0.3 }}
                                      x={x + width / 2}
                                      y={y - 8}
                                      textAnchor="middle"
                                      fill="hsl(var(--foreground))"
                                      fontSize={12}
                                      fontWeight="600"
                                      className={!valuesVisible ? 'blur-sm select-none' : ''}
                                    >
                                      {formatCurrency(Number(value))}
                                    </motion.text>
                                  );
                                }}
                              />
                            </Bar>
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </motion.div>
                    </div>
                  </CardContent>
                </motion.div>
              </TabsContent>

              <TabsContent key={activeTab} value="distribution" className="mt-0">
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <CardContent className="pt-0">
                    <div className="relative">
                      <div className="absolute top-2 right-2 z-10">
                        <ChartInfoButton chartType="distribution" />
                      </div>
                      {expensesByCategory.length === 0 ? (
                        <motion.div 
                          className="h-[280px] flex items-center justify-center text-muted-foreground"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            Nenhuma despesa encontrada
                          </motion.div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          className="space-y-4"
                          variants={chartVariants}
                        >
                          <div className="relative h-[180px] w-full" ref={pieContainerRef}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={expensesByCategory}
                                  key={expensesByCategory.map(c => c.name).join('-')}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={80}
                                  paddingAngle={3}
                                  cornerRadius={6}
                                  dataKey="value"
                                  labelLine={false}
                                  onMouseMove={handlePieMouseMove}
                                  onMouseLeave={handlePieMouseLeave}
                                  animationBegin={0}
                                  animationDuration={800}
                                >
                                  {expensesByCategory.map((entry) => (
                                    <Cell
                                      key={`cell-${entry.name}`}
                                      fill={entry.fill}
                                      stroke="hsl(var(--background))"
                                      strokeWidth={3}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  content={renderCategoryTooltip}
                                  position={tooltipPos}
                                  wrapperStyle={{ pointerEvents: 'none', visibility: tooltipPos ? 'visible' : 'hidden' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                            <motion.div 
                              className="absolute inset-0 flex flex-col items-center justify-center text-xs pointer-events-none"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.5, duration: 0.3 }}
                            >
                              <span className="text-muted-foreground">Total</span>
                              <span className={`font-bold text-lg ${!valuesVisible ? 'blur-md select-none' : ''}`}>
                                {formatCurrency(totalExpense)}
                              </span>
                            </motion.div>
                          </div>

                          {/* Legend */}
                          <motion.div 
                            className="grid grid-cols-1 gap-2 max-h-20 overflow-y-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                          >
                            {expensesByCategory.map((category, index) => (
                              <motion.div 
                                key={category.name} 
                                className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                                whileHover={{ scale: 1.02, x: 4 }}
                              >
                                <div className="flex items-center gap-2">
                                  <motion.div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: category.fill }}
                                    whileHover={{ scale: 1.3 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                  />
                                  <span className="truncate font-medium">{category.name}</span>
                                </div>
                                <div className={`flex gap-2 text-muted-foreground ${!valuesVisible ? 'blur-sm select-none' : ''}`}>
                                  <span className="font-semibold">{formatCurrency(category.value)}</span>
                                  <span>({formatPercentage(category.value, totalExpense)})</span>
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </Card>
      </motion.div>

      {/* Card 2: Projeção Diária e Tendência 6 Meses */}
      <motion.div variants={cardVariants}>
        <Card className="overflow-hidden backdrop-blur-sm bg-card/95 border shadow-lg">
          <Tabs defaultValue="projection" className="w-full">
            <CardHeader className="pb-3">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="projection" className="flex items-center gap-2 text-xs transition-all duration-200">
                    <Target className="w-3 h-3" />
                    Projeção Diária
                  </TabsTrigger>
                  <TabsTrigger value="trend" className="flex items-center gap-2 text-xs transition-all duration-200">
                    <TrendingUp className="w-3 h-3" />
                    Tendência 6 Meses
                  </TabsTrigger>
                </TabsList>
              </motion.div>
            </CardHeader>

            <TabsContent value="projection" className="mt-0">
              <CardContent className="pt-0">
                <div className="relative">
                  <div className="absolute top-2 right-2 z-10">
                    <ChartInfoButton chartType="projection" />
                  </div>
                  <motion.div 
                    className={`text-sm text-muted-foreground mb-4 space-y-1 ${!valuesVisible ? 'blur-sm select-none' : ''}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p>Média diária: {formatCurrency(dailyAverage)}</p>
                    <p>Projeção mês: {formatCurrency(projectedTotal)}</p>
                  </motion.div>
                  <motion.div 
                    className="h-[240px] w-full"
                    variants={chartVariants}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <defs>
                          <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
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
                          wrapperStyle={{ filter: valuesVisible ? 'none' : 'blur(4px)' }}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        />

                        <ReferenceLine
                          y={dailyAverage}
                          stroke="hsl(217, 91%, 60%)"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                        />

                        <Area
                          name="Gastos Reais"
                          type="monotone"
                          dataKey="actual"
                          stroke="hsl(142, 76%, 36%)"
                          fill="url(#actualGradient)"
                          strokeWidth={2}
                          connectNulls={false}
                          animationDuration={1000}
                        />
                        <Line
                          name="Projeção"
                          type="monotone"
                          dataKey="projected"
                          stroke="hsl(45, 93%, 47%)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ fill: "hsl(45, 93%, 47%)", r: 4 }}
                          connectNulls={false}
                          animationDuration={1200}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </motion.div>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="trend" className="mt-0">
              <CardContent className="pt-0">
                <div className="relative">
                  <div className="absolute top-2 right-2 z-10">
                    <ChartInfoButton chartType="trend" />
                  </div>
                  <motion.div 
                    className="h-[280px] w-full"
                    variants={chartVariants}
                  >
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
                          wrapperStyle={{ filter: valuesVisible ? 'none' : 'blur(4px)' }}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        />
                        
                        <Area
                          name="Receitas"
                          type="monotone"
                          dataKey="receitas"
                          stroke="hsl(142, 76%, 36%)"
                          fill="hsl(142, 76%, 36%)"
                          fillOpacity={0.4}
                          strokeWidth={3}
                          animationDuration={1000}
                        />
                        <Area
                          name="Despesas"
                          type="monotone"
                          dataKey="despesas"
                          stroke="hsl(0, 84%, 60%)"
                          fill="hsl(0, 84%, 60%)"
                          fillOpacity={0.4}
                          strokeWidth={3}
                          animationDuration={1200}
                        />
                        <Area
                          name="Saldo"
                          type="monotone"
                          dataKey="saldo"
                          stroke="hsl(217, 91%, 60%)"
                          fill="hsl(217, 91%, 60%)"
                          fillOpacity={0.3}
                          strokeWidth={3}
                          animationDuration={1400}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default UnifiedCharts;
