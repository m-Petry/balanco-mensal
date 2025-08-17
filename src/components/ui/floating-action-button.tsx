import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const fabVariants = cva(
  "fixed z-[60] flex items-center justify-center rounded-full shadow-lg transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-xl hover:scale-105 active:scale-95",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-xl hover:scale-105 active:scale-95",
        outline: "border-2 border-primary bg-background/80 backdrop-blur-sm text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-xl hover:scale-105 active:scale-95",
        ghost: "bg-background/60 backdrop-blur-sm text-foreground hover:bg-background/80 hover:shadow-xl hover:scale-105 active:scale-95",
      },
      size: {
        sm: "h-12 w-12",
        md: "h-14 w-14",
        lg: "h-16 w-16",
        xl: "h-20 w-20",
      },
      position: {
        "bottom-right": "bottom-24 right-4",
        "bottom-left": "bottom-24 left-4",
        "top-right": "top-24 right-4",
        "top-left": "top-24 left-4",
        "center-right": "right-4 top-1/2 -translate-y-1/2",
        "center-left": "left-4 top-1/2 -translate-y-1/2",
      },
      opacity: {
        full: "opacity-100",
        faded: "opacity-60 hover:opacity-100",
        subtle: "opacity-40 hover:opacity-100",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      position: "bottom-right",
      opacity: "full",
    },
  }
);

export interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fabVariants> {
  icon?: React.ReactNode;
  label?: string;
  showLabel?: boolean;
  pulse?: boolean;
  glass?: boolean;
  ripple?: boolean;
}

const FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  FloatingActionButtonProps
>(
  (
    {
      className,
      variant,
      size,
      position,
      opacity,
      icon,
      label,
      showLabel = false,
      pulse = false,
      glass = false,
      ripple = true,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const newRipple = {
          id: Date.now(),
          x,
          y,
        };
        
        setRipples(prev => [...prev, newRipple]);
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 600);
      }
      
      onClick?.(event);
    };

    return (
      <button
        className={cn(
          fabVariants({ variant, size, position, opacity, className }),
          glass && "backdrop-blur-md bg-background/20 border border-border/50",
          pulse && "animate-pulse",
          showLabel && "group"
        )}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple Effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 animate-ripple"
            style={{
              left: ripple.x - 20,
              top: ripple.y - 20,
              width: 40,
              height: 40,
            }}
          />
        ))}
        
        {icon && (
          <div className="flex items-center justify-center relative z-10">
            {icon}
          </div>
        )}
        {children}
        
        {/* Tooltip/Label */}
        {label && showLabel && (
          <div className="absolute right-full mr-3 px-2 py-1 text-xs font-medium text-foreground bg-background/90 backdrop-blur-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            {label}
            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-0 h-0 border-l-4 border-l-background/90 border-t-2 border-t-transparent border-b-2 border-b-transparent transform translate-x-full"></div>
          </div>
        )}
      </button>
    );
  }
);

FloatingActionButton.displayName = "FloatingActionButton";

export { FloatingActionButton, fabVariants };
