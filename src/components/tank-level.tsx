import { cn } from "@/lib/utils";

interface TankLevelProps {
  level: number; // 0-100 percentage
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TankLevel({ level, size = "md", className }: TankLevelProps) {
  const clampedLevel = Math.max(0, Math.min(100, level));
  
  const sizeClasses = {
    sm: "w-12 h-16",
    md: "w-16 h-24", 
    lg: "w-24 h-32"
  };

  const getLevelColor = (level: number) => {
    if (level >= 70) return "bg-green-500";
    if (level >= 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {/* Tank Container */}
      <div className={cn(
        "relative border-2 border-border rounded-b-lg rounded-t-sm bg-card overflow-hidden",
        sizeClasses[size]
      )}>
        {/* Tank Content/Liquid */}
        <div 
          className={cn(
            "absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out rounded-b-lg",
            getLevelColor(clampedLevel)
          )}
          style={{ height: `${clampedLevel}%` }}
        >
          {/* Liquid Animation Effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20" />
        </div>
        
        {/* Tank Level Lines */}
        <div className="absolute inset-0 pointer-events-none">
          {[25, 50, 75].map((mark) => (
            <div
              key={mark}
              className="absolute left-0 right-0 h-px bg-border/30"
              style={{ bottom: `${mark}%` }}
            />
          ))}
        </div>
      </div>
      
      {/* Tank Base */}
      <div className={cn(
        "w-full h-2 bg-border rounded-b-md mt-0.5",
        size === "sm" && "h-1",
        size === "lg" && "h-3"
      )} />
      
      {/* Percentage Label */}
      <div className="mt-2 text-center">
        <span className={cn(
          "font-semibold text-foreground",
          size === "sm" && "text-xs",
          size === "md" && "text-sm", 
          size === "lg" && "text-base"
        )}>
          {clampedLevel}%
        </span>
      </div>
    </div>
  );
}