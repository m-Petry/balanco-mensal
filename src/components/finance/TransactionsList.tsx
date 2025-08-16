import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Edit2, Trash2, X, Plus, Minus, ArrowUpDown, Check, TrendingUp, TrendingDown, Eye, EyeOff, Settings } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Transaction, Category } from "@/types/finance";
import { useToast } from "@/hooks/use-toast";
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
  onDeleteCategory
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
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [valuesVisible, setValuesVisible] = useState(false);
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
    setShowAll(true);
  };

  const handleCollapse = () => {
    setShowAll(false);
  };

  const filteredCategories = categories.filter(cat => cat.type === type);

  const uniqueCategories = [...new Set(transactions.map(t => t.categoryId))]
    .map(categoryId => categories.find(cat => cat.id === categoryId))
    .filter(Boolean) as Category[];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transações do Mês</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setValuesVisible(!valuesVisible)}
              className="h-8 w-8 p-0"
            >
              {valuesVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'newest' | 'oldest' | 'highest' | 'lowest')}>
              <SelectTrigger className="w-[180px] h-8">
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
        </div>
      </CardHeader>

      {/* CardContent vira coluna flex e ocupa todo o espaço disponível; removemos o padding inferior */}
      <CardContent className="flex flex-col flex-1 pb-0">
        {/* Filter Tags */}
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
            
            {/* Selected Filters Display */}
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
                    <span className={`font-bold ${previousBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {Math.abs(previousBalance).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-lg ${previousBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
            {/* Lista ocupa o espaço e empurra os controles para baixo */}
            <div className={cn(
              "space-y-3 flex-1 transition-all duration-500 ease-out",
              showAll && "animate-fade-in"
            )}>
              {visibleTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={cn(
                    "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all duration-300 ease-out",
                    showAll && index >= INITIAL_VISIBLE_COUNT && "animate-fade-in"
                  )}
                  style={{
                    animationDelay: showAll && index >= INITIAL_VISIBLE_COUNT ? `${(index - INITIAL_VISIBLE_COUNT) * 50}ms` : '0ms'
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor(transaction.categoryId) }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{transaction.description}</span>
                        <Badge 
                          variant={transaction.type === 'income' ? 'default' : 'secondary'}
                          className={cn(
                            "cursor-pointer transition-colors",
                            transaction.type === 'income' ? 'bg-income text-white' : 'bg-expense text-white'
                          )}
                          onClick={() => handleCategoryFilter(transaction.categoryId)}
                        >
                          {getCategoryName(transaction.categoryId)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(parseISO(transaction.date), "dd 'de' MMMM", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                  
                   <div className="flex items-center gap-3">
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
              ))}
            </div>

            {/* Controles de expansão - fixos no final */}
            {hasMore && (
              <div className="pt-4 mt-4 border-t bg-card/50 backdrop-blur-sm">
                {showAll ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCollapse}
                    className="w-full flex items-center gap-2 hover:bg-muted/80 transition-all duration-300"
                  >
                    <Minus className="w-4 h-4" />
                    Recolher ({sortedTransactions.length - INITIAL_VISIBLE_COUNT} itens ocultos)
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowAll}
                    className="w-full flex items-center gap-2 hover:bg-muted/80 transition-all duration-300 animate-pulse"
                  >
                    <Plus className="w-4 h-4" />
                    Mostrar tudo ({sortedTransactions.length - INITIAL_VISIBLE_COUNT} mais)
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsList;