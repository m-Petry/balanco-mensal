
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import { formatCurrency } from '@/utils/currency';
import { Transaction, Category } from '@/types/finance';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface UnifiedChartsProps {
  transactions: Transaction[];
  categories: Category[];
  currentDate: { year: number; month: number };
  valuesVisible: boolean;
}

const CHART_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
  '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C',
  '#8DD1E1', '#D084D0', '#FFABAB', '#87CEEB'
];

const UnifiedCharts: React.FC<UnifiedChartsProps> = ({
  transactions,
  categories,
  currentDate,
  valuesVisible
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    }
  };

  // Process data for daily flow chart
  const getDailyFlowData = () => {
    const startDate = startOfMonth(new Date(currentDate.year, currentDate.month - 1));
    const endDate = endOfMonth(new Date(currentDate.year, currentDate.month - 1));
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayTransactions = transactions.filter(t => t.date === dayStr);
      
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        day: format(day, 'dd/MM'),
        income,
        expense,
        net: income - expense
      };
    });
  };

  // Process data for category breakdown
  const getCategoryData = () => {
    const categoryTotals = new Map();

    transactions.forEach(transaction => {
      const category = categories.find(c => c.id === transaction.categoryId);
      if (category) {
        const key = `${category.name}-${transaction.type}`;
        const current = categoryTotals.get(key) || 0;
        categoryTotals.set(key, current + transaction.amount);
      }
    });

    return Array.from(categoryTotals.entries()).map(([key, value], index) => {
      const [name, type] = key.split('-');
      return {
        name,
        value,
        type,
        color: CHART_COLORS[index % CHART_COLORS.length]
      };
    });
  };

  // Process data for income vs expense comparison
  const getIncomeExpenseData = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return [
      { name: 'Receitas', value: income, color: '#00C49F' },
      { name: 'Despesas', value: expense, color: '#FF8042' }
    ];
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          className="bg-card border rounded-lg p-3 shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p 
              key={index} 
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const dailyFlowData = getDailyFlowData();
  const categoryData = getCategoryData();
  const incomeExpenseData = getIncomeExpenseData();

  if (!valuesVisible) {
    return (
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[1, 2, 3, 4].map((i) => (
          <motion.div key={i} variants={cardVariants}>
            <Card className="relative">
              <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Dados ocultos</p>
              </div>
              <CardHeader>
                <CardTitle className="blur-md">Gráfico {i}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full bg-muted/20 rounded blur-md" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Daily Flow Chart */}
      <motion.div variants={cardVariants}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Fluxo Diário</CardTitle>
            <CardDescription>
              Receitas e despesas por dia do mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyFlowData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="income"
                  stackId="1"
                  stroke="#00C49F"
                  fill="#00C49F"
                  fillOpacity={0.8}
                  name="Receitas"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stackId="2"
                  stroke="#FF8042"
                  fill="#FF8042"
                  fillOpacity={0.8}
                  name="Despesas"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Income vs Expense Pie Chart */}
      <motion.div variants={cardVariants}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
            <CardDescription>
              Distribuição total do mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeExpenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1500}
                  animationBegin={0}
                >
                  {incomeExpenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  content={<CustomTooltip />}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div variants={cardVariants}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Por Categoria</CardTitle>
            <CardDescription>
              Gastos e receitas por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={categoryData.slice(0, 8)} 
                layout="horizontal"
                margin={{ left: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Valor']}
                  content={<CustomTooltip />}
                />
                <Bar 
                  dataKey="value" 
                  fill="#8884d8"
                  animationDuration={1500}
                  radius={[0, 4, 4, 0]}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Net Flow Trend */}
      <motion.div variants={cardVariants}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Fluxo Líquido</CardTitle>
            <CardDescription>
              Tendência do saldo diário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyFlowData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#8884d8"
                  strokeWidth={3}
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Saldo Líquido"
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default UnifiedCharts;
