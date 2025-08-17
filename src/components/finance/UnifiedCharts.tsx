
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
import { useSpring, animated, useTrail, config } from '@react-spring/web';

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
  // Animation configurations
  const containerAnimation = useSpring({
    opacity: 1,
    transform: 'translateY(0px)',
    from: { opacity: 0, transform: 'translateY(40px)' },
    config: config.gentle,
    delay: 200
  });

  const cards = [1, 2, 3, 4];
  const cardsTrail = useTrail(cards.length, {
    opacity: 1,
    transform: 'translateY(0px) scale(1)',
    from: { opacity: 0, transform: 'translateY(30px) scale(0.95)' },
    config: config.wobbly,
    delay: 300
  });

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

  // Custom animated tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    const tooltipAnimation = useSpring({
      opacity: active ? 1 : 0,
      transform: active ? 'scale(1)' : 'scale(0.9)',
      config: config.wobbly
    });

    if (active && payload && payload.length) {
      return (
        <animated.div 
          style={tooltipAnimation}
          className="bg-card/95 backdrop-blur-md border rounded-xl p-4 shadow-2xl border-primary/20"
        >
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium" style={{ color: entry.color }}>
                {entry.name}: {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </animated.div>
      );
    }
    return null;
  };

  const dailyFlowData = getDailyFlowData();
  const categoryData = getCategoryData();
  const incomeExpenseData = getIncomeExpenseData();

  if (!valuesVisible) {
    return (
      <animated.div style={containerAnimation} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cardsTrail.map((style, index) => (
          <animated.div key={index} style={style}>
            <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/80 via-muted/60 to-muted/40 backdrop-blur-xl rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <div className="w-6 h-6 rounded-full bg-primary/40 animate-pulse" />
                  </div>
                  <p className="text-muted-foreground font-medium">Dados ocultos</p>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="blur-md bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Gráfico {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl blur-md" />
              </CardContent>
            </Card>
          </animated.div>
        ))}
      </animated.div>
    );
  }

  return (
    <animated.div style={containerAnimation} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Daily Flow Chart */}
      <animated.div style={cardsTrail[0]}>
        <Card className="group hover:shadow-2xl transition-all duration-500 border-primary/10 hover:border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative">
            <CardTitle className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Fluxo Diário
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Receitas e despesas por dia do mês
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyFlowData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF8042" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="income"
                  stackId="1"
                  stroke="#00C49F"
                  fill="url(#incomeGradient)"
                  name="Receitas"
                  animationDuration={2000}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stackId="2"
                  stroke="#FF8042"
                  fill="url(#expenseGradient)"
                  name="Despesas"
                  animationDuration={2000}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </animated.div>

      {/* Income vs Expense Pie Chart */}
      <animated.div style={cardsTrail[1]}>
        <Card className="group hover:shadow-2xl transition-all duration-500 border-primary/10 hover:border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative">
            <CardTitle className="bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">
              Receitas vs Despesas
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Distribuição total do mês
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <filter id="shadow" height="130%">
                    <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                  </filter>
                </defs>
                <Pie
                  data={incomeExpenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={2000}
                  animationBegin={0}
                  filter="url(#shadow)"
                >
                  {incomeExpenseData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
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
      </animated.div>

      {/* Category Breakdown */}
      <animated.div style={cardsTrail[2]}>
        <Card className="group hover:shadow-2xl transition-all duration-500 border-primary/10 hover:border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative">
            <CardTitle className="bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
              Por Categoria
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Gastos e receitas por categoria
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={categoryData.slice(0, 8)} 
                layout="horizontal"
                margin={{ left: 60 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  width={80}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Valor']}
                  content={<CustomTooltip />}
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#barGradient)"
                  animationDuration={2000}
                  radius={[0, 8, 8, 0]}
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </animated.div>

      {/* Net Flow Trend */}
      <animated.div style={cardsTrail[3]}>
        <Card className="group hover:shadow-2xl transition-all duration-500 border-primary/10 hover:border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative">
            <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Fluxo Líquido
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Tendência do saldo diário
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyFlowData}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8884d8"/>
                    <stop offset="50%" stopColor="#82ca9d"/>
                    <stop offset="100%" stopColor="#ffc658"/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="url(#lineGradient)"
                  strokeWidth={4}
                  dot={{ 
                    fill: '#8884d8', 
                    strokeWidth: 3, 
                    r: 6,
                    filter: "url(#glow)"
                  }}
                  activeDot={{ 
                    r: 8,
                    fill: '#8884d8',
                    stroke: '#fff',
                    strokeWidth: 2,
                    filter: "url(#glow)"
                  }}
                  name="Saldo Líquido"
                  animationDuration={2500}
                  filter="url(#glow)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </animated.div>
    </animated.div>
  );
};

export default UnifiedCharts;
