import { TopHeader } from "@/components/navigation/TopHeader";
import { useUserProgress } from "@/hooks/useUserProgress";
import { Button } from "@/components/ui/button";
import { Target, Zap, Clock, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { BullMascot } from "@/components/mascot/BullMascot";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const challenges = [
  {
    id: 1,
    title: "Quick Quiz",
    description: "10 questions in 5 minutes",
    icon: Clock,
    xp: 50,
    color: "xp" as const,
  },
  {
    id: 2,
    title: "Chart Challenge",
    description: "Predict the next candle",
    icon: TrendingUp,
    xp: 30,
    color: "primary" as const,
  },
  {
    id: 3,
    title: "Review Mistakes",
    description: "Practice your weak areas",
    icon: RefreshCw,
    xp: 25,
    color: "accent" as const,
  },
];

const Practice = () => {
  const { progress, addXP } = useUserProgress();
  const { toast } = useToast();
  const [predictionResult, setPredictionResult] = useState<"up" | "down" | null>(null);

  const handleChallenge = (challengeId: number, xp: number) => {
    addXP(xp);
    toast({
      title: "Challenge Started! 🎯",
      description: `Good luck! You can earn ${xp} XP`,
    });
  };

  const handlePrediction = (direction: "up" | "down") => {
    setPredictionResult(direction);
    // Simulate random result
    const isCorrect = Math.random() > 0.5;
    setTimeout(() => {
      if (isCorrect) {
        addXP(20);
        toast({
          title: "Correct! 🎉",
          description: "+20 XP earned",
        });
      } else {
        toast({
          title: "Not quite! 📊",
          description: "Keep practicing to improve your skills",
          variant: "destructive",
        });
      }
      setPredictionResult(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopHeader
        streak={progress.streak}
        hearts={progress.hearts}
        coins={progress.coins}
      />

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Paper Trading Banner */}
        <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-3xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <BullMascot size="md" mood="thinking" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-1">
                Paper Trading
              </h2>
              <p className="text-muted-foreground text-sm mb-3">
                Practice with $10,000 virtual money - no risk!
              </p>
              <div className="flex items-center gap-2 text-2xl font-bold text-accent">
                $10,000.00
              </div>
            </div>
          </div>
        </div>

        {/* Quick Prediction */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-6">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Quick Prediction
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Will BTC go up or down in the next hour?
          </p>
          <div className="flex gap-3">
            <Button
              variant="game"
              className={cn(
                "flex-1",
                predictionResult === "up" && "animate-pulse-glow"
              )}
              onClick={() => handlePrediction("up")}
              disabled={predictionResult !== null}
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Bullish
            </Button>
            <Button
              variant="game-secondary"
              className={cn(
                "flex-1",
                predictionResult === "down" && "animate-shake"
              )}
              onClick={() => handlePrediction("down")}
              disabled={predictionResult !== null}
            >
              <TrendingDown className="w-5 h-5 mr-2" />
              Bearish
            </Button>
          </div>
        </div>

        {/* Challenges */}
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-xp" />
          Daily Challenges
        </h3>

        <div className="space-y-3">
          {challenges.map((challenge, index) => (
            <div
              key={challenge.id}
              className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                challenge.color === "xp" && "bg-xp/20 text-xp",
                challenge.color === "primary" && "bg-primary/20 text-primary",
                challenge.color === "accent" && "bg-accent/20 text-accent"
              )}>
                <challenge.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-foreground">{challenge.title}</h4>
                <p className="text-sm text-muted-foreground">{challenge.description}</p>
              </div>
              <Button
                variant="game"
                size="sm"
                onClick={() => handleChallenge(challenge.id, challenge.xp)}
              >
                +{challenge.xp} XP
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Practice;
