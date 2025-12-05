import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Star } from "lucide-react";
import { Sparkline } from "./Sparkline";

interface CoinCardProps {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  image: string;
  sparklineData?: number[];
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
}

export function CoinCard({
  name,
  symbol,
  price,
  change24h,
  image,
  sparklineData,
  isFavorite = false,
  onToggleFavorite,
  onClick,
}: CoinCardProps) {
  const isPositive = change24h >= 0;

  return (
    <div
      className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all cursor-pointer active:scale-[0.98]"
      onClick={onClick}
    >
      <img
        src={image}
        alt={name}
        className="w-12 h-12 rounded-full"
      />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-foreground truncate">{name}</h3>
        <p className="text-sm text-muted-foreground uppercase">{symbol}</p>
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <Sparkline 
          data={sparklineData} 
          isPositive={isPositive}
          width={60}
          height={28}
        />
      )}

      <div className="text-right">
        <p className="font-bold text-foreground">
          ${price.toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: price < 1 ? 6 : 2 
          })}
        </p>
        <div className={cn(
          "flex items-center justify-end gap-1 text-sm font-semibold",
          isPositive ? "text-success" : "text-destructive"
        )}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{isPositive ? "+" : ""}{change24h.toFixed(2)}%</span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite?.();
        }}
        className="p-2 rounded-full hover:bg-muted transition-colors"
      >
        <Star className={cn(
          "w-5 h-5 transition-colors",
          isFavorite ? "text-coin fill-coin" : "text-muted-foreground"
        )} />
      </button>
    </div>
  );
}
