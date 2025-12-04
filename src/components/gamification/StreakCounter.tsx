import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

interface StreakCounterProps {
  streak: number;
  className?: string;
}

export function StreakCounter({ streak, className }: StreakCounterProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold",
        streak > 0 
          ? "bg-streak/20 text-streak" 
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      <Flame className={cn("w-5 h-5", streak > 0 && "animate-pulse")} />
      <span>{streak}</span>
    </div>
  );
}
