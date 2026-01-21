import { TopHeader } from "@/components/navigation/TopHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useCloudProgress } from "@/hooks/useCloudProgress";
import { useUserProgress } from "@/hooks/useUserProgress";
import { Button } from "@/components/ui/button";
import { Target, Zap, Clock, RefreshCw, TrendingUp, TrendingDown, BarChart3, Swords, BookOpen } from "lucide-react";
import { BullMascot } from "@/components/mascot/BullMascot";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { PatternDrill } from "@/components/practice/PatternDrill";
import { QuickQuiz } from "@/components/practice/QuickQuiz";
import { ChartChallenge } from "@/components/practice/ChartChallenge";
import { TradeBattle } from "@/components/practice/TradeBattle";
import { ChartPatternLibrary } from "@/components/practice/ChartPatternLibrary";

type ActiveChallenge = "quiz" | "chart" | "pattern" | "battle" | "patterns-library" | null;

const Practice = () => {
  const { user } = useAuth();
  const { progress: cloudProgress, addXP: addCloudXP, addCoins: addCloudCoins } = useCloudProgress();
  const { progress: localProgress, addXP: addLocalXP, addCoins: addLocalCoins } = useUserProgress();
  const progress = user ? cloudProgress : localProgress;
  const addXP = user ? addCloudXP : addLocalXP;
  const addCoins = user ? addCloudCoins : addLocalCoins;
  const { toast } = useToast();
  const [predictionResult, setPredictionResult] = useState<"up" | "down" | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<ActiveChallenge>(null);

  const handlePatternXP = (xp: number) => {
    addXP(xp);
    toast({
      title: "Streak Bonus! 🔥",
      description: `+${xp} XP for 5 correct in a row`,
    });
  };

  const handleQuizComplete = (score: number, total: number) => {
    const xp = score * 5;
    addXP(xp);
    toast({
      title: "Quiz Complete! 🎉",
      description: `+${xp} XP earned (${score}/${total} correct)`,
    });
    setActiveChallenge(null);
  };

  const handleChartComplete = (score: number, total: number) => {
    const xp = score * 3;
    addXP(xp);
    toast({
      title: "Chart Challenge Done! 📊",
      description: `+${xp} XP earned (${score}/${total} correct)`,
    });
    setActiveChallenge(null);
  };

  const handleBattleComplete = (won: boolean, coinsWon: number) => {
    if (won) {
      addCoins(coinsWon);
      addXP(50);
      toast({
        title: "Victory! ⚔️",
        description: `+${coinsWon} coins and +50 XP`,
      });
    } else {
      addXP(15);
      toast({
        title: "Good fight! 💪",
        description: "+15 XP for participating",
      });
    }
  };

  const handlePrediction = (direction: "up" | "down") => {
    setPredictionResult(direction);
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

  const challenges = [
    {
      id: "quiz",
      title: "Quick Quiz",
      description: "10 questions in 5 minutes",
      icon: Clock,
      xp: 50,
      color: "xp" as const,
      action: () => setActiveChallenge("quiz"),
    },
    {
      id: "chart",
      title: "Chart Challenge",
      description: "Predict the next candle",
      icon: TrendingUp,
      xp: 30,
      color: "primary" as const,
      action: () => setActiveChallenge("chart"),
    },
    {
      id: "review",
      title: "Review Mistakes",
      description: "Practice your weak areas",
      icon: RefreshCw,
      xp: 25,
      color: "accent" as const,
      action: () => setActiveChallenge("pattern"),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopHeader
        streak={progress.streak}
        hearts={progress.hearts}
        coins={progress.coins}
      />

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Chart Patterns Library Banner */}
        <div 
          className="bg-gradient-to-br from-xp/20 to-xp/5 rounded-3xl p-6 mb-6 animate-fade-in cursor-pointer hover:from-xp/30 hover:to-xp/10 transition-colors"
          onClick={() => setActiveChallenge("patterns-library")}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-xp/20 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-xp" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-1">
                Chart Patterns Library
              </h2>
              <p className="text-muted-foreground text-sm mb-2">
                Learn Double Top, Head & Shoulders, Wedges and more
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-xp">
                11 patterns • Visual examples • Trading tips
              </div>
            </div>
          </div>
        </div>

        {/* Trade Battle Banner */}
        <div 
          className="bg-gradient-to-br from-destructive/20 to-destructive/5 rounded-3xl p-6 mb-6 animate-fade-in cursor-pointer hover:from-destructive/30 hover:to-destructive/10 transition-colors"
          onClick={() => setActiveChallenge("battle")}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center">
              <Swords className="w-8 h-8 text-destructive" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-1">
                Trade Battle
              </h2>
              <p className="text-muted-foreground text-sm mb-2">
                Challenge friends to predict market movements
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                Win coins • Climb the ranks
              </div>
            </div>
          </div>
        </div>

        {/* Pattern Drill Banner */}
        <div 
          className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-6 mb-6 animate-fade-in cursor-pointer hover:from-primary/30 hover:to-primary/10 transition-colors"
          onClick={() => setActiveChallenge("pattern")}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-1">
                Pattern Practice
              </h2>
              <p className="text-muted-foreground text-sm mb-2">
                Drill candlestick patterns with unlimited attempts
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                No hearts lost • Earn streak bonuses
              </div>
            </div>
          </div>
        </div>

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
              className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4 animate-fade-in cursor-pointer hover:border-primary/50 transition-colors"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={challenge.action}
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
              >
                +{challenge.xp} XP
              </Button>
            </div>
          ))}
        </div>
      </main>

      {activeChallenge === "pattern" && (
        <PatternDrill
          onClose={() => setActiveChallenge(null)}
          onXPEarned={handlePatternXP}
        />
      )}

      {activeChallenge === "quiz" && (
        <QuickQuiz
          onClose={() => setActiveChallenge(null)}
          onComplete={handleQuizComplete}
        />
      )}

      {activeChallenge === "chart" && (
        <ChartChallenge
          onClose={() => setActiveChallenge(null)}
          onComplete={handleChartComplete}
        />
      )}

      {activeChallenge === "battle" && (
        <TradeBattle
          onClose={() => setActiveChallenge(null)}
          onComplete={handleBattleComplete}
        />
      )}

      {activeChallenge === "patterns-library" && (
        <ChartPatternLibrary onClose={() => setActiveChallenge(null)} />
      )}
    </div>
  );
};

export default Practice;
