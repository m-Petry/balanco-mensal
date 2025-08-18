import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const navigationVariants = cva(
  "fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border/50 z-50",
  {
    variants: {
      variant: {
        default: "bg-background/90",
        glass: "bg-background/20 backdrop-blur-xl",
        dark: "bg-gray-900/95 backdrop-blur-xl",
      },
      size: {
        sm: "h-16",
        md: "h-20",
        lg: "h-24",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number;
}

export interface ModernNavigationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof navigationVariants> {
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  showLabels?: boolean;
  centered?: boolean;
  fab?: {
    icon: React.ReactNode;
    onClick: () => void;
    label?: string;
  };
}

const ModernNavigation = React.forwardRef<HTMLDivElement, ModernNavigationProps>(
  (
    {
      className,
      variant,
      size,
      items,
      activeItem,
      onItemClick,
      showLabels = true,
      centered = false,
      fab,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(navigationVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <div className="relative h-full">
          {/* Navigation Items */}
          {fab && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10">
              <button
                onClick={fab.onClick}
                className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 active:scale-95"
                title={fab.label}
              >
                {fab.icon}
              </button>
            </div>
          )}
          <div className={cn(
            "flex items-center justify-around h-full px-4",
            centered && "justify-center gap-8"
          )}>
            {items.map((item, index) => {
              const isActive = activeItem === item.id;
              const isFabPosition = fab && index === Math.floor(items.length / 2);
              
              return (
                <React.Fragment key={item.id}>
                  {/* FAB in center if specified */}
                  {isFabPosition && fab && (
                    <div className="w-16 h-16" /> // Placeholder to maintain spacing
                  )}
                  
                  {/* Navigation Item */}
                  <button
                    onClick={() => onItemClick?.(item)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 relative group",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    {/* Icon */}
                    <div className="relative">
                      <div className={cn(
                        "transition-all duration-300",
                        isActive ? "scale-110" : "group-hover:scale-105"
                      )}>
                        {item.icon}
                      </div>
                      
                      {/* Badge */}
                      {item.badge && item.badge > 0 && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10 flex justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {item.badge > 99 ? "99+" : item.badge}
                        </div>
                      )}
                    </div>
                    
                    {/* Label */}
                    {showLabels && (
                      <span className={cn(
                        "text-xs font-medium transition-all duration-300",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {item.label}
                      </span>
                    )}
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 w-1 h-1 bg-primary rounded-full" />
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

ModernNavigation.displayName = "ModernNavigation";

export { ModernNavigation, navigationVariants };
