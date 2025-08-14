
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CalendarIcon, ChevronLeft, ChevronRight, DollarSign, Lock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import AddTransactionDialog from "@/components/finance/AddTransactionDialog";
import CategoryManagementDialog from "@/components/finance/CategoryManagementDialog";
import { Category, Transaction } from "@/types/finance";

interface HeaderProps {
  currentDate: { year: number; month: number };
  categories: Category[];
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onSetMonth: (year: number, month: number) => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
  onLock?: () => void;
}

const Header = ({ 
  currentDate, 
  categories,
  onNavigateMonth, 
  onSetMonth,
  onAddTransaction,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onLock
}: HeaderProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const currentDateObj = new Date(currentDate.year, currentDate.month - 1);
  const monthName = format(currentDateObj, "MMMM yyyy", { locale: ptBR });
  const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onSetMonth(date.getFullYear(), date.getMonth() + 1);
      setCalendarOpen(false);
    }
  };

  const handleLock = () => {
    if (onLock) {
      onLock();
    }
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Finanças Pessoais</h1>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onNavigateMonth('prev')}
              className="h-9 w-9"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "min-w-[150px] justify-start text-left font-normal",
                    "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {capitalizedMonthName}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={currentDateObj}
                  onSelect={handleCalendarSelect}
                  defaultMonth={currentDateObj}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="icon"
              onClick={() => onNavigateMonth('next')}
              className="h-9 w-9"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <AddTransactionDialog 
              categories={categories}
              onAddTransaction={onAddTransaction}
            />
            <CategoryManagementDialog
              categories={categories}
              onAddCategory={onAddCategory}
              onUpdateCategory={onUpdateCategory}
              onDeleteCategory={onDeleteCategory}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleLock}
              className="h-9 w-9"
              title="Bloquear aplicação"
            >
              <Lock className="w-4 h-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
