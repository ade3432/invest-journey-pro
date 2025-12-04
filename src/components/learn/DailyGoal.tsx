import { cn } from "@/lib/utils";
import { Target, Check } from "lucide-react";

interface DailyGoalProps {
  completed: number;
  goal: number;
  className?: string;
}

export function DailyGoal({ completed, goal, className }: DailyGoalProps) {
  const percentage = Math.min((completed / goal) * 100, 100);
  const isComplete = completed >= goal;

  return (
    <div className={cn("bg-card rounded-2xl p-4 shadow-sm border border-border", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-xl",
            isComplete ? "bg-primary/20" : "bg-muted"
          )}>
            {isComplete ? (
              <Check className="w-5 h-5 text-primary" />
            ) : (
              <Target className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-foreground">Daily Goal</h3>
            <p className="text-sm text-muted-foreground">
              {isComplete ? "Great job! 🎉" : `${goal - completed} lessons to go`}
            </p>
          </div>
        </div>
        <span className="text-2xl font-bold text-primary">{completed}/{goal}</span>
      </div>
      
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full progress-fill",
            isComplete ? "bg-primary" : "gradient-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
