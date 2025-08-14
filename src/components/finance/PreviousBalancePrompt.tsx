import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, TrendingUp, TrendingDown } from "lucide-react";
import { Transaction } from "@/types/finance";

interface PreviousBalancePromptProps {
  previousBalance: number;
  currentDate: { year: number; month: number };
  onAcceptBalance: (transaction: Omit<Transaction, 'id'>) => void;
  onRejectBalance: () => void;
}

const PreviousBalancePrompt = ({ 
  previousBalance, 
  currentDate, 
  onAcceptBalance, 
  onRejectBalance 
}: PreviousBalancePromptProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (value: number) => {
    return `R$ ${Math.abs(value).toFixed(2).replace('.', ',')}`;
  };

  const handleAccept = async () => {
    setIsProcessing(true);
    
    const transaction: Omit<Transaction, 'id'> = {
      description: `Saldo transferido do mês anterior`,
      amount: Math.abs(previousBalance),
      type: previousBalance >= 0 ? 'income' : 'expense',
      categoryId: previousBalance >= 0 ? 'transfer-in' : 'transfer-out',
      date: `${currentDate.year}-${String(currentDate.month).padStart(2, '0')}-01`
    };

    try {
      await onAcceptBalance(transaction);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = () => {
    onRejectBalance();
  };

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {previousBalance >= 0 ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          Saldo do mês anterior disponível
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Você possui um saldo {previousBalance >= 0 ? 'positivo' : 'negativo'} de{' '}
          <span className={`font-bold ${previousBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(previousBalance)}
          </span>
          {' '}do mês anterior. Deseja transferir para este mês?
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            disabled={isProcessing}
            className="gap-1"
          >
            <X className="w-3 h-3" />
            Não transferir
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            disabled={isProcessing}
            className="gap-1"
          >
            <Check className="w-3 h-3" />
            {isProcessing ? 'Transferindo...' : 'Transferir saldo'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreviousBalancePrompt;