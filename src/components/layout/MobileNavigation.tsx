import { Button } from "@/components/ui/button";
import { BarChart3, CreditCard, TrendingUp } from "lucide-react";

interface MobileNavigationProps {
  activeTab: 'summary' | 'transactions' | 'charts';
  onTabChange: (tab: 'summary' | 'transactions' | 'charts') => void;
}

const MobileNavigation = ({ activeTab, onTabChange }: MobileNavigationProps) => {
  const tabs = [
    {
      id: 'summary' as const,
      label: 'Resumo',
      icon: BarChart3,
    },
    {
      id: 'transactions' as const,
      label: 'Transações',
      icon: CreditCard,
    },
    {
      id: 'charts' as const,
      label: 'Gráficos',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 sm:hidden">
      <div className="grid grid-cols-3 gap-1 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col gap-1 h-auto py-2 px-1 ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-normal">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;