import { cn } from "@/lib/utils";

interface MarketSentimentProps {
  value: number; // 0-100
  className?: string;
}

export function MarketSentiment({ value, className }: MarketSentimentProps) {
  const getSentiment = (val: number) => {
    if (val <= 25) return { label: "Extreme Fear", color: "text-destructive", emoji: "😨" };
    if (val <= 45) return { label: "Fear", color: "text-warning", emoji: "😟" };
    if (val <= 55) return { label: "Neutral", color: "text-muted-foreground", emoji: "😐" };
    if (val <= 75) return { label: "Greed", color: "text-success", emoji: "😊" };
    return { label: "Extreme Greed", color: "text-primary", emoji: "🤑" };
  };

  const sentiment = getSentiment(value);

  return (
    <div className={cn("bg-card rounded-2xl p-4 border border-border", className)}>
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Market Sentiment</h3>
      
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          {/* Gauge background */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-muted"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={cn(
                value <= 25 ? "text-destructive" :
                value <= 45 ? "text-warning" :
                value <= 55 ? "text-muted-foreground" :
                value <= 75 ? "text-success" :
                "text-primary"
              )}
              strokeWidth="3"
              strokeDasharray={`${value}, 100`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">{sentiment.emoji}</span>
          </div>
        </div>

        <div>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <p className={cn("font-semibold", sentiment.color)}>{sentiment.label}</p>
        </div>
      </div>
    </div>
  );
}
