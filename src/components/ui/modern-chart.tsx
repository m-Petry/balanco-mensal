import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chartVariants = cva(
  "relative w-full h-full transition-all duration-500 ease-out",
  {
    variants: {
      variant: {
        default: "bg-card border border-border rounded-lg",
        glass: "bg-background/20 backdrop-blur-md border border-border/50 rounded-xl",
        gradient: "bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-xl",
      },
      size: {
        sm: "h-48",
        md: "h-64",
        lg: "h-80",
        xl: "h-96",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

export interface ModernChartProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chartVariants> {
  data: ChartDataPoint[];
  title?: string;
  subtitle?: string;
  type?: 'bar' | 'pie' | 'line' | 'area';
  animated?: boolean;
  showValues?: boolean;
  showPercentages?: boolean;
  maxValue?: number;
}

const ModernChart = React.forwardRef<HTMLDivElement, ModernChartProps>(
  (
    {
      className,
      variant,
      size,
      data,
      title,
      subtitle,
      type = 'bar',
      animated = true,
      showValues = true,
      showPercentages = false,
      maxValue,
      ...props
    },
    ref
  ) => {
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
    
    // Calculate max value if not provided
    const calculatedMaxValue = maxValue || Math.max(...data.map(d => d.value));
    
    // Calculate percentages
    const totalValue = data.reduce((sum, d) => sum + d.value, 0);
    const dataWithPercentages = data.map(d => ({
      ...d,
      percentage: totalValue > 0 ? (d.value / totalValue) * 100 : 0
    }));

    const renderBarChart = () => (
      <div className="flex items-end justify-between h-full p-4 gap-2">
        {dataWithPercentages.map((item, index) => {
          const height = (item.value / calculatedMaxValue) * 100;
          const isHovered = hoveredIndex === index;
          
          return (
            <div
              key={index}
              className="flex flex-col items-center flex-1 relative group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Bar */}
              <div className="relative w-full flex-1 flex items-end">
                <div
                  className={cn(
                    "w-full rounded-t-lg transition-all duration-500 ease-out relative overflow-hidden",
                    animated && "animate-in slide-in-from-bottom-2 duration-700",
                    isHovered && "scale-105 shadow-lg"
                  )}
                  style={{
                    height: `${height}%`,
                    backgroundColor: item.color,
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Value label */}
                  {showValues && (isHovered || height > 20) && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-foreground bg-background/90 px-2 py-1 rounded shadow-sm">
                      R$ {item.value.toFixed(2).replace('.', ',')}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Label */}
              <div className="mt-2 text-xs text-muted-foreground text-center font-medium">
                {item.label}
              </div>
              
              {/* Percentage */}
              {showPercentages && (
                <div className="text-xs text-muted-foreground/70">
                  {item.percentage?.toFixed(1)}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    );

    const renderPieChart = () => {
      const radius = 80;
      const centerX = 50;
      const centerY = 50;
      
      let currentAngle = 0;
      const paths = dataWithPercentages.map((item, index) => {
        const angle = (item.percentage || 0) * 3.6; // Convert percentage to degrees
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle += angle;
        
        const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
        const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
        const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
        const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
        
        const largeArcFlag = angle > 180 ? 1 : 0;
        
        const pathData = [
          `M ${centerX} ${centerY}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          'Z'
        ].join(' ');
        
        return { pathData, item, index };
      });

      return (
        <div className="flex items-center justify-center h-full p-4">
          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 100 100" className="transform -rotate-90">
              {paths.map(({ pathData, item, index }) => {
                const isHovered = hoveredIndex === index;
                
                return (
                  <g key={index}>
                    <path
                      d={pathData}
                      fill={item.color}
                      className={cn(
                        "transition-all duration-300 ease-out cursor-pointer",
                        animated && "animate-in zoom-in-50 duration-700",
                        isHovered && "opacity-80 scale-105"
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  </g>
                );
              })}
            </svg>
            
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  R$ {totalValue.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const renderLineChart = () => {
      const points = dataWithPercentages.map((item, index) => ({
        x: (index / (data.length - 1)) * 100,
        y: 100 - (item.value / calculatedMaxValue) * 100,
        ...item
      }));

      const pathData = points.map((point, index) => 
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
      ).join(' ');

      return (
        <div className="relative h-full p-4">
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(y => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                opacity="0.3"
              />
            ))}
            
            {/* Line path */}
            <path
              d={pathData}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              className={cn(
                "transition-all duration-500 ease-out",
                animated && "animate-in slide-in-from-left-4 duration-1000"
              )}
            />
            
            {/* Points */}
            {points.map((point, index) => {
              const isHovered = hoveredIndex === index;
              
              return (
                <g key={index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isHovered ? "3" : "2"}
                    fill={point.color}
                    className="transition-all duration-300 ease-out cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  
                  {/* Tooltip */}
                  {isHovered && (
                    <g>
                      <rect
                        x={point.x + 2}
                        y={point.y - 15}
                        width="40"
                        height="20"
                        fill="hsl(var(--background))"
                        stroke="hsl(var(--border))"
                        rx="2"
                      />
                      <text
                        x={point.x + 22}
                        y={point.y - 3}
                        textAnchor="middle"
                        fontSize="8"
                        fill="hsl(var(--foreground))"
                      >
                        R$ {point.value.toFixed(0)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      );
    };

    const renderChart = () => {
      switch (type) {
        case 'pie':
          return renderPieChart();
        case 'line':
          return renderLineChart();
        case 'area':
          return renderLineChart(); // Similar to line for now
        default:
          return renderBarChart();
      }
    };

    return (
      <div
        className={cn(chartVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="p-4 pb-2">
            {title && (
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
        
        {/* Chart Content */}
        <div className="flex-1">
          {renderChart()}
        </div>
        
        {/* Legend */}
        {data.length > 0 && (
          <div className="p-4 pt-2">
            <div className="flex flex-wrap gap-3">
              {dataWithPercentages.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div
                    className="w-3 h-3 rounded-full transition-all duration-300"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.label}</span>
                  {showPercentages && (
                    <span className="text-xs text-muted-foreground/70">
                      ({item.percentage?.toFixed(1)}%)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ModernChart.displayName = "ModernChart";

export { ModernChart, chartVariants };
