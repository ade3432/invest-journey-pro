import { cn } from "@/lib/utils";
import { Check, Lock, Star } from "lucide-react";

interface SkillNodeProps {
  title: string;
  icon: React.ReactNode;
  progress: number; // 0-5 crowns
  isLocked: boolean;
  isActive: boolean;
  onClick: () => void;
}

export function SkillNode({ title, icon, progress, isLocked, isActive, onClick }: SkillNodeProps) {
  const isComplete = progress >= 5;

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "relative flex flex-col items-center gap-2 transition-all",
        isLocked && "opacity-50 cursor-not-allowed",
        !isLocked && "active:scale-95"
      )}
    >
      {/* Node circle */}
      <div className={cn(
        "relative w-20 h-20 rounded-full flex items-center justify-center transition-all",
        isComplete && "bg-primary shadow-glow",
        isActive && !isComplete && "bg-primary/20 ring-4 ring-primary/30 animate-pulse-glow",
        !isActive && !isComplete && !isLocked && "bg-muted",
        isLocked && "bg-muted"
      )}>
        {isLocked ? (
          <Lock className="w-8 h-8 text-muted-foreground" />
        ) : isComplete ? (
          <Check className="w-10 h-10 text-primary-foreground stroke-[3]" />
        ) : (
          <div className={cn(
            "w-12 h-12 flex items-center justify-center",
            isActive ? "text-primary" : "text-muted-foreground"
          )}>
            {icon}
          </div>
        )}

        {/* Progress crown indicator */}
        {!isLocked && progress > 0 && progress < 5 && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-card px-2 py-0.5 rounded-full border border-border shadow-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-3 h-3",
                  i < progress ? "text-coin fill-coin" : "text-muted-foreground"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Title */}
      <span className={cn(
        "text-sm font-bold text-center max-w-24",
        isActive ? "text-foreground" : "text-muted-foreground"
      )}>
        {title}
      </span>
    </button>
  );
}
