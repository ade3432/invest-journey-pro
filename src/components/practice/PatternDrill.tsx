import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PatternRecognition, PatternNaming } from "@/components/lessons/PatternRecognition";
import { CHART_PATTERNS, PatternKey } from "@/components/lessons/CandlestickChart";
import { RefreshCw, Trophy, Target, X, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatternDrillProps {
  onClose: () => void;
  onXPEarned?: (xp: number) => void;
}

const patternKeys = Object.keys(CHART_PATTERNS) as PatternKey[];

type DrillMode = "recognition" | "naming" | "mixed";

export function PatternDrill({ onClose, onXPEarned }: PatternDrillProps) {
  const [mode, setMode] = useState<DrillMode | null>(null);
  const [currentPattern, setCurrentPattern] = useState<PatternKey>(
    patternKeys[Math.floor(Math.random() * patternKeys.length)]
  );
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const getRandomPattern = useCallback(() => {
    const available = patternKeys.filter(k => k !== currentPattern);
    return available[Math.floor(Math.random() * available.length)];
  }, [currentPattern]);

  const getRandomOptions = useCallback((correctKey: PatternKey): string[] => {
    const correctName = CHART_PATTERNS[correctKey].name;
    const otherNames = patternKeys
      .filter(k => k !== correctKey)
      .map(k => CHART_PATTERNS[k].name);
    
    const shuffled = otherNames.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...shuffled, correctName].sort(() => Math.random() - 0.5);
    return options;
  }, []);

  const handleAnswer = (correct: boolean) => {
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
      // Award XP for every 5 correct in a row
      if (newStreak % 5 === 0 && onXPEarned) {
        onXPEarned(25);
      }
    } else {
      setStreak(0);
    }

    // Auto-advance after delay
    setTimeout(() => {
      setCurrentPattern(getRandomPattern());
    }, 2000);
  };

  const renderQuestion = () => {
    if (mode === "recognition" || (mode === "mixed" && Math.random() > 0.5)) {
      return (
        <PatternRecognition
          key={`${currentPattern}-${score.total}`}
          patternKey={currentPattern}
          showPatternName={Math.random() > 0.5}
          onAnswer={handleAnswer}
        />
      );
    }
    return (
      <PatternNaming
        key={`${currentPattern}-${score.total}`}
        patternKey={currentPattern}
        options={getRandomOptions(currentPattern)}
        onAnswer={handleAnswer}
      />
    );
  };

  if (!mode) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Pattern Practice</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Practice unlimited pattern recognition. No hearts lost!
          </p>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-auto py-4 justify-start gap-4 hover:border-primary"
              onClick={() => setMode("recognition")}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-bold">Bullish or Bearish?</div>
                <div className="text-sm text-muted-foreground">Identify pattern direction</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-auto py-4 justify-start gap-4 hover:border-accent"
              onClick={() => setMode("naming")}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left">
                <div className="font-bold">Name the Pattern</div>
                <div className="text-sm text-muted-foreground">Identify pattern names</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-auto py-4 justify-start gap-4 hover:border-xp"
              onClick={() => setMode("mixed")}
            >
              <div className="w-12 h-12 rounded-xl bg-xp/20 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-xp" />
              </div>
              <div className="text-left">
                <div className="font-bold">Mixed Practice</div>
                <div className="text-sm text-muted-foreground">Random question types</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Flame className={cn("w-4 h-4", streak > 0 ? "text-xp" : "text-muted-foreground")} />
            <span className="font-bold">{streak}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {score.correct}/{score.total} ({accuracy}%)
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMode(null)}
        >
          Change Mode
        </Button>
      </div>

      {/* Stats Bar */}
      {bestStreak > 0 && (
        <div className="bg-xp/10 px-4 py-2 text-center text-sm">
          <span className="text-xp font-semibold">Best Streak: {bestStreak}</span>
          {bestStreak >= 5 && <span className="ml-2">🔥</span>}
        </div>
      )}

      {/* Question Area */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-lg mx-auto">
          {renderQuestion()}
        </div>
      </div>
    </div>
  );
}
