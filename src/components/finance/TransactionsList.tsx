import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { Transaction, Category } from "@/types/finance";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Edit2, X, Check, TrendingUp, TrendingDown } from "lucide-react";
import { parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import CategoryManagementDialog from "./CategoryManagementDialog";


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

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDescription(transaction.description);
    setAmount(transaction.amount.toString());
    setType(transaction.type);
    setCategoryId(transaction.categoryId);
    setDate(parseISO(transaction.date));
  };

  const handleUpdate = () => {
    if (!editingTransaction || !description.trim() || !amount || !categoryId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Erro",
        description: "Digite um valor válido",
        variant: "destructive"
      });
      return;
    }

    onUpdateTransaction(editingTransaction.id, {
      description: description.trim(),
      amount: numAmount,
      type,
      categoryId,
      date: format(date, 'yyyy-MM-dd')
    });

    setEditingTransaction(null);
    toast({
      title: "Sucesso",
      description: "Transação atualizada com sucesso!"
    });
  };

  const handleDelete = (id: string) => {
    onDeleteTransaction(id);
    toast({
      title: "Sucesso",
      description: "Transação excluída com sucesso!"
    });
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Categoria não encontrada';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.color || '#64748b';
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedFilters(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
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

  const uniqueCategories = [...new Set(transactions.map(t => t.categoryId))]
    .map(categoryId => categories.find(cat => cat.id === categoryId))
    .filter(Boolean) as Category[];

  // Animation variants for list items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 100 } },
    exit: { opacity: 0, y: -20 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle>Transações do Mês</CardTitle>
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as 'newest' | 'oldest' | 'highest' | 'lowest')}
          >
            <SelectTrigger className="w-full sm:w-[180px] h-8">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigos</SelectItem>
              <SelectItem value="highest">Maior valor</SelectItem>
              <SelectItem value="lowest">Menor valor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 pb-0">
        {uniqueCategories.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {uniqueCategories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedFilters.includes(category.id) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedFilters.includes(category.id)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => handleCategoryFilter(category.id)}
                  style={{
                    backgroundColor: selectedFilters.includes(category.id) ? category.color : undefined,
                    borderColor: category.color
                  }}
                >
                  {category.name}
                </Badge>
              ))}
            </div>

            {selectedFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                {selectedFilters.map((filterId) => {
                  const category = categories.find(cat => cat.id === filterId);
                  return category ? (
                    <Badge
                      key={filterId}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => clearFilter(filterId)}
                    >
                      {category.name}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ) : null;
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={clearAllFilters}
                >
                  Limpar todos
                </Button>
              </div>
            )}
          </div>
        )}

        {showBalancePrompt && previousBalance !== null && onAcceptBalance && onRejectBalance && (
          <div className="border rounded-lg p-4 bg-primary/5 border-primary/20 mb-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                {previousBalance >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Saldo do mês anterior</span>
                    <Badge variant="outline" className="text-xs">
                      Transferência
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Saldo {previousBalance >= 0 ? 'positivo' : 'negativo'} de{' '}
                    <span className={`font-bold ${previousBalance >= 0 ? 'text-green-600' : 'text-red-600'} ${!valuesVisible ? 'blur-sm select-none' : ''}`}>
                      R$ {Math.abs(previousBalance).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-lg ${previousBalance >= 0 ? 'text-green-600' : 'text-red-600'} ${!valuesVisible ? 'blur-sm select-none' : ''}`}>
                  {previousBalance >= 0 ? '+' : '-'} R$ {Math.abs(previousBalance).toFixed(2).replace('.', ',')}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRejectBalance()}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const transaction: Omit<Transaction, 'id'> = {
                        description: `Saldo transferido do mês anterior`,
                        amount: Math.abs(previousBalance),
                        type: previousBalance >= 0 ? 'income' : 'expense',
                        categoryId: '', // Will be set by the handler
                        date: `${currentDate.year}-${String(currentDate.month).padStart(2, '0')}-01`
                      };
                      onAcceptBalance(transaction);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {sortedTransactions.length === 0 && !showBalancePrompt ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma transação encontrada para este mês.
          </p>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              <AnimatePresence initial={false}>
                {visibleTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="relative"
                  >
                    <div
                      className={cn(
                        "p-4 border rounded-lg bg-card hover:shadow-md transition-all duration-200 cursor-pointer",
                        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
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
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getCategoryColor(transaction.categoryId) }}
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
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(transaction)}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Editar Transação</DialogTitle>
                              </DialogHeader>

                              <div className="space-y-6">
                                <div className="space-y-3">
                                  <Label>Tipo</Label>
                                  <RadioGroup value={type} onValueChange={(value: 'income' | 'expense') => {
                                    setType(value);
                                    setCategoryId('');
                                  }}>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="income" id="edit-income" />
                                      <Label htmlFor="edit-income" className="text-income font-medium">Receita</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="expense" id="edit-expense" />
                                      <Label htmlFor="edit-expense" className="text-expense font-medium">Despesa</Label>
                                    </div>
                                  </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="edit-description">Descrição</Label>
                                  <Input
                                    id="edit-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="edit-amount">Valor</Label>
                                  <Input
                                    id="edit-amount"
                                    type="text"
                                    value={amount}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/[^0-9.,]/g, '');
                                      setAmount(value);
                                    }}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label>Categoria</Label>
                                    {onAddCategory && onUpdateCategory && onDeleteCategory && (
                                      <CategoryManagementDialog
                                        categories={categories}
                                        onAddCategory={onAddCategory}
                                        onUpdateCategory={onUpdateCategory}
                                        onDeleteCategory={onDeleteCategory}
                                      />
                                    )}
                                  </div>
                                  <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {filteredCategories.map((category) => (
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
                                        {date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
                                        initialFocus
                                        className="pointer-events-auto"
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
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {hasMore && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="group px-4 py-2 h-auto text-primary hover:text-primary/80 transition-all duration-200 hover:bg-primary/5"
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                    <span className="text-sm font-medium">
                      {showAll ? 'Recolher' : `Ver todas (${sortedTransactions.length - INITIAL_VISIBLE_COUNT} mais)`}
                    </span>
                  </div>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsList;