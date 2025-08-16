
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CalendarIcon, ChevronLeft, ChevronRight, DollarSign, Lock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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

  const handleCalendarSelect = (date: Date | null) => {
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
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        {/* Mobile Layout */}
        <div className="flex flex-col gap-3 sm:hidden">
          {/* Top Row - Logo and Essential Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold text-foreground">Finanças</h1>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={handleLock}
                className="h-8 w-8"
                title="Bloquear aplicação"
              >
                <Lock className="w-4 h-4" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
          
          {/* Bottom Row - Month Navigation and Actions */}
          <div className="flex items-center justify-between">
            {/* Month Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onNavigateMonth('prev')}
                className="h-8 w-8"
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>

              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-xs px-2 h-8 min-w-[100px] justify-start"
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {format(currentDateObj, "MMM/yy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <div className="p-3">
                    <DatePicker
                      selected={currentDateObj}
                      onChange={handleCalendarSelect}
                      locale="pt-BR"
                      showMonthYearPicker
                      dateFormat="MM/yyyy"
                      inline
                      className="bg-background text-foreground"
                    />
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="icon"
                onClick={() => onNavigateMonth('next')}
                className="h-8 w-8"
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <AddTransactionDialog 
                categories={categories}
                onAddTransaction={onAddTransaction}
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
              />
              <CategoryManagementDialog
                categories={categories}
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
              />
            </div>
          </div>
        </div>

        {/* Desktop Layout - Hidden on Mobile */}
        <div className="hidden sm:flex items-center justify-between">
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
                <div className="p-3">
                  <DatePicker
                    selected={currentDateObj}
                    onChange={handleCalendarSelect}
                    locale="pt-BR"
                    showMonthYearPicker
                    dateFormat="MM/yyyy"
                    inline
                    className="bg-background text-foreground"
                  />
                </div>
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
              onAddCategory={onAddCategory}
              onUpdateCategory={onUpdateCategory}
              onDeleteCategory={onDeleteCategory}
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
