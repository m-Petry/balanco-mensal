import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const animatedChartVariants = cva(
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

export interface AnimatedChartDataPoint {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

export interface AnimatedChartProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof animatedChartVariants> {
  data: AnimatedChartDataPoint[];
  title?: string;
  subtitle?: string;
  type?: 'bar' | 'pie' | 'line' | 'area';
  animated?: boolean;
  showValues?: boolean;
  showPercentages?: boolean;
  maxValue?: number;
}

const AnimatedChart = React.forwardRef<HTMLDivElement, AnimatedChartProps>(
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

    const renderAnimatedBarChart = () => (
      <div className="flex items-end justify-between h-full p-4 gap-2">
        {dataWithPercentages.map((item, index) => {
          const height = (item.value / calculatedMaxValue) * 100;
          const isHovered = hoveredIndex === index;
          
          return (
            <motion.div
              key={index}
              className="flex flex-col items-center flex-1 relative group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
            >
              {/* Bar */}
              <div className="relative w-full flex-1 flex items-end">
                <motion.div
                  className="w-full rounded-t-lg relative overflow-hidden"
                  style={{
                    backgroundColor: item.color,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                  }}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Value label */}
                  <AnimatePresence>
                    {showValues && (isHovered || height > 20) && (
                      <motion.div
                        className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-foreground bg-background/90 px-2 py-1 rounded shadow-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        R$ {item.value.toFixed(2).replace('.', ',')}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
              
              {/* Label */}
              <motion.div 
                className="mt-2 text-xs text-muted-foreground text-center font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                {item.label}
              </motion.div>
              
              {/* Percentage */}
              {showPercentages && (
                <motion.div 
                  className="text-xs text-muted-foreground/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.6 }}
                >
                  {item.percentage?.toFixed(1)}%
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    );

    const renderAnimatedPieChart = () => {
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
                  <motion.g key={index}>
                    <motion.path
                      d={pathData}
                      fill={item.color}
                      className="cursor-pointer"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        opacity: 0.8
                      }}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  </motion.g>
                );
              })}
            </svg>
            
            {/* Center text */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  R$ {totalValue.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </motion.div>
          </div>
        </div>
      );
    };

    const renderAnimatedLineChart = () => {
      const points = dataWithPercentages.map((item, index) => ({
        x: (index / (data.length - 1)) * 100,
        y: 100 - (item.value / calculatedMaxValue) * 100,
        ...item
      }));

      // Create smooth curve path using quadratic bezier curves
      const createSmoothPath = (points: any[]) => {
        if (points.length < 2) return '';
        
        let path = `M ${points[0].x} ${points[0].y}`;
        
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          const next = points[i + 1];
          
          if (next) {
            // Calculate control points for smooth curve
            const cp1x = prev.x + (curr.x - prev.x) * 0.5;
            const cp1y = prev.y;
            const cp2x = curr.x - (next.x - curr.x) * 0.5;
            const cp2y = curr.y;
            
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
          } else {
            // Last point - straight line
            path += ` L ${curr.x} ${curr.y}`;
          }
        }
        
        return path;
      };

      const pathData = createSmoothPath(points);

      return (
        <div className="relative h-full p-4">
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(y => (
              <motion.line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                opacity="0.15"
                strokeDasharray="2,2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: y * 0.02 }}
              />
            ))}
            
            {/* Area fill */}
            <motion.path
              d={`${pathData} L ${points[points.length - 1]?.x || 100} 100 L 0 100 Z`}
              fill="url(#areaGradient)"
              fillOpacity={0.1}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
            
            {/* Line path */}
            <motion.path
              d={pathData}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            
            {/* Gradients */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="50%" stopColor="hsl(217, 91%, 60%)" />
                <stop offset="100%" stopColor="hsl(var(--primary))" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            
            {/* Points */}
            {points.map((point, index) => {
              const isHovered = hoveredIndex === index;
              
              return (
                <motion.g key={index}>
                  {/* Point glow effect */}
                  <motion.circle
                    cx={point.x}
                    cy={point.y}
                    r={isHovered ? "8" : "6"}
                    fill="hsl(var(--primary))"
                    opacity={isHovered ? 0.2 : 0.1}
                    className="cursor-pointer"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.1 + 0.5,
                      ease: "easeOut"
                    }}
                    whileHover={{ scale: 1.2 }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  
                  {/* Main point */}
                  <motion.circle
                    cx={point.x}
                    cy={point.y}
                    r={isHovered ? "4" : "3"}
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    className="cursor-pointer"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.1 + 0.5,
                      ease: "easeOut"
                    }}
                    whileHover={{ scale: 1.3 }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  
                  {/* Tooltip */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.g
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Tooltip background with shadow */}
                        <defs>
                          <filter id="tooltipShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.1)"/>
                          </filter>
                        </defs>
                        
                        <rect
                          x={point.x - 25}
                          y={point.y - 35}
                          width="50"
                          height="25"
                          fill="hsl(var(--background))"
                          stroke="hsl(var(--border))"
                          strokeWidth="1"
                          rx="6"
                          filter="url(#tooltipShadow)"
                        />
                        
                        {/* Tooltip arrow */}
                        <polygon
                          points={`${point.x - 4},${point.y - 10} ${point.x + 4},${point.y - 10} ${point.x},${point.y - 5}`}
                          fill="hsl(var(--background))"
                          stroke="hsl(var(--border))"
                          strokeWidth="1"
                        />
                        
                        <text
                          x={point.x}
                          y={point.y - 18}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="600"
                          fill="hsl(var(--foreground))"
                        >
                          R$ {point.value.toFixed(0)}
                        </text>
                      </motion.g>
                    )}
                  </AnimatePresence>
                </motion.g>
              );
            })}
          </svg>
        </div>
      );
    };

    const renderChart = () => {
      switch (type) {
        case 'pie':
          return renderAnimatedPieChart();
        case 'line':
          return renderAnimatedLineChart();
        case 'area':
          return renderAnimatedLineChart(); // Similar to line for now
        default:
          return renderAnimatedBarChart();
      }
    };

    return (
      <motion.div
        className={cn(animatedChartVariants({ variant, size, className }))}
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        {...props}
      >
        {/* Header */}
        {(title || subtitle) && (
          <motion.div 
            className="p-4 pb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {title && (
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </motion.div>
        )}
        
        {/* Chart Content */}
        <div className="flex-1">
          {renderChart()}
        </div>
        
        {/* Legend */}
        {data.length > 0 && (
          <motion.div 
            className="p-4 pt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex flex-wrap gap-3">
              {dataWithPercentages.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2 text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.8 }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <motion.div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                    whileHover={{ scale: 1.2 }}
                  />
                  <span className="text-muted-foreground">{item.label}</span>
                  {showPercentages && (
                    <span className="text-xs text-muted-foreground/70">
                      ({item.percentage?.toFixed(1)}%)
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }
);

AnimatedChart.displayName = "AnimatedChart";

export { AnimatedChart, animatedChartVariants };
