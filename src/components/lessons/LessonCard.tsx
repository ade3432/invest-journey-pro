import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle, Play, Star, Coins, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  title: string;
  description: string;
  difficulty: string;
  xpReward: number;
  coinReward: number;
  isCompleted: boolean;
  isLocked: boolean;
  isPremium?: boolean;
  onClick: () => void;
}

export default function LessonCard({
  title,
  description,
  difficulty,
  xpReward,
  coinReward,
  isCompleted,
  isLocked,
  isPremium,
  onClick,
}: LessonCardProps) {
  const difficultyColors = {
    beginner: "bg-green-500/20 text-green-500",
    intermediate: "bg-yellow-500/20 text-yellow-500",
    advanced: "bg-red-500/20 text-red-500",
  };

  return (
    <Card
      className={cn(
        "border-border/50 cursor-pointer transition-all hover:shadow-md",
        isLocked && "opacity-60 cursor-not-allowed",
        isCompleted && "border-green-500/50 bg-green-500/5",
        isPremium && !isCompleted && "border-warning/30 bg-warning/5"
      )}
      onClick={() => !isLocked && onClick()}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
            isCompleted ? "bg-green-500/20" : isPremium ? "bg-warning/20" : isLocked ? "bg-muted" : "bg-primary/20"
          )}>
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : isPremium ? (
              <Crown className="w-5 h-5 text-warning" />
            ) : isLocked ? (
              <Lock className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Play className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{title}</h3>
              {isPremium && (
                <Badge variant="secondary" className="bg-warning/20 text-warning text-xs">
                  Premium
                </Badge>
              )}
              <Badge variant="secondary" className={cn("text-xs", difficultyColors[difficulty as keyof typeof difficultyColors])}>
                {difficulty}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{description}</p>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-yellow-500">
                <Star className="w-3 h-3" />
                +{xpReward} XP
              </span>
              <span className="flex items-center gap-1 text-amber-500">
                <Coins className="w-3 h-3" />
                +{coinReward}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
