
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link } from "react-router-dom";
import { CalendarIcon, ChevronLeft, ChevronRight, PiggyBank, Lock, Eye, EyeOff, Settings, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import AddTransactionDialog from "@/components/finance/AddTransactionDialog";
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
  valuesVisible: boolean;
  onToggleValues: () => void;
  onOpenCategoryManager: () => void;
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
  onLock,
  valuesVisible,
  onToggleValues,
  onOpenCategoryManager
}: HeaderProps) => {
  const [selectedDate, setSelectedDate] = React.useState(new Date(currentDate.year, currentDate.month - 1, 1));

  React.useEffect(() => {
    // When the month/year context changes (e.g., via arrow buttons), update the local selected date
    // to the first day of the new month to keep the calendar view consistent.
    setSelectedDate(new Date(currentDate.year, currentDate.month - 1, 1));
  }, [currentDate]);


  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      // Update the local state to show the selected day in the calendar
      setSelectedDate(date);
      // If the month or year is different, update the global context
      if (date.getFullYear() !== currentDate.year || date.getMonth() + 1 !== currentDate.month) {
        onSetMonth(date.getFullYear(), date.getMonth() + 1);
      }
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
        <div className="flex flex-col gap-2 sm:hidden">
          {/* Top Row - Logo and Essential Actions */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2" title="Início">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-primary-foreground" />
              </div>
            </Link>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={onToggleValues}
                className="h-7 w-7"
                title={valuesVisible ? "Ocultar valores" : "Mostrar valores"}
              >
                {valuesVisible ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleLock}
                className="h-7 w-7"
                title="Bloquear aplicação"
              >
                <Lock className="w-3.5 h-3.5" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
          
          {/* Bottom Row - Month Navigation and Actions */}
          <div className="flex items-center justify-between gap-2">
            {/* Month Navigation */}
            <div className="flex items-center gap-1 flex-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onNavigateMonth('prev')}
                className="h-7 w-7 flex-shrink-0"
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-xs px-2 h-7 flex-1 min-w-0 justify-center"
                  >
                    <CalendarIcon className="mr-1 h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{format(selectedDate, "MMM/yy", { locale: ptBR })}</span>
                  </Button>
                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="center">
                                    <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleCalendarSelect}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="icon"
                onClick={() => onNavigateMonth('next')}
                className="h-7 w-7 flex-shrink-0"
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="outline" size="icon" onClick={onOpenCategoryManager} className="h-7 w-7">
                <Settings className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Hidden on Mobile */}
        <div className="hidden sm:flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" title="Início">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-primary-foreground" />
            </div>
          </Link>

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

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "min-w-[150px] justify-start text-left font-normal",
                    "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "MMMM yyyy", { locale: ptBR }).replace(/^./, (c) => c.toUpperCase())}
                </Button>
              </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="center">
                                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleCalendarSelect}
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
            <div className="hidden lg:block">
              <AddTransactionDialog
                categories={categories}
                onAddTransaction={onAddTransaction}
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
              />
            </div>
            <div className="block lg:hidden">
              <AddTransactionDialog
                categories={categories}
                onAddTransaction={onAddTransaction}
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
                trigger={
                  <Button variant="outline" size="icon" className="h-9 w-9" title="Adicionar Transação">
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
            <Button variant="outline" size="icon" onClick={onOpenCategoryManager} className="h-9 w-9" title="Gerenciar Categorias">
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleValues}
              className="h-9 w-9"
              title={valuesVisible ? "Ocultar valores" : "Mostrar valores"}
            >
              {valuesVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
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
