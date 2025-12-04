import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Swords, Trophy, TrendingUp, TrendingDown, Users, Coins, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TradeBattleProps {
  onClose: () => void;
  onComplete?: (won: boolean, coinsWon: number) => void;
}

type BattleState = "setup" | "waiting" | "playing" | "results";

interface TradeRound {
  symbol: string;
  startPrice: number;
  endPrice: number;
  direction: "up" | "down";
}

const TRADE_ROUNDS: TradeRound[] = [
  { symbol: "BTC", startPrice: 42150, endPrice: 43200, direction: "up" },
  { symbol: "ETH", startPrice: 2280, endPrice: 2195, direction: "down" },
  { symbol: "AAPL", startPrice: 178.50, endPrice: 182.30, direction: "up" },
  { symbol: "TSLA", startPrice: 248.00, endPrice: 235.50, direction: "down" },
  { symbol: "NVDA", startPrice: 485.00, endPrice: 502.00, direction: "up" },
];

export function TradeBattle({ onClose, onComplete }: TradeBattleProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<BattleState>("setup");
  const [stakes, setStakes] = useState(50);
  const [friendEmail, setFriendEmail] = useState("");
  const [rounds] = useState(() => [...TRADE_ROUNDS].sort(() => Math.random() - 0.5).slice(0, 5));
  const [currentRound, setCurrentRound] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<"up" | "down" | null>(null);
  const [roundTimer, setRoundTimer] = useState(10);

  // Simulate opponent (in real app, this would be real-time)
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

    // For demo, start practice battle immediately
    setState("playing");
    setRoundTimer(10);
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

    // Simulate opponent (70% accuracy for challenge)
    const opponentCorrect = Math.random() > 0.3;
    if (opponentCorrect) {
      setOpponentScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentRound < rounds.length - 1) {
        setCurrentRound(prev => prev + 1);
        setAnswered(false);
        setSelected(null);
        setRoundTimer(10);
      } else {
        setState("results");
      }
    }, 2000);
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
            Compete to predict market movements! Winner takes all coins.
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
              <li>• 5 rounds of price predictions</li>
              <li>• 10 seconds per round</li>
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
              "w-10 h-10 rounded-full flex items-center justify-center font-bold",
              roundTimer <= 3 ? "bg-red-500/20 text-red-500" : "bg-muted"
            )}>
              {roundTimer}
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Opponent</div>
              <div className="text-xl font-bold text-accent">{opponentScore}</div>
            </div>
          </div>

          <div className="text-sm">
            {currentRound + 1}/{rounds.length}
          </div>
        </div>

        {/* Game */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center mb-8">
            <div className="text-4xl font-bold mb-2">{round.symbol}</div>
            <div className="text-2xl text-muted-foreground">${round.startPrice.toLocaleString()}</div>
          </div>

          <h2 className="text-xl font-bold text-center mb-8">
            Will the price go UP or DOWN?
          </h2>

          <div className="flex gap-4 w-full max-w-md">
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "flex-1 py-8 text-lg",
                "hover:border-green-500 hover:bg-green-500/10 hover:text-green-500",
                selected === "up" && answered && round.direction === "up" && "border-green-500 bg-green-500/20 text-green-500",
                selected === "up" && answered && round.direction !== "up" && "border-red-500 bg-red-500/20 text-red-500",
                answered && round.direction === "up" && "border-green-500"
              )}
              onClick={() => handleAnswer("up")}
              disabled={answered}
            >
              <TrendingUp className="w-6 h-6 mr-2" />
              UP
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "flex-1 py-8 text-lg",
                "hover:border-red-500 hover:bg-red-500/10 hover:text-red-500",
                selected === "down" && answered && round.direction === "down" && "border-green-500 bg-green-500/20 text-green-500",
                selected === "down" && answered && round.direction !== "down" && "border-red-500 bg-red-500/20 text-red-500",
                answered && round.direction === "down" && "border-green-500"
              )}
              onClick={() => handleAnswer("down")}
              disabled={answered}
            >
              <TrendingDown className="w-6 h-6 mr-2" />
              DOWN
            </Button>
          </div>

          {answered && (
            <div className="mt-8 text-center animate-fade-in">
              <p className="text-lg">
                Price moved to <span className="font-bold">${round.endPrice.toLocaleString()}</span>
              </p>
              <p className={cn(
                "font-semibold",
                selected === round.direction ? "text-green-500" : "text-red-500"
              )}>
                {selected === round.direction ? "Correct!" : "Wrong!"}
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
          won ? "bg-xp/20" : tied ? "bg-muted" : "bg-red-500/20"
        )}>
          <Trophy className={cn(
            "w-10 h-10",
            won ? "text-xp" : tied ? "text-muted-foreground" : "text-red-500"
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
          }}>
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}
