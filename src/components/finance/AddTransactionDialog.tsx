import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { getCurrencyInputValue } from "@/utils/currency";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Settings } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Transaction, Category } from "@/types/finance";
import { useToast } from "@/hooks/use-toast";
import CategoryManagementDialog from "./CategoryManagementDialog";

interface AddTransactionDialogProps {
  categories: Category[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onAddCategory?: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory?: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory?: (id: string) => void;
}

const AddTransactionDialog = ({ categories, onAddTransaction, onAddCategory, onUpdateCategory, onDeleteCategory }: AddTransactionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const { toast } = useToast();

  const filteredCategories = categories.filter(cat => cat.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim() || !amount || !categoryId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const numAmount = getCurrencyInputValue(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Erro", 
        description: "Digite um valor válido",
        variant: "destructive"
      });
      return;
    }

    onAddTransaction({
      description: description.trim(),
      amount: numAmount,
      type,
      categoryId,
      date: format(date, 'yyyy-MM-dd')
    });

    // Reset form
    setDescription('');
    setAmount('');
    setCategoryId('');
    setDate(new Date());
    setOpen(false);

    toast({
      title: "Sucesso",
      description: `${type === 'income' ? 'Receita' : 'Despesa'} adicionada com sucesso!`
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Tipo</Label>
            <RadioGroup value={type} onValueChange={(value: 'income' | 'expense') => {
              setType(value);
              setCategoryId(''); // Reset category when type changes
            }}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-income font-medium">Receita</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-expense font-medium">Despesa</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder="Ex: Salário, Supermercado, Combustível..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <CurrencyInput
              id="amount"
              value={amount}
              onChange={setAmount}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Categoria *</Label>
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
                <SelectValue placeholder="Selecione uma categoria" />
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

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionDialog;