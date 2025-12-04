import { useState } from "react";
import { Button } from "@/components/ui/button";
import CandlestickChart, { CHART_PATTERNS, PatternKey } from "./CandlestickChart";
import { TrendingUp, TrendingDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatternRecognitionProps {
  patternKey: PatternKey;
  showPatternName?: boolean;
  onAnswer: (correct: boolean) => void;
}

export function PatternRecognition({ 
  patternKey, 
  showPatternName = false,
  onAnswer 
}: PatternRecognitionProps) {
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<"bullish" | "bearish" | null>(null);
  
  const pattern = CHART_PATTERNS[patternKey];
  
  const handleSelect = (choice: "bullish" | "bearish") => {
    if (answered) return;
    setSelected(choice);
    setAnswered(true);
    const isCorrect = (choice === "bullish") === pattern.isBullish;
    setTimeout(() => onAnswer(isCorrect), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Identify the Pattern</h2>
        <p className="text-muted-foreground">
          {showPatternName 
            ? `What does the "${pattern.name}" pattern signal?`
            : "Is this chart pattern bullish or bearish?"}
        </p>
      </div>
      
      <CandlestickChart 
        candles={pattern.candles}
        highlightLast={pattern.highlightLast}
        patternName={showPatternName ? pattern.name : undefined}
        height={180}
      />
      
      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          size="lg"
          className={cn(
            "flex-1 max-w-[150px] py-6 gap-2",
            "hover:border-green-500 hover:bg-green-500/10 hover:text-green-500",
            selected === "bullish" && answered && pattern.isBullish && "border-green-500 bg-green-500/20 text-green-500",
            selected === "bullish" && answered && !pattern.isBullish && "border-red-500 bg-red-500/20 text-red-500",
            answered && pattern.isBullish && "border-green-500"
          )}
          onClick={() => handleSelect("bullish")}
          disabled={answered}
        >
          <TrendingUp className="w-5 h-5" />
          Bullish
          {answered && selected === "bullish" && (
            pattern.isBullish ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />
          )}
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className={cn(
            "flex-1 max-w-[150px] py-6 gap-2",
            "hover:border-red-500 hover:bg-red-500/10 hover:text-red-500",
            selected === "bearish" && answered && !pattern.isBullish && "border-green-500 bg-green-500/20 text-green-500",
            selected === "bearish" && answered && pattern.isBullish && "border-red-500 bg-red-500/20 text-red-500",
            answered && !pattern.isBullish && "border-green-500"
          )}
          onClick={() => handleSelect("bearish")}
          disabled={answered}
        >
          <TrendingDown className="w-5 h-5" />
          Bearish
          {answered && selected === "bearish" && (
            !pattern.isBullish ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />
          )}
        </Button>
      </div>
      
      {answered && (
        <div className={cn(
          "text-center p-3 rounded-lg",
          (selected === "bullish") === pattern.isBullish 
            ? "bg-green-500/10 text-green-500" 
            : "bg-red-500/10 text-red-500"
        )}>
          {(selected === "bullish") === pattern.isBullish ? (
            <p className="font-semibold">Correct! The {pattern.name} is a {pattern.isBullish ? "bullish" : "bearish"} pattern.</p>
          ) : (
            <p className="font-semibold">
              Not quite! The {pattern.name} is actually a {pattern.isBullish ? "bullish" : "bearish"} reversal signal.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface PatternNamingProps {
  patternKey: PatternKey;
  options: string[];
  onAnswer: (correct: boolean) => void;
}

export function PatternNaming({ patternKey, options, onAnswer }: PatternNamingProps) {
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  
  const pattern = CHART_PATTERNS[patternKey];
  const correctIndex = options.findIndex(opt => opt === pattern.name);
  
  const handleSelect = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    setTimeout(() => onAnswer(index === correctIndex), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Name This Pattern</h2>
        <p className="text-muted-foreground">What candlestick pattern is shown?</p>
      </div>
      
      <CandlestickChart 
        candles={pattern.candles}
        highlightLast={pattern.highlightLast}
        height={180}
      />
      
      <div className="grid grid-cols-2 gap-3">
        {options.map((option, i) => (
          <Button
            key={option}
            variant="outline"
            className={cn(
              "h-auto py-3 justify-start",
              selected === i && answered && i === correctIndex && "border-green-500 bg-green-500/10 text-green-500",
              selected === i && answered && i !== correctIndex && "border-red-500 bg-red-500/10 text-red-500",
              answered && i === correctIndex && "border-green-500"
            )}
            onClick={() => handleSelect(i)}
            disabled={answered}
          >
            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2 text-sm">
              {String.fromCharCode(65 + i)}
            </span>
            {option}
            {answered && i === correctIndex && <Check className="ml-auto w-4 h-4 text-green-500" />}
            {answered && selected === i && i !== correctIndex && <X className="ml-auto w-4 h-4 text-red-500" />}
          </Button>
        ))}
      </div>
    </div>
  );
}
