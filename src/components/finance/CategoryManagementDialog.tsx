import { useState, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings, Plus, Trash2, Edit2 } from "lucide-react";
import { Category } from "@/types/finance";
import { useToast } from "@/hooks/use-toast";

interface CategoryManagementDialogProps {
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
  trigger?: ReactNode;
}

const initialColors = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#84cc16",
  "#64748b",
  "#059669",
  "#0891b2",
];

const CategoryManagementDialog = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  trigger
}: CategoryManagementDialogProps) => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [availableColors, setAvailableColors] = useState(initialColors);
  const [customColor, setCustomColor] = useState("#000000");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: initialColors[0],
    type: "expense" as "income" | "expense",
  });
  const { toast } = useToast();
  const editColorRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para a categoria",
        variant: "destructive"
      });
      return;
    }

    onAddCategory({
      name: newCategory.name.trim(),
      color: newCategory.color,
      type: newCategory.type
    });

    setNewCategory({
      name: "",
      color: availableColors[0],
      type: "expense",
    });

    toast({
      title: "Sucesso",
      description: "Categoria adicionada com sucesso!"
    });
  };

  const handleUpdateCategory = (id: string, field: keyof Category, value: string) => {
    onUpdateCategory(id, { [field]: value });
    
    if (field === 'name') {
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!"
      });
    }
  };

  const handleDeleteCategory = (id: string) => {
    onDeleteCategory(id);
    toast({
      title: "Sucesso",
      description: "Categoria removida com sucesso!"
    });
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add New Category */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Categoria
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  placeholder="Nome da categoria"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tipo</Label>
                <RadioGroup 
                  value={newCategory.type} 
                  onValueChange={(value: 'income' | 'expense') => 
                    setNewCategory(prev => ({ ...prev, type: value }))
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="income" 
                      id="new-income" 
                      className="border-green-500 text-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                    />
                    <Label htmlFor="new-income" className="text-sm">Receita</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="expense" 
                      id="new-expense" 
                      className="border-red-500 text-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:text-white"
                    />
                    <Label htmlFor="new-expense" className="text-sm">Despesa</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      newCategory.color === color ? "border-foreground" : "border-muted"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() =>
                      setNewCategory((prev) => ({ ...prev, color }))
                    }
                  />
                ))}
                <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center text-muted-foreground"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 space-y-2">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-full h-10 cursor-pointer border rounded"
                    />
                    <Button
                      className="w-full"
                      onClick={() => {
                        setAvailableColors((prev) =>
                          prev.includes(customColor)
                            ? prev
                            : [...prev, customColor]
                        );
                        setNewCategory((prev) => ({
                          ...prev,
                          color: customColor,
                        }));
                        setColorPickerOpen(false);
                      }}
                    >
                      Confirmar
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button onClick={handleAddCategory} className="w-full">
              Adicionar Categoria
            </Button>
          </div>

          <Separator />

          {/* Existing Categories */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-6">
              {/* Income Categories */}
              <div>
                <h3 className="font-semibold text-income mb-3">Categorias de Receita</h3>
                <div className="space-y-2">
                  {incomeCategories.map((category) => (
                    <div key={category.id} className="flex items-center gap-3 p-2 border rounded">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      
                      {editingId === category.id ? (
                        <Input
                          value={category.name}
                          onChange={(e) => handleUpdateCategory(category.id, 'name', e.target.value)}
                          onBlur={() => setEditingId(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                          className="flex-1"
                          autoFocus
                        />
                      ) : (
                        <span className="flex-1">{category.name}</span>
                      )}
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(category.id)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <Select
                        value={category.color}
                        onValueChange={(color) => {
                          if (color === "custom") {
                            editColorRefs.current[category.id]?.click();
                          } else {
                            handleUpdateCategory(category.id, "color", color);
                          }
                        }}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableColors.map((color) => (
                            <SelectItem key={color} value={color}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                              </div>
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full border flex items-center justify-center">
                                <Plus className="w-3 h-3" />
                              </div>
                              <span>Personalizar</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <input
                        type="color"
                        ref={(el) => (editColorRefs.current[category.id] = el)}
                        className="sr-only"
                        onChange={(e) => {
                          const color = e.target.value;
                          handleUpdateCategory(category.id, "color", color);
                          setAvailableColors((prev) =>
                            prev.includes(color) ? prev : [...prev, color]
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense Categories */}
              <div>
                <h3 className="font-semibold text-expense mb-3">Categorias de Despesa</h3>
                <div className="space-y-2">
                  {expenseCategories.map((category) => (
                    <div key={category.id} className="flex items-center gap-3 p-2 border rounded">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      
                      {editingId === category.id ? (
                        <Input
                          value={category.name}
                          onChange={(e) => handleUpdateCategory(category.id, 'name', e.target.value)}
                          onBlur={() => setEditingId(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                          className="flex-1"
                          autoFocus
                        />
                      ) : (
                        <span className="flex-1">{category.name}</span>
                      )}
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(category.id)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <Select
                        value={category.color}
                        onValueChange={(color) => {
                          if (color === "custom") {
                            editColorRefs.current[category.id]?.click();
                          } else {
                            handleUpdateCategory(category.id, "color", color);
                          }
                        }}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableColors.map((color) => (
                            <SelectItem key={color} value={color}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                              </div>
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full border flex items-center justify-center">
                                <Plus className="w-3 h-3" />
                              </div>
                              <span>Personalizar</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <input
                        type="color"
                        ref={(el) => (editColorRefs.current[category.id] = el)}
                        className="sr-only"
                        onChange={(e) => {
                          const color = e.target.value;
                          handleUpdateCategory(category.id, "color", color);
                          setAvailableColors((prev) =>
                            prev.includes(color) ? prev : [...prev, color]
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManagementDialog;
