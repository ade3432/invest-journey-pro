import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  icon: string;
  name: string;
  description: string;
  isUnlocked: boolean;
  className?: string;
}

export function AchievementBadge({ icon, name, description, isUnlocked, className }: AchievementBadgeProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-2xl border transition-all",
      isUnlocked 
        ? "bg-card border-primary/30" 
        : "bg-muted/50 border-border opacity-60",
      className
    )}>
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
        isUnlocked ? "bg-primary/20" : "bg-muted grayscale"
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "font-bold truncate",
          isUnlocked ? "text-foreground" : "text-muted-foreground"
        )}>
          {name}
        </h4>
        <p className="text-sm text-muted-foreground truncate">{description}</p>
      </div>
    </div>
  );
}
