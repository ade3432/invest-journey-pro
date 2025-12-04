import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface XPBarProps {
  current: number;
  max: number;
  level: number;
  className?: string;
}

export function XPBar({ current, max, level, className }: XPBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-xp/20 text-xp font-bold">
        {level}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-muted-foreground">Level {level}</span>
          <div className="flex items-center gap-1 text-xs font-bold text-xp">
            <Zap className="w-3 h-3" />
            {current} / {max} XP
          </div>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full gradient-xp rounded-full progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
