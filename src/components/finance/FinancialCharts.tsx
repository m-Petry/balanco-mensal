import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Transaction, Category } from "@/types/finance";

interface FinancialChartsProps {
  transactions: Transaction[];
  categories: Category[];
  totalIncome: number;
  totalExpense: number;
}

const FinancialCharts = ({ transactions, categories, totalIncome, totalExpense }: FinancialChartsProps) => {
  // Income vs Expense chart data
  const incomeExpenseData = [
    {
      name: 'Receitas',
      value: totalIncome,
      fill: 'hsl(var(--chart-income))'
    },
    {
      name: 'Despesas',
      value: totalExpense,
      fill: 'hsl(var(--chart-expense))'
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

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Income vs Expense Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Receitas vs Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeExpenseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis 
                className="text-muted-foreground"
                fontSize={12}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expenses by Category Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          {expensesByCategory.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhuma despesa encontrada
            </div>
          ) : (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${formatPercentage(value, totalExpense)}`}
                    labelLine={false}
                    fontSize={10}
                    fill="currentColor"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Valor']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Legend */}
              <div className="grid grid-cols-1 gap-2 max-h-24 overflow-y-auto">
                {expensesByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
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
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialCharts;