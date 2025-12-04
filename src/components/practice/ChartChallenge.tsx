import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, TrendingDown, Check, XIcon, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartChallengeProps {
  onClose: () => void;
  onComplete: (score: number, total: number) => void;
}

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
}

function generateCandles(count: number, startPrice: number, trend: "up" | "down" | "sideways"): CandleData[] {
  const candles: CandleData[] = [];
  let price = startPrice;
  
  for (let i = 0; i < count; i++) {
    const trendBias = trend === "up" ? 0.6 : trend === "down" ? 0.4 : 0.5;
    const change = (Math.random() - trendBias) * price * 0.03;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * Math.abs(change) * 0.5;
    const low = Math.min(open, close) - Math.random() * Math.abs(change) * 0.5;
    
    candles.push({ open, high, low, close });
    price = close;
  }
  
  return candles;
}

function MiniChart({ candles, nextCandle, showNext }: { candles: CandleData[]; nextCandle?: CandleData; showNext?: boolean }) {
  const allCandles = showNext && nextCandle ? [...candles, nextCandle] : candles;
  const prices = allCandles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;
  
  const width = 280;
  const height = 140;
  const candleWidth = width / (allCandles.length + 1);
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[280px] mx-auto">
      {allCandles.map((candle, i) => {
        const x = candleWidth * (i + 0.5);
        const isGreen = candle.close >= candle.open;
        const bodyTop = height - ((Math.max(candle.open, candle.close) - minPrice) / range) * (height - 20) - 10;
        const bodyBottom = height - ((Math.min(candle.open, candle.close) - minPrice) / range) * (height - 20) - 10;
        const wickTop = height - ((candle.high - minPrice) / range) * (height - 20) - 10;
        const wickBottom = height - ((candle.low - minPrice) / range) * (height - 20) - 10;
        const isNextCandle = showNext && i === allCandles.length - 1;
        
        return (
          <g key={i} className={isNextCandle ? "animate-fade-in" : ""}>
            <line
              x1={x}
              y1={wickTop}
              x2={x}
              y2={wickBottom}
              stroke={isNextCandle ? (isGreen ? "#22c55e" : "#ef4444") : (isGreen ? "hsl(var(--primary))" : "hsl(var(--destructive))")}
              strokeWidth={1}
            />
            <rect
              x={x - candleWidth * 0.35}
              y={bodyTop}
              width={candleWidth * 0.7}
              height={Math.max(bodyBottom - bodyTop, 1)}
              fill={isNextCandle ? (isGreen ? "#22c55e" : "#ef4444") : (isGreen ? "hsl(var(--primary))" : "hsl(var(--destructive))")}
              rx={2}
              className={isNextCandle ? "opacity-90" : ""}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function ChartChallenge({ onClose, onComplete }: ChartChallengeProps) {
  const [rounds, setRounds] = useState<Array<{
    candles: CandleData[];
    nextCandle: CandleData;
    direction: "up" | "down";
  }>>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<"up" | "down" | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Generate 10 rounds
    const generatedRounds = Array.from({ length: 10 }, () => {
      const trend = ["up", "down", "sideways"][Math.floor(Math.random() * 3)] as "up" | "down" | "sideways";
      const startPrice = 100 + Math.random() * 100;
      const candles = generateCandles(8, startPrice, trend);
      const lastPrice = candles[candles.length - 1].close;
      
      // Generate next candle with slight trend continuation bias
      const nextDirection = Math.random() > 0.5 ? "up" : "down";
      const change = (nextDirection === "up" ? 1 : -1) * lastPrice * (0.01 + Math.random() * 0.04);
      const nextCandle = {
        open: lastPrice,
        close: lastPrice + change,
        high: Math.max(lastPrice, lastPrice + change) + Math.abs(change) * 0.3,
        low: Math.min(lastPrice, lastPrice + change) - Math.abs(change) * 0.3,
      };
      
      return {
        candles,
        nextCandle,
        direction: nextDirection as "up" | "down"
      };
    });
    setRounds(generatedRounds);
  }, []);

  const handleAnswer = (direction: "up" | "down") => {
    if (answered || rounds.length === 0) return;
    setSelected(direction);
    setAnswered(true);
    
    const correct = direction === rounds[currentRound].direction;
    if (correct) setScore(prev => prev + 1);

    setTimeout(() => {
      if (currentRound < rounds.length - 1) {
        setCurrentRound(prev => prev + 1);
        setSelected(null);
        setAnswered(false);
      } else {
        setIsComplete(true);
      }
    }, 2000);
  };

  if (rounds.length === 0) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / rounds.length) * 100);
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Challenge Complete!</h2>
          <p className="text-4xl font-bold text-primary mb-2">{score}/{rounds.length}</p>
          <p className="text-muted-foreground mb-6">{percentage}% accuracy</p>
          
          <div className="space-y-3">
            <Button className="w-full" onClick={() => onComplete(score, rounds.length)}>
              Claim {score * 3} XP
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const round = rounds[currentRound];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
        
        <div className="text-sm font-medium">
          {currentRound + 1}/{rounds.length}
        </div>

        <div className="text-sm font-bold text-xp">
          {score} pts
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h2 className="text-xl font-bold text-center mb-6">
          Predict the next candle
        </h2>

        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <MiniChart 
            candles={round.candles} 
            nextCandle={round.nextCandle}
            showNext={answered}
          />
        </div>

        <div className="flex gap-4 w-full max-w-md">
          <Button
            variant="outline"
            size="lg"
            className={cn(
              "flex-1 py-6",
              "hover:border-green-500 hover:bg-green-500/10 hover:text-green-500",
              selected === "up" && answered && round.direction === "up" && "border-green-500 bg-green-500/20 text-green-500",
              selected === "up" && answered && round.direction !== "up" && "border-red-500 bg-red-500/20 text-red-500",
              answered && round.direction === "up" && "border-green-500"
            )}
            onClick={() => handleAnswer("up")}
            disabled={answered}
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Bullish
            {answered && round.direction === "up" && <Check className="w-4 h-4 ml-2" />}
            {answered && selected === "up" && round.direction !== "up" && <XIcon className="w-4 h-4 ml-2" />}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className={cn(
              "flex-1 py-6",
              "hover:border-red-500 hover:bg-red-500/10 hover:text-red-500",
              selected === "down" && answered && round.direction === "down" && "border-green-500 bg-green-500/20 text-green-500",
              selected === "down" && answered && round.direction !== "down" && "border-red-500 bg-red-500/20 text-red-500",
              answered && round.direction === "down" && "border-green-500"
            )}
            onClick={() => handleAnswer("down")}
            disabled={answered}
          >
            <TrendingDown className="w-5 h-5 mr-2" />
            Bearish
            {answered && round.direction === "down" && <Check className="w-4 h-4 ml-2" />}
            {answered && selected === "down" && round.direction !== "down" && <XIcon className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
