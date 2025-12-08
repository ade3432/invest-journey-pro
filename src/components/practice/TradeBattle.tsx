import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Swords, Trophy, TrendingUp, TrendingDown, Coins, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface TradeBattleProps {
  onClose: () => void;
  onComplete?: (won: boolean, coinsWon: number) => void;
}

type BattleState = "setup" | "playing" | "results";

interface PriceCandle {
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ChartPattern {
  name: string;
  hint: string;
  description: string;
  direction: "up" | "down";
  generateCandles: (basePrice: number) => PriceCandle[];
}

interface TradeRound {
  symbol: string;
  name: string;
  candles: PriceCandle[];
  nextCandle: PriceCandle;
  direction: "up" | "down";
  pattern: ChartPattern;
}

// Chart pattern definitions with realistic candle generation
const CHART_PATTERNS: ChartPattern[] = [
  {
    name: "Double Bottom",
    hint: "Two similar lows with a peak between them - bullish reversal signal",
    description: "A W-shaped pattern indicating potential upward reversal",
    direction: "up",
    generateCandles: (base) => {
      const candles: PriceCandle[] = [];
      let price = base;
      // Downtrend
      for (let i = 0; i < 3; i++) {
        const change = -base * (0.015 + Math.random() * 0.01);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      const firstBottom = price;
      // Bounce up
      for (let i = 0; i < 2; i++) {
        const change = base * (0.012 + Math.random() * 0.008);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      // Second drop to similar level
      for (let i = 0; i < 3; i++) {
        const change = -base * (0.01 + Math.random() * 0.008);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      // Ensure second bottom is near first
      const adjustment = firstBottom - price;
      candles.push(makeCandle(price, price + adjustment * 0.9));
      price += adjustment * 0.9;
      // Start of reversal
      for (let i = 0; i < 2; i++) {
        const change = base * (0.008 + Math.random() * 0.006);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      return candles.slice(0, 12);
    }
  },
  {
    name: "Double Top",
    hint: "Two similar highs with a dip between them - bearish reversal signal",
    description: "An M-shaped pattern indicating potential downward reversal",
    direction: "down",
    generateCandles: (base) => {
      const candles: PriceCandle[] = [];
      let price = base;
      // Uptrend
      for (let i = 0; i < 3; i++) {
        const change = base * (0.015 + Math.random() * 0.01);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      const firstTop = price;
      // Pullback
      for (let i = 0; i < 2; i++) {
        const change = -base * (0.012 + Math.random() * 0.008);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      // Second rise to similar level
      for (let i = 0; i < 3; i++) {
        const change = base * (0.01 + Math.random() * 0.008);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      // Ensure second top is near first
      const adjustment = firstTop - price;
      candles.push(makeCandle(price, price + adjustment * 0.9));
      price += adjustment * 0.9;
      // Start of reversal
      for (let i = 0; i < 2; i++) {
        const change = -base * (0.008 + Math.random() * 0.006);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      return candles.slice(0, 12);
    }
  },
  {
    name: "Ascending Triangle",
    hint: "Flat resistance with rising support - typically bullish breakout",
    description: "Higher lows pushing toward a horizontal resistance level",
    direction: "up",
    generateCandles: (base) => {
      const candles: PriceCandle[] = [];
      let price = base;
      const resistance = base * 1.04;
      for (let i = 0; i < 12; i++) {
        const support = base * (0.96 + i * 0.003);
        if (i % 3 === 0) {
          // Push toward resistance
          candles.push(makeCandle(price, resistance * (0.99 + Math.random() * 0.01)));
          price = resistance * 0.995;
        } else if (i % 3 === 1) {
          // Pull back to rising support
          candles.push(makeCandle(price, support + Math.random() * base * 0.01));
          price = support + Math.random() * base * 0.01;
        } else {
          // Consolidation
          const change = (Math.random() - 0.4) * base * 0.015;
          candles.push(makeCandle(price, Math.min(price + change, resistance * 0.99)));
          price = Math.min(price + change, resistance * 0.99);
        }
      }
      return candles;
    }
  },
  {
    name: "Descending Triangle",
    hint: "Flat support with falling resistance - typically bearish breakdown",
    description: "Lower highs pressing down toward a horizontal support level",
    direction: "down",
    generateCandles: (base) => {
      const candles: PriceCandle[] = [];
      let price = base;
      const support = base * 0.96;
      for (let i = 0; i < 12; i++) {
        const resistance = base * (1.04 - i * 0.003);
        if (i % 3 === 0) {
          // Drop toward support
          candles.push(makeCandle(price, support * (1.0 + Math.random() * 0.01)));
          price = support * 1.005;
        } else if (i % 3 === 1) {
          // Bounce to falling resistance
          candles.push(makeCandle(price, resistance - Math.random() * base * 0.01));
          price = resistance - Math.random() * base * 0.01;
        } else {
          // Consolidation
          const change = (Math.random() - 0.6) * base * 0.015;
          candles.push(makeCandle(price, Math.max(price + change, support * 1.01)));
          price = Math.max(price + change, support * 1.01);
        }
      }
      return candles;
    }
  },
  {
    name: "Bullish Flag",
    hint: "Sharp rise followed by slight downward consolidation - continuation pattern",
    description: "A pause in an uptrend before continuing higher",
    direction: "up",
    generateCandles: (base) => {
      const candles: PriceCandle[] = [];
      let price = base;
      // Strong upward move (pole)
      for (let i = 0; i < 4; i++) {
        const change = base * (0.02 + Math.random() * 0.015);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      // Slight downward consolidation (flag)
      for (let i = 0; i < 8; i++) {
        const change = -base * (0.005 + Math.random() * 0.005);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      return candles;
    }
  },
  {
    name: "Bearish Flag",
    hint: "Sharp drop followed by slight upward consolidation - continuation pattern",
    description: "A pause in a downtrend before continuing lower",
    direction: "down",
    generateCandles: (base) => {
      const candles: PriceCandle[] = [];
      let price = base;
      // Strong downward move (pole)
      for (let i = 0; i < 4; i++) {
        const change = -base * (0.02 + Math.random() * 0.015);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      // Slight upward consolidation (flag)
      for (let i = 0; i < 8; i++) {
        const change = base * (0.005 + Math.random() * 0.005);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      return candles;
    }
  },
  {
    name: "Head and Shoulders",
    hint: "Three peaks with the middle one highest - bearish reversal signal",
    description: "Left shoulder, higher head, right shoulder pattern",
    direction: "down",
    generateCandles: (base) => {
      const candles: PriceCandle[] = [];
      let price = base;
      // Left shoulder up
      for (let i = 0; i < 2; i++) {
        const change = base * (0.015 + Math.random() * 0.01);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      // Left shoulder down
      candles.push(makeCandle(price, price - base * 0.02));
      price -= base * 0.02;
      // Head up (higher than shoulder)
      for (let i = 0; i < 2; i++) {
        const change = base * (0.02 + Math.random() * 0.01);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      // Head down
      for (let i = 0; i < 2; i++) {
        const change = -base * (0.015 + Math.random() * 0.01);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      // Right shoulder up (lower than head)
      candles.push(makeCandle(price, price + base * 0.02));
      price += base * 0.02;
      // Right shoulder starting down
      for (let i = 0; i < 2; i++) {
        const change = -base * (0.01 + Math.random() * 0.005);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      return candles.slice(0, 12);
    }
  },
  {
    name: "Inverse Head and Shoulders",
    hint: "Three troughs with the middle one lowest - bullish reversal signal",
    description: "Left shoulder, lower head, right shoulder inverted pattern",
    direction: "up",
    generateCandles: (base) => {
      const candles: PriceCandle[] = [];
      let price = base;
      // Left shoulder down
      for (let i = 0; i < 2; i++) {
        const change = -base * (0.015 + Math.random() * 0.01);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      // Left shoulder up
      candles.push(makeCandle(price, price + base * 0.02));
      price += base * 0.02;
      // Head down (lower than shoulder)
      for (let i = 0; i < 2; i++) {
        const change = -base * (0.02 + Math.random() * 0.01);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      // Head up
      for (let i = 0; i < 2; i++) {
        const change = base * (0.015 + Math.random() * 0.01);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      // Right shoulder down (higher than head)
      candles.push(makeCandle(price, price - base * 0.02));
      price -= base * 0.02;
      // Right shoulder starting up
      for (let i = 0; i < 2; i++) {
        const change = base * (0.01 + Math.random() * 0.005);
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      return candles.slice(0, 12);
    }
  },
  {
    name: "Rising Wedge",
    hint: "Converging upward trend lines - typically bearish reversal",
    description: "Both support and resistance rising but converging",
    direction: "down",
    generateCandles: (base) => {
      const candles: PriceCandle[] = [];
      let price = base;
      for (let i = 0; i < 12; i++) {
        const range = base * (0.04 - i * 0.002);
        const bias = base * 0.005;
        const change = (Math.random() * range - range * 0.4) + bias;
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      return candles;
    }
  },
  {
    name: "Falling Wedge",
    hint: "Converging downward trend lines - typically bullish reversal",
    description: "Both support and resistance falling but converging",
    direction: "up",
    generateCandles: (base) => {
      const candles: PriceCandle[] = [];
      let price = base;
      for (let i = 0; i < 12; i++) {
        const range = base * (0.04 - i * 0.002);
        const bias = -base * 0.005;
        const change = (Math.random() * range - range * 0.6) + bias;
        candles.push(makeCandle(price, price + change));
        price += change;
      }
      return candles;
    }
  }
];

function makeCandle(open: number, close: number): PriceCandle {
  const high = Math.max(open, close) * (1 + Math.random() * 0.005);
  const low = Math.min(open, close) * (1 - Math.random() * 0.005);
  return { open, high, low, close };
}

function generateRound(symbol: string, name: string, basePrice: number, pattern: ChartPattern): TradeRound {
  const candles = pattern.generateCandles(basePrice);
  const lastClose = candles[candles.length - 1].close;
  
  // Generate next candle in the pattern's predicted direction
  const movePercent = (0.015 + Math.random() * 0.025) * (pattern.direction === "up" ? 1 : -1);
  const nextClose = lastClose * (1 + movePercent);
  const nextOpen = lastClose;
  const nextHigh = Math.max(nextOpen, nextClose) * (1 + Math.random() * 0.008);
  const nextLow = Math.min(nextOpen, nextClose) * (1 - Math.random() * 0.008);
  
  return {
    symbol,
    name,
    candles,
    nextCandle: { open: nextOpen, high: nextHigh, low: nextLow, close: nextClose },
    direction: pattern.direction,
    pattern
  };
}

// Mini candlestick chart component
function BattleChart({ candles, showNext, nextCandle }: { 
  candles: PriceCandle[]; 
  showNext: boolean; 
  nextCandle?: PriceCandle;
}) {
  const allCandles = showNext && nextCandle ? [...candles, nextCandle] : candles;
  
  const prices = allCandles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  
  const chartHeight = 200;
  const chartWidth = 320;
  const candleWidth = showNext ? chartWidth / (candles.length + 1) - 4 : chartWidth / candles.length - 4;
  
  const scaleY = (price: number) => {
    return chartHeight - ((price - minPrice) / priceRange) * (chartHeight - 20) - 10;
  };

  return (
    <div className="bg-muted/30 rounded-xl p-4">
      <svg width={chartWidth} height={chartHeight} className="mx-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
          <line
            key={i}
            x1={0}
            x2={chartWidth}
            y1={10 + (chartHeight - 20) * pct}
            y2={10 + (chartHeight - 20) * pct}
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeDasharray="4,4"
          />
        ))}
        
        {/* Candles */}
        {allCandles.map((candle, i) => {
          const isLastNew = showNext && i === allCandles.length - 1;
          const x = i * (candleWidth + 4) + candleWidth / 2 + 2;
          const isGreen = candle.close >= candle.open;
          const color = isGreen ? "hsl(var(--success))" : "hsl(var(--destructive))";
          
          const bodyTop = scaleY(Math.max(candle.open, candle.close));
          const bodyBottom = scaleY(Math.min(candle.open, candle.close));
          const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
          
          return (
            <g key={i} className={isLastNew ? "animate-fade-in" : ""}>
              {/* Wick */}
              <line
                x1={x}
                x2={x}
                y1={scaleY(candle.high)}
                y2={scaleY(candle.low)}
                stroke={color}
                strokeWidth={1}
              />
              {/* Body */}
              <rect
                x={x - candleWidth / 2 + 2}
                y={bodyTop}
                width={candleWidth - 4}
                height={bodyHeight}
                fill={isGreen ? color : color}
                stroke={color}
                strokeWidth={1}
                rx={1}
              />
              {/* Highlight for new candle */}
              {isLastNew && (
                <rect
                  x={x - candleWidth / 2}
                  y={0}
                  width={candleWidth}
                  height={chartHeight}
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                  rx={4}
                />
              )}
            </g>
          );
        })}
        
        {/* Question mark for prediction area */}
        {!showNext && (
          <g>
            <rect
              x={candles.length * (candleWidth + 4)}
              y={0}
              width={candleWidth + 4}
              height={chartHeight}
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              rx={4}
              strokeDasharray="4,4"
              stroke="hsl(var(--primary))"
              strokeOpacity={0.5}
            />
            <text
              x={candles.length * (candleWidth + 4) + candleWidth / 2 + 2}
              y={chartHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="hsl(var(--primary))"
              fontSize={24}
              fontWeight="bold"
            >
              ?
            </text>
          </g>
        )}
      </svg>
      
      {/* Price labels */}
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>${minPrice.toFixed(2)}</span>
        <span>Last: ${candles[candles.length - 1].close.toFixed(2)}</span>
        <span>${maxPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}

export function TradeBattle({ onClose, onComplete }: TradeBattleProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<BattleState>("setup");
  const [stakes, setStakes] = useState(50);
  const [friendEmail, setFriendEmail] = useState("");
  const [showHint, setShowHint] = useState(false);
  
  // Generate random rounds with different patterns
  const rounds = useMemo(() => {
    const symbols = [
      { symbol: "BTC", name: "Bitcoin", base: 42000 + Math.random() * 5000 },
      { symbol: "ETH", name: "Ethereum", base: 2200 + Math.random() * 300 },
      { symbol: "AAPL", name: "Apple", base: 175 + Math.random() * 10 },
      { symbol: "TSLA", name: "Tesla", base: 240 + Math.random() * 20 },
      { symbol: "NVDA", name: "NVIDIA", base: 480 + Math.random() * 40 },
    ];
    
    // Shuffle patterns and pick 5
    const shuffledPatterns = [...CHART_PATTERNS].sort(() => Math.random() - 0.5).slice(0, 5);
    
    return symbols.map((s, i) => generateRound(s.symbol, s.name, s.base, shuffledPatterns[i]));
  }, []);
  
  const [currentRound, setCurrentRound] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<"up" | "down" | null>(null);
  const [roundTimer, setRoundTimer] = useState(15);

  useEffect(() => {
    if (state === "playing" && !answered && roundTimer > 0) {
      const timer = setInterval(() => {
        setRoundTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    
    if (roundTimer === 0 && !answered) {
      handleAnswer(null);
    }
  }, [state, answered, roundTimer]);

  const startBattle = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to challenge friends",
        variant: "destructive"
      });
      return;
    }

    setState("playing");
    setRoundTimer(15);
    setShowHint(false);
  };

  const handleAnswer = (direction: "up" | "down" | null) => {
    if (answered) return;
    setSelected(direction);
    setAnswered(true);

    const round = rounds[currentRound];
    const correct = direction === round.direction;
    
    if (correct) {
      setMyScore(prev => prev + 1);
    }

    // Simulate opponent (55% accuracy - slightly lower since patterns give hints)
    const opponentCorrect = Math.random() > 0.45;
    if (opponentCorrect) {
      setOpponentScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentRound < rounds.length - 1) {
        setCurrentRound(prev => prev + 1);
        setAnswered(false);
        setSelected(null);
        setRoundTimer(15);
        setShowHint(false);
      } else {
        setState("results");
      }
    }, 3000);
  };

  const handleComplete = () => {
    const won = myScore > opponentScore;
    const coinsWon = won ? stakes * 2 : 0;
    onComplete?.(won, coinsWon);
    onClose();
  };

  if (state === "setup") {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Swords className="w-6 h-6 text-primary" />
              Trade Battle
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-muted-foreground mb-6">
            Identify chart patterns and predict market movements! Use the hint button if you need help.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Challenge a Friend (optional)</label>
              <Input
                type="email"
                placeholder="friend@email.com"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Leave empty for practice battle vs AI</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Coins className="w-4 h-4 text-coin" />
                Stakes
              </label>
              <div className="flex gap-2">
                {[25, 50, 100, 200].map((amount) => (
                  <Button
                    key={amount}
                    variant={stakes === amount ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStakes(amount)}
                    className="flex-1"
                  >
                    {amount}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold mb-2">How it works:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Recognize chart patterns (Double Top, Head & Shoulders, etc.)</li>
              <li>• Use the hint button to learn what pattern is forming</li>
              <li>• Predict if the next candle goes UP or DOWN</li>
              <li>• 5 rounds, 15 seconds each</li>
              <li>• Winner takes {stakes * 2} coins</li>
            </ul>
          </div>

          <Button className="w-full" size="lg" onClick={startBattle}>
            <Swords className="w-5 h-5 mr-2" />
            Start Battle
          </Button>
        </div>
      </div>
    );
  }

  if (state === "playing") {
    const round = rounds[currentRound];
    
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">You</div>
              <div className="text-xl font-bold text-primary">{myScore}</div>
            </div>
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
              roundTimer <= 5 ? "bg-destructive/20 text-destructive animate-pulse" : "bg-muted"
            )}>
              {roundTimer}
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Opponent</div>
              <div className="text-xl font-bold text-accent">{opponentScore}</div>
            </div>
          </div>

          <div className="text-sm font-medium">
            {currentRound + 1}/{rounds.length}
          </div>
        </div>

        {/* Game */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
          <div className="text-center mb-4">
            <div className="text-2xl font-bold">{round.symbol}</div>
            <div className="text-sm text-muted-foreground">{round.name}</div>
          </div>

          {/* Chart */}
          <BattleChart 
            candles={round.candles} 
            showNext={answered} 
            nextCandle={round.nextCandle}
          />

          {/* Hint Section */}
          {!answered && (
            <div className="w-full max-w-sm mt-4">
              {showHint ? (
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 animate-fade-in">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-primary text-sm">{round.pattern.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{round.pattern.hint}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-muted-foreground"
                  onClick={() => setShowHint(true)}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Show Pattern Hint
                </Button>
              )}
            </div>
          )}

          <h2 className="text-lg font-bold text-center my-4">
            {answered ? "Result:" : "Where will the next candle go?"}
          </h2>

          <div className="flex gap-4 w-full max-w-sm">
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "flex-1 py-6 text-lg transition-all",
                !answered && "hover:border-success hover:bg-success/10 hover:text-success",
                selected === "up" && answered && round.direction === "up" && "border-success bg-success/20 text-success",
                selected === "up" && answered && round.direction !== "up" && "border-destructive bg-destructive/20 text-destructive",
                !selected && answered && round.direction === "up" && "border-success"
              )}
              onClick={() => handleAnswer("up")}
              disabled={answered}
            >
              <TrendingUp className="w-6 h-6 mr-2" />
              Higher
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "flex-1 py-6 text-lg transition-all",
                !answered && "hover:border-destructive hover:bg-destructive/10 hover:text-destructive",
                selected === "down" && answered && round.direction === "down" && "border-success bg-success/20 text-success",
                selected === "down" && answered && round.direction !== "down" && "border-destructive bg-destructive/20 text-destructive",
                !selected && answered && round.direction === "down" && "border-success"
              )}
              onClick={() => handleAnswer("down")}
              disabled={answered}
            >
              <TrendingDown className="w-6 h-6 mr-2" />
              Lower
            </Button>
          </div>

          {answered && (
            <div className="mt-6 text-center animate-fade-in">
              <div className="bg-muted/50 rounded-xl p-3 mb-3 max-w-sm">
                <p className="text-sm font-medium text-primary">{round.pattern.name}</p>
                <p className="text-xs text-muted-foreground">{round.pattern.description}</p>
              </div>
              <p className="text-lg mb-1">
                The price moved{" "}
                <span className={cn(
                  "font-bold",
                  round.direction === "up" ? "text-success" : "text-destructive"
                )}>
                  {round.direction === "up" ? "higher" : "lower"}
                </span>
              </p>
              <p className={cn(
                "text-xl font-bold",
                selected === round.direction ? "text-success" : "text-destructive"
              )}>
                {selected === null 
                  ? "Time's up!" 
                  : selected === round.direction 
                    ? "✓ Correct!" 
                    : "✗ Wrong!"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Results
  const won = myScore > opponentScore;
  const tied = myScore === opponentScore;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full text-center animate-fade-in">
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
          won ? "bg-xp/20" : tied ? "bg-muted" : "bg-destructive/20"
        )}>
          <Trophy className={cn(
            "w-10 h-10",
            won ? "text-xp" : tied ? "text-muted-foreground" : "text-destructive"
          )} />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">
          {won ? "Victory!" : tied ? "It's a Tie!" : "Defeat"}
        </h2>
        
        <div className="flex justify-center gap-8 my-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">You</div>
            <div className="text-3xl font-bold text-primary">{myScore}</div>
          </div>
          <div className="text-2xl font-bold text-muted-foreground">vs</div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Opponent</div>
            <div className="text-3xl font-bold text-accent">{opponentScore}</div>
          </div>
        </div>

        {won && (
          <div className="bg-xp/10 rounded-xl p-4 mb-6">
            <p className="text-xp font-semibold flex items-center justify-center gap-2">
              <Coins className="w-5 h-5" />
              +{stakes * 2} coins won!
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button className="w-full" onClick={handleComplete}>
            {won ? "Claim Rewards" : "Continue"}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => {
            setState("setup");
            setCurrentRound(0);
            setMyScore(0);
            setOpponentScore(0);
            setAnswered(false);
            setSelected(null);
            setShowHint(false);
          }}>
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}
