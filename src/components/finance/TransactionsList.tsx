import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Edit2, Trash2, X, Plus, Minus, ArrowUpDown, Check, TrendingUp, TrendingDown, ChevronUp, ChevronDown, List, GitCompareArrows } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Transaction, Category } from "@/types/finance";
import { useToast } from "@/hooks/use-toast";
import CategoryManagementDialog from "./CategoryManagementDialog";
import TimelineChart from './TimelineChart';

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
  const [activeTab, setActiveTab] = useState('list');
  const INITIAL_VISIBLE_COUNT = 6;
  const [showAll, setShowAll] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);
  const tagsContainerRef = useRef<HTMLDivElement>(null);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [hasTagOverflow, setHasTagOverflow] = useState(false);
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

  useEffect(() => {
    const checkOverflow = () => {
      const el = tagsContainerRef.current;
      if (el) {
        setHasTagOverflow(el.scrollHeight > el.clientHeight);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [uniqueCategories]);

  useEffect(() => {
    if (!tagsExpanded) {
      const el = tagsContainerRef.current;
      if (el) {
        setHasTagOverflow(el.scrollHeight > el.clientHeight);
      }
    }
  }, [tagsExpanded]);

  return (
    <Card className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="list" className="flex flex-col h-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <CardTitle>Transações do Mês</CardTitle>
            </div>
            <TabsList className="grid w-full grid-cols-2 sm:w-[220px]">
              <TabsTrigger value="list">
                <List className="w-3.5 h-3.5 mr-1.5" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <GitCompareArrows className="w-3.5 h-3.5 mr-1.5" />
                Confronto
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>


        <TabsContent value="list" className="flex flex-col flex-1 mt-0 px-4 sm:px-6 pb-0 pt-2">
          <div className="mb-4">
            <div className="flex flex-wrap items-start gap-2">
              {uniqueCategories.length > 0 && (
                <div
                  ref={tagsContainerRef}
                  className={cn(
                    "flex flex-1 flex-wrap items-center gap-2 transition-all",
                    tagsExpanded ? "max-h-20" : "max-h-9 overflow-hidden"
                  )}
                >
                  {uniqueCategories.map((category) => (
                    <Badge
                      key={category.id}
                      variant={selectedFilters.includes(category.id) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedFilters.includes(category.id)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted",
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
              )}
              {uniqueCategories.length > 0 && hasTagOverflow && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 self-start"
                  onClick={() => setTagsExpanded(prev => !prev)}
                >
                  {tagsExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              )}
              <Select
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value as 'newest' | 'oldest' | 'highest' | 'lowest')}
              >
                <SelectTrigger className="ml-auto w-full sm:w-[180px] h-8">
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

            {/* Selected Filters Display */}
            {selectedFilters.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
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

          {/* Previous Balance Transfer Prompt */}
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
            <div className="flex items-center justify-center flex-1">
                <p className="text-muted-foreground text-center">
                    Nenhuma transação encontrada para este mês.
                </p>
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              {/* Lista de Transações */}
              <div
                className={cn(
                  "space-y-3 sm:space-y-4 transition-all duration-300 ease-in-out flex-1",
                  isAnimating && "opacity-75 scale-[0.99]"
                )}
              >
                {visibleTransactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className={cn(
                      "p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-all duration-200 ease-out",
                      "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4",
                      "hover:shadow-sm hover:border-primary/20",
                      !showAll && index >= INITIAL_VISIBLE_COUNT ? 
                        "animate-in fade-in-0 slide-in-from-top-2 duration-300" : 
                        "animate-in fade-in-0 duration-200"
                    )}
                    style={{
                      animationDelay: !showAll && index >= INITIAL_VISIBLE_COUNT ? 
                        `${(index - INITIAL_VISIBLE_COUNT) * 50}ms` : '0ms'
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 w-full">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getCategoryColor(transaction.categoryId) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium truncate">{transaction.description}</span>
                          <Badge
                            variant="outline"
                            className="cursor-pointer transition-colors whitespace-nowrap"
                            onClick={() => handleCategoryFilter(transaction.categoryId)}
                            style={{ borderColor: getCategoryColor(transaction.categoryId) }}
                          >
                            {getCategoryName(transaction.categoryId)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(parseISO(transaction.date), "dd 'de' MMMM", { locale: ptBR })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 w-full sm:w-auto flex-shrink-0">
                      <span
                        className={`font-semibold transition-all duration-300 ${
                          transaction.type === 'income' ? 'text-income' : 'text-expense'
                        } ${!valuesVisible ? 'blur-md select-none' : ''}`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toFixed(2).replace('.', ',')}
                      </span>

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
                                    <RadioGroupItem value="income" id={`edit-income-${transaction.id}`} />
                                    <Label htmlFor={`edit-income-${transaction.id}`} className="text-income font-medium">Receita</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="expense" id={`edit-expense-${transaction.id}`} />
                                    <Label htmlFor={`edit-expense-${transaction.id}`} className="text-expense font-medium">Despesa</Label>
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
                                      open={isCategoryManagementOpen}
                                      onOpenChange={setIsCategoryManagementOpen}
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
                ))}
              </div>

                {/* Controles de expansão minimalistas */}
                {(hasMore || showAll) && (
                  <div className="mt-auto flex justify-center pt-2">
                    {showAll ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCollapse}
                        disabled={isAnimating}
                        className={cn(
                          "group relative px-4 py-2 h-auto",
                          "text-muted-foreground hover:text-foreground",
                          "transition-all duration-200 ease-out",
                          "hover:bg-muted/50",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <ChevronUp className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            isAnimating && "animate-spin",
                          )} />
                          <span className="text-sm font-medium">
                            {isAnimating ? "Recolhendo..." : "Recolher"}
                          </span>
                        </div>
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShowAll}
                        disabled={isAnimating}
                        className={cn(
                          "group relative px-4 py-2 h-auto",
                          "text-primary hover:text-primary/80",
                          "transition-all duration-200 ease-out",
                          "hover:bg-primary/5",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {isAnimating ? "Carregando..." : `Ver todas (${sortedTransactions.length - INITIAL_VISIBLE_COUNT} mais)`}
                          </span>
                          <ChevronDown className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            isAnimating && "animate-spin",
                          )} />
                        </div>
                      </Button>
                    )}
                  </div>
                )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="timeline" className="flex flex-col flex-1 mt-0 p-4 sm:p-6 pt-4">
          <TimelineChart 
            transactions={sortedTransactions} 
            categories={categories} 
            valuesVisible={valuesVisible} 
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default TransactionsList;
