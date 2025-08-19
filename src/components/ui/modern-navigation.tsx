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
    const renderNavItem = (item: NavigationItem) => {
      const isActive = activeItem === item.id;
      return (
        <button
          key={item.id}
          onClick={() => onItemClick?.(item)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 relative group",
            isActive
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          <div className="relative">
            <div
              className={cn(
                "transition-all duration-300",
                isActive ? "scale-110" : "group-hover:scale-105"
              )}
            >
              {item.icon}
            </div>
            {item.badge && item.badge > 0 && (
              <div className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                {item.badge > 99 ? "99+" : item.badge}
              </div>
            )}
          </div>
          {showLabels && (
            <span
              className={cn(
                "text-xs font-medium transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}
            >
              {item.label}
            </span>
          )}
          {isActive && (
            <div className="absolute bottom-0 h-1 w-1 rounded-full bg-primary" />
          )}
        </button>
      );
    };
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
          <div className="flex h-full items-center justify-between px-2">
            {/* Left Items */}
            <div className="flex flex-1 items-center justify-around">
              {items.slice(0, 2).map(renderNavItem)}
            </div>

            {/* FAB Placeholder */}
            {fab && <div className="w-20 flex-shrink-0" />}

            {/* Right Items */}
            <div className="flex flex-1 items-center justify-around">
              {items.slice(2).map(renderNavItem)}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ModernNavigation.displayName = "ModernNavigation";

export { ModernNavigation, navigationVariants };
