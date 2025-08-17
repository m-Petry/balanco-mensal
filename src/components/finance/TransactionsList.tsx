
import React, { useState } from 'react';
import { Transaction, Category } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Edit, Trash2, Filter, SortAsc, SortDesc, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/currency';
import { CategoryManagementDialog } from './CategoryManagementDialog';
import { PreviousBalancePrompt } from './PreviousBalancePrompt';
import { useSpring, animated, useTrail, config, useTransition } from '@react-spring/web';

interface TransactionsListProps {
  transactions: Transaction[];
  categories: Category[];
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  previousBalance?: number | null;
  showBalancePrompt?: boolean;
  onAcceptBalance?: (transaction: Omit<Transaction, 'id'>) => void;
  onRejectBalance?: () => void;
  currentDate: { year: number; month: number };
  onAddCategory?: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory?: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory?: (id: string) => void;
  valuesVisible: boolean;
}

const TransactionsList = ({
  transactions,
  categories,
  onUpdateTransaction,
  onDeleteTransaction,
  previousBalance,
  showBalancePrompt,
  onAcceptBalance,
  onRejectBalance,
  currentDate,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  valuesVisible
}: TransactionsListProps) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const INITIAL_VISIBLE_COUNT = 6;
  const [showAll, setShowAll] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  // Spring animations
  const containerAnimation = useSpring({
    opacity: 1,
    transform: 'translateY(0px)',
    from: { opacity: 0, transform: 'translateY(20px)' },
    config: config.gentle,
    delay: 100
  });

  const headerAnimation = useSpring({
    opacity: 1,
    transform: 'translateY(0px)',
    from: { opacity: 0, transform: 'translateY(-20px)' },
    config: config.wobbly,
    delay: 200
  });

  const buttonAnimation = useSpring({
    opacity: showAll ? 0 : 1,
    transform: showAll ? 'scale(0.9)' : 'scale(1)',
    config: config.gentle
  });

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDescription(transaction.description);
    setAmount(transaction.amount.toString());
    setType(transaction.type);
    setCategoryId(transaction.categoryId);
    setDate(parseISO(transaction.date));
  };

  const handleUpdate = () => {
    if (!editingTransaction) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Erro",
        description: "Valor deve ser um número positivo",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Erro",
        description: "Descrição é obrigatória",
        variant: "destructive",
      });
      return;
    }

    onUpdateTransaction(editingTransaction.id, {
      description: description.trim(),
      amount: amountNum,
      type,
      categoryId,
      date: format(date, 'yyyy-MM-dd'),
    });

    setEditingTransaction(null);
    toast({
      title: "Sucesso",
      description: "Transação atualizada com sucesso",
    });
  };

  const handleDelete = (id: string) => {
    onDeleteTransaction(id);
    toast({
      title: "Sucesso",
      description: "Transação removida com sucesso",
    });
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  const addFilter = (categoryId: string) => {
    if (!selectedFilters.includes(categoryId)) {
      setSelectedFilters(prev => [...prev, categoryId]);
    }
  };

  const clearFilter = (categoryId: string) => {
    setSelectedFilters(prev => prev.filter(id => id !== categoryId));
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
  };

  const filteredTransactions = selectedFilters.length > 0
    ? transactions.filter(t => selectedFilters.includes(t.categoryId))
    : transactions;

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortOrder) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highest':
        return b.amount - a.amount;
      case 'lowest':
        return a.amount - b.amount;
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const visibleTransactions = showAll ? sortedTransactions : sortedTransactions.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMore = sortedTransactions.length > INITIAL_VISIBLE_COUNT;

  // Animations for transactions
  const transactionTrail = useTrail(visibleTransactions.length, {
    opacity: 1,
    transform: 'translateY(0px) scale(1)',
    from: { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
    config: config.gentle,
    delay: 300
  });

  const filterTransitions = useTransition(selectedFilters, {
    from: { opacity: 0, transform: 'scale(0.8)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0.8)' },
    config: config.wobbly
  });

  const dialogAnimation = useSpring({
    opacity: editingTransaction ? 1 : 0,
    transform: editingTransaction ? 'scale(1)' : 'scale(0.9)',
    config: config.wobbly
  });

  const handleShowAll = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowAll(true);
      setIsAnimating(false);
    }, 150);
  };

  const handleCollapse = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowAll(false);
      setIsAnimating(false);
    }, 150);
  };

  const filteredCategories = categories.filter(cat => cat.type === type);

  return (
    <animated.div style={containerAnimation} className="space-y-6">
      {showBalancePrompt && previousBalance !== null && onAcceptBalance && onRejectBalance && (
        <PreviousBalancePrompt
          previousBalance={previousBalance}
          onAccept={onAcceptBalance}
          onReject={onRejectBalance}
          currentDate={currentDate}
        />
      )}

      <animated.div 
        style={headerAnimation}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div className="flex flex-wrap gap-2">
          <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
            <SelectTrigger className="w-[180px] hover:shadow-md transition-all duration-300 hover:border-primary/50">
              <div className="flex items-center gap-2">
                {sortOrder === 'newest' || sortOrder === 'oldest' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                <SelectValue placeholder="Ordenar por" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais recente</SelectItem>
              <SelectItem value="oldest">Mais antigo</SelectItem>
              <SelectItem value="highest">Maior valor</SelectItem>
              <SelectItem value="lowest">Menor valor</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 hover:shadow-md transition-all duration-300 hover:border-primary/50">
                <Filter className="w-4 h-4" />
                Filtrar
                {selectedFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1 animate-pulse">
                    {selectedFilters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filtrar por categoria</h4>
                  {selectedFilters.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      Limpar
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedFilters.includes(category.id) ? "default" : "ghost"}
                      size="sm"
                      onClick={() => selectedFilters.includes(category.id) 
                        ? clearFilter(category.id) 
                        : addFilter(category.id)}
                      className="w-full justify-start gap-2 transition-all duration-200 hover:scale-105"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                      <span className="ml-auto text-xs text-muted-foreground">
                        ({transactions.filter(t => t.categoryId === category.id).length})
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {onAddCategory && (
          <CategoryManagementDialog
            categories={categories}
            onAddCategory={onAddCategory}
            onUpdateCategory={onUpdateCategory}
            onDeleteCategory={onDeleteCategory}
          />
        )}
      </animated.div>

      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterTransitions((style, filterId) => {
            const category = categories.find(c => c.id === filterId);
            if (!category) return null;
            return (
              <animated.div key={filterId} style={style}>
                <Badge 
                  variant="secondary" 
                  className="gap-2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 hover:scale-110"
                  onClick={() => clearFilter(filterId)}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                  <span className="ml-1">×</span>
                </Badge>
              </animated.div>
            );
          })}
        </div>
      )}

      {sortedTransactions.length === 0 && !showBalancePrompt ? (
        <animated.div
          style={containerAnimation}
          className="text-muted-foreground text-center py-8"
        >
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8" />
          </div>
          <p className="text-lg font-medium">Nenhuma transação encontrada</p>
          <p className="text-sm">Tente ajustar os filtros ou adicionar novas transações</p>
        </animated.div>
      ) : (
        <>
          <div className="space-y-3">
            {transactionTrail.map((style, index) => {
              const transaction = visibleTransactions[index];
              if (!transaction) return null;
              
              return (
                <animated.div
                  key={transaction.id}
                  style={style}
                  className="relative group"
                >
                  <div
                    className={cn(
                      "p-4 border rounded-xl bg-card/50 backdrop-blur-sm transition-all duration-300 cursor-pointer",
                      "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
                      "hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:-translate-y-1"
                    )}
                    onClick={() => {
                      setEditingTransaction(transaction);
                      setDescription(transaction.description);
                      setAmount(transaction.amount.toString());
                      setType(transaction.type);
                      setCategoryId(transaction.categoryId);
                      setDate(parseISO(transaction.date));
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 w-full">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 transition-transform duration-200 group-hover:scale-125"
                        style={{ 
                          backgroundColor: getCategoryColor(transaction.categoryId),
                          boxShadow: `0 0 8px ${getCategoryColor(transaction.categoryId)}40`
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">{transaction.description}</span>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`font-semibold text-sm ${
                                transaction.type === 'income' ? 'text-income' : 'text-expense'
                              } ${!valuesVisible ? 'blur-md select-none' : ''}`}
                            >
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-hover:rotate-180" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {getCategoryName(transaction.categoryId)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(transaction);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(transaction.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </animated.div>
              );
            })}

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={showAll ? handleCollapse : handleShowAll}
                  disabled={isAnimating}
                  className="gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-primary/50"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Recolher
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Ver todas ({sortedTransactions.length - INITIAL_VISIBLE_COUNT} mais)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {editingTransaction && (
        <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <animated.div style={dialogAnimation}>
              <DialogHeader>
                <DialogTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Editar Transação
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Digite a descrição"
                    className="transition-all duration-200 focus:scale-105"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="transition-all duration-200 focus:scale-105"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
                    <SelectTrigger className="transition-all duration-200 hover:scale-105">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="transition-all duration-200 hover:scale-105">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal transition-all duration-200 hover:scale-105",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => date && setDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingTransaction(null)}
                    className="flex-1 transition-all duration-200 hover:scale-105"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleUpdate} 
                    className="flex-1 transition-all duration-200 hover:scale-105"
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </animated.div>
          </DialogContent>
        </Dialog>
      )}
    </animated.div>
  );
};

export default TransactionsList;
