import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, TrendingUp, PieChart as PieChartIcon, Target } from "lucide-react";
import ChartInfoButton from "./ChartInfoButton";
import { Transaction, Category } from "@/types/finance";
import { subMonths, format, getDaysInMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import GoogleChart from "@/components/ui/GoogleChart";

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
  valuesVisible,
}: UnifiedChartsProps) => {
  const dateObj =
    currentDate instanceof Date
      ? currentDate
      : new Date(currentDate.year, currentDate.month - 1);

  const incomeExpenseData = [
    ["Tipo", "Valor"],
    ["Receitas", totalIncome],
    ["Despesas", totalExpense],
  ];
  const incomeExpenseColors = ["hsl(142, 76%, 36%)", "hsl(0, 84%, 60%)"];

  const expensesByCategory = categories
    .filter((cat) => cat.type === "expense")
    .map((category) => {
      const categoryExpenses = transactions
        .filter((t) => t.type === "expense" && t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: category.name,
        value: categoryExpenses,
        fill: category.color,
      };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const categoryData = [
    ["Categoria", "Valor"],
    ...expensesByCategory.map((c) => [c.name, c.value]),
  ];

  const generateSixMonthTrend = () => {
    const months = [] as { month: string; receitas: number; despesas: number; saldo: number }[];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(dateObj, i);
      const monthKey = format(monthDate, "yyyy-MM");
      const monthTransactions = allTransactions.filter((t) => t.date.startsWith(monthKey));

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = income - expenses;

      months.push({
        month: format(monthDate, "MMM", { locale: ptBR }),
        receitas: income,
        despesas: expenses,
        saldo: balance,
      });
    }
    return months;
  };

  const generateDailyProjection = () => {
    const daysInMonth = getDaysInMonth(dateObj);
    const currentDay = new Date().getDate();
    const monthKey = format(dateObj, "yyyy-MM");

    const monthTransactions = allTransactions.filter((t) => t.date.startsWith(monthKey));
    const totalExpenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const dailyAverage = currentDay > 0 ? totalExpenses / currentDay : 0;
    const projectedTotal = dailyAverage * daysInMonth;

    const dailyData = [] as { day: number; actual: number | null; projected: number | null }[];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTransactions = monthTransactions.filter((t) => {
        const transactionDay = new Date(t.date).getDate();
        return transactionDay === day && t.type === "expense";
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

  const sixMonthData = generateSixMonthTrend();
  const { dailyData } = generateDailyProjection();

  const sixMonthChartData = [
    ["Mês", "Receitas", "Despesas", "Saldo"],
    ...sixMonthData.map((d) => [d.month, d.receitas, d.despesas, d.saldo]),
  ];

  const dailyProjectionChartData = [
    ["Dia", "Gastos Reais", "Projeção"],
    ...dailyData.map((d) => [d.day, d.actual, d.projected]),
  ];

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
              <TabsTrigger value="category-distribution" className="flex items-center gap-2 text-xs">
                <PieChartIcon className="w-3 h-3" />
                Distribuição de Despesas
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <TabsContent value="income-expense">
            <CardContent className="pt-0">
              <div className="relative h-[280px]">
                <div className="absolute top-2 right-2 z-10">
                  <ChartInfoButton chartType="income-expense" />
                </div>
                <GoogleChart
                  chartType="ColumnChart"
                  data={incomeExpenseData}
                  options={{
                    legend: { position: "none" },
                    colors: incomeExpenseColors,
                    tooltip: { trigger: valuesVisible ? "focus" : "none" },
                  }}
                  height={280}
                />
              </div>
            </CardContent>
          </TabsContent>
          <TabsContent value="category-distribution">
            <CardContent className="pt-0">
              <div className="relative h-[280px]">
                <div className="absolute top-2 right-2 z-10">
                  <ChartInfoButton chartType="distribution" />
                </div>
                {expensesByCategory.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Nenhuma despesa encontrada
                  </div>
                ) : (
                  <GoogleChart
                    chartType="PieChart"
                    data={categoryData}
                    options={{
                      legend: { position: "right", textStyle: { fontSize: 12 } },
                      colors: expensesByCategory.map((c) => c.fill),
                      tooltip: { trigger: valuesVisible ? "focus" : "none" },
                    }}
                    height={280}
                  />
                )}
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Card 2: Projeção Diária e Tendência 6 Meses */}
      <Card>
        <Tabs defaultValue="daily-projection" className="w-full">
          <CardHeader className="pb-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="daily-projection" className="flex items-center gap-2 text-xs">
                <Target className="w-3 h-3" />
                Projeção Diária
              </TabsTrigger>
              <TabsTrigger value="six-month-trend" className="flex items-center gap-2 text-xs">
                <TrendingUp className="w-3 h-3" />
                Tendência 6 Meses
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <TabsContent value="daily-projection">
            <CardContent className="pt-0">
              <div className="relative h-[280px]">
                <div className="absolute top-2 right-2 z-10">
                  <ChartInfoButton chartType="projection" />
                </div>
                <GoogleChart
                  chartType="ColumnChart"
                  data={dailyProjectionChartData}
                  options={{
                    legend: { position: "bottom" },
                    colors: ["hsl(142, 76%, 36%)", "hsl(45, 93%, 47%)"],
                    tooltip: { trigger: valuesVisible ? "focus" : "none" },
                  }}
                  height={280}
                />
              </div>
            </CardContent>
          </TabsContent>
          <TabsContent value="six-month-trend">
            <CardContent className="pt-0">
              <div className="relative h-[280px]">
                <div className="absolute top-2 right-2 z-10">
                  <ChartInfoButton chartType="trend" />
                </div>
                <GoogleChart
                  chartType="LineChart"
                  data={sixMonthChartData}
                  options={{
                    legend: { position: "bottom" },
                    colors: [
                      "hsl(142, 76%, 36%)",
                      "hsl(0, 84%, 60%)",
                      "hsl(217, 91%, 60%)",
                    ],
                    tooltip: { trigger: valuesVisible ? "focus" : "none" },
                  }}
                  height={280}
                />
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default UnifiedCharts;
