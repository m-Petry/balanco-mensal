
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
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';

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

  // Framer Motion spring configuration
  const springConfig = {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 0.8
  };

  // Motion variants for animations
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

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95,
      filter: "blur(4px)"
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: springConfig
    },
    exit: { 
      opacity: 0, 
      y: -20,
      scale: 0.95,
      filter: "blur(4px)",
      transition: { duration: 0.2 }
    }
  };

  const toggleButtonVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.3,
        ...springConfig
      }
    }
  };

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
    <div className="space-y-6">
      {showBalancePrompt && previousBalance !== null && onAcceptBalance && onRejectBalance && (
        <PreviousBalancePrompt
          previousBalance={previousBalance}
          onAccept={onAcceptBalance}
          onReject={onRejectBalance}
          currentDate={currentDate}
        />
      )}

      <motion.div 
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig}
      >
        <div className="flex flex-wrap gap-2">
          <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
            <SelectTrigger className="w-[180px]">
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
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtrar
                {selectedFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
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
                    <motion.div
                      key={category.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={selectedFilters.includes(category.id) ? "default" : "ghost"}
                        size="sm"
                        onClick={() => selectedFilters.includes(category.id) 
                          ? clearFilter(category.id) 
                          : addFilter(category.id)}
                        className="w-full justify-start gap-2"
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
                    </motion.div>
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
      </motion.div>

      {selectedFilters.length > 0 && (
        <motion.div 
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={springConfig}
        >
          {selectedFilters.map(filterId => {
            const category = categories.find(c => c.id === filterId);
            if (!category) return null;
            return (
              <motion.div
                key={filterId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                transition={springConfig}
              >
                <Badge 
                  variant="secondary" 
                  className="gap-2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => clearFilter(filterId)}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                  <span className="ml-1">×</span>
                </Badge>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {sortedTransactions.length === 0 && !showBalancePrompt ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground text-center py-8"
        >
          Nenhuma transação encontrada para este mês.
        </motion.div>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {visibleTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="relative"
                  whileHover={{ 
                    scale: 1.02,
                    y: -2,
                    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <div
                    className={cn(
                      "p-4 border rounded-lg bg-card transition-all duration-200 cursor-pointer",
                      "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
                      "hover:border-primary/20 hover:bg-card/80"
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
                      <motion.div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getCategoryColor(transaction.categoryId) }}
                        whileHover={{ scale: 1.2 }}
                        transition={springConfig}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">{transaction.description}</span>
                          <div className="flex items-center space-x-2">
                            <motion.span
                              className={`font-semibold text-sm ${
                                transaction.type === 'income' ? 'text-income' : 'text-expense'
                              } ${!valuesVisible ? 'blur-md select-none' : ''}`}
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              transition={springConfig}
                            >
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </motion.span>
                            <motion.div
                              animate={{ rotate: 0 }}
                              whileHover={{ rotate: 180 }}
                              transition={springConfig}
                            >
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </motion.div>
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
                      <div className="flex items-center gap-2">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(transaction);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(transaction.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {hasMore && (
              <motion.div
                variants={toggleButtonVariants}
                initial="hidden"
                animate="visible"
                className="flex justify-center pt-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    onClick={showAll ? handleCollapse : handleShowAll}
                    disabled={isAnimating}
                    className="gap-2 transition-all duration-200"
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
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {editingTransaction && (
          <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={springConfig}
              >
                <DialogHeader>
                  <DialogTitle>Editar Transação</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Digite a descrição"
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
                      <SelectTrigger>
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
                      <SelectTrigger>
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
                            "w-full justify-start text-left font-normal",
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
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdate} className="flex-1">
                      Salvar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionsList;
