import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ChartInfoButtonProps {
  chartType: 'income-expense' | 'distribution' | 'projection' | 'trend';
}

const ChartInfoButton = ({ chartType }: ChartInfoButtonProps) => {
  const getChartInfo = (type: string) => {
    switch (type) {
      case 'income-expense':
        return {
          tooltip: "Compare suas receitas e despesas mensais",
          title: "Gráfico Receitas vs Despesas",
          description: "Este gráfico de barras compara o total de receitas e despesas do mês atual. As barras verdes representam as receitas totais, enquanto as barras vermelhas mostram as despesas totais. Use este gráfico para avaliar rapidamente se você teve um mês positivo (receitas > despesas) ou negativo (receitas < despesas). O ideal é sempre manter as receitas maiores que as despesas para ter um saldo positivo."
        };
      case 'distribution':
        return {
          tooltip: "Veja como suas despesas estão distribuídas por categoria",
          title: "Distribuição de Despesas por Categoria",
          description: "Este gráfico de pizza mostra como suas despesas estão divididas entre as diferentes categorias. Cada fatia representa uma categoria, com o tamanho proporcional ao valor gasto. As cores correspondem às cores definidas para cada categoria. Use este gráfico para identificar onde você mais gasta dinheiro e avaliar se a distribuição está de acordo com suas prioridades financeiras. A legenda mostra os valores e percentuais de cada categoria."
        };
      case 'projection':
        return {
          tooltip: "Acompanhe seus gastos diários e projeção do mês",
          title: "Projeção Diária de Gastos",
          description: "Este gráfico de linha mostra seus gastos reais por dia (linha sólida verde) e uma projeção baseada na média diária atual (linha tracejada amarela). A linha horizontal azul tracejada representa sua média diária de gastos até o momento. Use este gráfico para acompanhar se você está gastando mais ou menos que o esperado e para prever quanto gastará no final do mês. Se a projeção estiver muito alta, considere reduzir os gastos nos próximos dias."
        };
      case 'trend':
        return {
          tooltip: "Analise a evolução dos últimos 6 meses",
          title: "Tendência Financeira dos Últimos 6 Meses",
          description: "Este gráfico de área mostra a evolução de suas receitas (verde), despesas (vermelho) e saldo (azul) nos últimos 6 meses. As áreas preenchidas facilitam a visualização das tendências ao longo do tempo. Use este gráfico para identificar padrões sazonais, meses problemáticos ou de melhora, e para avaliar sua evolução financeira geral. O ideal é ver as receitas crescendo, despesas controladas e saldo sempre positivo."
        };
      default:
        return {
          tooltip: "Informações sobre o gráfico",
          title: "Informações do Gráfico",
          description: "Informações detalhadas sobre como interpretar este gráfico."
        };
    }
  };

  const info = getChartInfo(chartType);

  return (
    <TooltipProvider>
      <Dialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-accent/50 transition-all duration-200"
              >
                <Info className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-64">
            <p className="text-xs">{info.tooltip}</p>
          </TooltipContent>
        </Tooltip>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              {info.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-left leading-relaxed">
              {info.description}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default ChartInfoButton;