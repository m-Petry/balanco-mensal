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
  const INITIAL_VISIBLE_COUNT = 4;

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
    <div className="w-full flex-1 px-4 sm:px-6 md:px-8 pt-4 pb-4 overflow-auto">
      <Timeline
        position={isMobile ? 'right' : 'alternate'}
        sx={{
          p: 0,
          m: 0,
          '& .MuiTimelineItem-root:first-of-type': { minHeight: 0, mt: 0 },
          '& .MuiTimelineItem-root:before': { flex: 0, padding: 0 }
        }}
      >
        {visibleTransactions.map(transaction => {
          const isIncome = transaction.type === 'income';
          const category = getCategory(transaction.categoryId);

          return (
            <TimelineItem
              key={transaction.id}
              sx={{
                minHeight: { xs: '80px', sm: '110px' }
              }}
            >
              {!isMobile && (
                <TimelineOppositeContent
                  sx={{ m: 'auto 0' }}
                  align={isIncome ? 'right' : 'left'}
                  variant="body2"
                  className="text-muted-foreground"
                >
                  {format(parseISO(transaction.date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                </TimelineOppositeContent>
              )}
              <TimelineSeparator>
                <TimelineConnector />
                <TimelineDot color={isIncome ? 'success' : 'error'}>
                  {isIncome ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: { xs: 1, sm: '12px' }, px: { xs: 1, sm: 2, md: 3 } }}>
                <Card className="w-full max-w-md mx-auto flex flex-col gap-2 sm:gap-3 hover:border-primary/30 transition-colors">
                  <CardHeader className="p-2 sm:p-4 md:p-5">
                    <CardTitle className="text-sm font-medium truncate">{transaction.description}</CardTitle>
                    {isMobile && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(parseISO(transaction.date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="p-2 sm:p-4 md:p-5 space-y-2">
                    {category && (
                      <Badge
                        variant="outline"
                        className="w-fit"
                        style={{ borderColor: category.color }}
                      >
                        {category.name}
                      </Badge>
                    )}
                    <p
                      className={cn(
                        "font-bold text-lg",
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
      
      {(hasMore || isExpanded) && (
        <div className="flex justify-center pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpand}
            disabled={isAnimating}
            className="text-sm font-medium text-primary hover:text-primary/80"
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


