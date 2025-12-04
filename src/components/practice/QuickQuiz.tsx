import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Clock, Trophy, Check, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickQuizProps {
  onClose: () => void;
  onComplete: (score: number, total: number) => void;
}

const QUIZ_QUESTIONS = [
  { question: "What does 'bullish' mean in trading?", options: ["Expecting prices to fall", "Expecting prices to rise", "Market is closed", "High volatility"], correctIndex: 1 },
  { question: "What is a 'stop-loss' order?", options: ["An order to buy more", "An order to sell at profit", "An order to limit losses", "A market order"], correctIndex: 2 },
  { question: "What does P/E ratio stand for?", options: ["Profit/Expense", "Price/Earnings", "Performance/Equity", "Potential/Estimate"], correctIndex: 1 },
  { question: "What is market capitalization?", options: ["Total company debt", "Share price × shares outstanding", "Annual revenue", "Profit margin"], correctIndex: 1 },
  { question: "What does 'going short' mean?", options: ["Buying quickly", "Selling borrowed shares", "Small investment", "Day trading"], correctIndex: 1 },
  { question: "What is a dividend?", options: ["Stock split", "Company debt", "Profit paid to shareholders", "Trading fee"], correctIndex: 2 },
  { question: "What is an IPO?", options: ["Internal Price Option", "Initial Public Offering", "Investment Portfolio Order", "Index Performance Outcome"], correctIndex: 1 },
  { question: "What does 'bearish' indicate?", options: ["Market optimism", "Market pessimism", "Neutral market", "High volume"], correctIndex: 1 },
  { question: "What is a candlestick chart used for?", options: ["Tracking dividends", "Showing price movement", "Calculating taxes", "Measuring volume only"], correctIndex: 1 },
  { question: "What is diversification?", options: ["Buying one stock", "Spreading investments", "Day trading", "Shorting stocks"], correctIndex: 1 },
  { question: "What is a limit order?", options: ["Unlimited buying", "Order at specific price", "Market price order", "Stop order"], correctIndex: 1 },
  { question: "What does ROI stand for?", options: ["Rate of Interest", "Return on Investment", "Risk of Investment", "Revenue of Income"], correctIndex: 1 },
  { question: "What is a bull market?", options: ["Declining prices", "Rising prices", "Flat market", "Volatile market"], correctIndex: 1 },
  { question: "What is liquidity?", options: ["Company profits", "Ease of buying/selling", "Debt level", "Market timing"], correctIndex: 1 },
  { question: "What is a portfolio?", options: ["Single stock", "Collection of investments", "Trading platform", "Market index"], correctIndex: 1 },
];

export function QuickQuiz({ onClose, onComplete }: QuickQuizProps) {
  const [questions] = useState(() => 
    [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isComplete, timeLeft]);

  const handleSelect = useCallback((index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    
    const correct = index === questions[currentIndex].correctIndex;
    if (correct) setScore(prev => prev + 1);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelected(null);
        setAnswered(false);
      } else {
        setIsComplete(true);
      }
    }, 1000);
  }, [answered, currentIndex, questions]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-xp/20 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-xp" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-4xl font-bold text-primary mb-2">{score}/{questions.length}</p>
          <p className="text-muted-foreground mb-6">{percentage}% correct</p>
          
          <div className="space-y-3">
            <Button className="w-full" onClick={() => onComplete(score, questions.length)}>
              Claim {score * 5} XP
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
            timeLeft < 60 ? "bg-red-500/20 text-red-500" : "bg-muted"
          )}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm font-medium">
            {currentIndex + 1}/{questions.length}
          </div>
        </div>

        <div className="text-sm font-bold text-xp">
          {score} pts
        </div>
      </div>

      {/* Progress */}
      <Progress value={(currentIndex / questions.length) * 100} className="h-1" />

      {/* Question */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-center mb-8">{question.question}</h2>
          
          <div className="grid gap-3">
            {question.options.map((option, i) => (
              <Button
                key={i}
                variant="outline"
                className={cn(
                  "h-auto py-4 px-6 text-left justify-start",
                  selected === i && answered && i === question.correctIndex && "border-green-500 bg-green-500/10",
                  selected === i && answered && i !== question.correctIndex && "border-red-500 bg-red-500/10",
                  answered && i === question.correctIndex && "border-green-500"
                )}
                onClick={() => handleSelect(i)}
                disabled={answered}
              >
                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 text-sm font-medium shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{option}</span>
                {answered && i === question.correctIndex && <Check className="w-5 h-5 text-green-500 shrink-0" />}
                {answered && selected === i && i !== question.correctIndex && <XIcon className="w-5 h-5 text-red-500 shrink-0" />}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
