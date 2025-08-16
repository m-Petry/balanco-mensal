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
          tooltip: "Resumo mensal de entradas e saídas",
          title: "Receitas x Despesas",
          description:
            "Barras lado a lado comparam tudo que entrou e saiu neste mês. Verde mostra o que você ganhou e vermelho o que gastou. Observe quem está maior para saber se o mês fecha no azul ou no vermelho.",
        };
      case 'distribution':
        return {
          tooltip: "Distribuição dos gastos por categoria",
          title: "Onde seu dinheiro é gasto",
          description:
            "Cada fatia desta pizza indica a participação de uma categoria nas despesas do mês. Compare os tamanhos para descobrir onde estão os maiores custos e reflita se estão alinhados às suas prioridades.",
        };
      case 'projection':
        return {
          tooltip: "Gastos diários e previsão do mês",
          title: "Projeção de gastos diários",
          description:
            "A linha verde acompanha o gasto acumulado dia a dia. A linha amarela tracejada projeta o total do mês se o ritmo atual continuar. Use para ajustar os gastos antes que ultrapassem o planejado.",
        };
      case 'trend':
        return {
          tooltip: "Evolução financeira nos últimos 6 meses",
          title: "Tendência financeira",
          description:
            "Áreas coloridas revelam a trajetória de receitas (verde), despesas (vermelho) e saldo (azul) nos últimos seis meses. Analise os movimentos para perceber épocas de aperto ou sobra e planejar os próximos passos.",
        };
      default:
        return {
          tooltip: "Informações sobre o gráfico",
          title: "Informações do Gráfico",
          description: "Informações detalhadas sobre como interpretar este gráfico.",
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
