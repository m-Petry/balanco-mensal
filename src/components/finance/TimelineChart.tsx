import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Transaction, Category } from '@/types/finance';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';

interface TimelineChartProps {
  transactions: Transaction[];
  categories: Category[];
  valuesVisible: boolean;
}

const TimelineChart = ({ transactions, categories, valuesVisible }: TimelineChartProps) => {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const INITIAL_VISIBLE_COUNT = 5;

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getCategory = (categoryId: string) => categories.find(c => c.id === categoryId);

  const visibleTransactions = isExpanded ? sortedTransactions : sortedTransactions.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMore = sortedTransactions.length > INITIAL_VISIBLE_COUNT;

  const handleToggleExpand = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsExpanded(!isExpanded);
      setIsAnimating(false);
    }, 300);
  };

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Nenhuma transação para exibir no confronto.
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <Timeline
          position="alternate"
          sx={{
            py: 2,
            px: { xs: 0, sm: 2 },
            '& .MuiTimelineItem-root': {
              minHeight: 'auto',
              '&::before': { 
                flex: { xs: 0, sm: 0.1 },
                padding: { xs: 0, sm: 2 },
              },
            },
            '& .MuiTimelineOppositeContent-root': {
              m: 'auto 0',
              textAlign: 'right',
            },
            '& .MuiTimelineContent-root': {
              maxWidth: '400px',
            },
          }}
        >
        {visibleTransactions.map(transaction => {
          const isIncome = transaction.type === 'income';
          const category = getCategory(transaction.categoryId);

          return (
            <TimelineItem key={transaction.id} position={isMobile ? 'right' : isIncome ? 'left' : 'right'}>
              <TimelineOppositeContent
                variant="body2"
                className="text-muted-foreground hidden sm:block"
              >
                {format(parseISO(transaction.date), "dd 'de' MMM, yyyy", { locale: ptBR })}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineConnector />
                <TimelineDot color={isIncome ? 'success' : 'error'}>
                  {isIncome ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Card className="w-full hover:border-primary/30 transition-colors shadow-sm">
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm sm:text-base font-medium leading-tight">{transaction.description}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 sm:hidden">
                      {format(parseISO(transaction.date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </p>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-1">
                    {category && (
                      <Badge
                        variant="outline"
                        className="w-fit text-xs"
                        style={{ borderColor: category.color }}
                      >
                        {category.name}
                      </Badge>
                    )}
                    <p
                      className={cn(
                        "font-bold text-base sm:text-lg",
                        isIncome ? 'text-income' : 'text-expense',
                        !valuesVisible && 'blur-sm select-none'
                      )}
                    >
                      {isIncome ? '+' : '-'} R$ {transaction.amount.toFixed(2).replace('.', ',')}
                    </p>
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          );
        })}
        </Timeline>
      </div>
      
      {(hasMore || isExpanded) && (
        <div className="flex justify-center py-3 px-2 sm:px-3 md:px-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpand}
            disabled={isAnimating}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Recolher
              </>
            ) : (
              <>
                Ver mais ({sortedTransactions.length - INITIAL_VISIBLE_COUNT})
                <ChevronDown className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TimelineChart;