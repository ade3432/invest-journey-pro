import { useParams, useNavigate } from "react-router-dom";
import { useMarketData } from "@/hooks/useMarketData";
import { ArrowLeft, TrendingUp, TrendingDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useAuth } from "@/contexts/AuthContext";
import TradePanel from "@/components/trading/TradePanel";
import { Skeleton } from "@/components/ui/skeleton";

function PriceChart({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  if (!data || data.length < 2) return null;

  const width = 350;
  const height = 200;
  const padding = 20;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = padding + (height - padding * 2) - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <line
          key={ratio}
          x1={padding}
          y1={padding + (height - padding * 2) * ratio}
          x2={width - padding}
          y2={padding + (height - padding * 2) * ratio}
          stroke="hsl(var(--border))"
          strokeWidth="1"
          strokeDasharray="4"
        />
      ))}
      
      {/* Area fill */}
      <polygon
        points={areaPoints}
        fill={isPositive ? "hsl(var(--success) / 0.1)" : "hsl(var(--destructive) / 0.1)"}
      />
      
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Price labels */}
      <text x={padding - 5} y={padding + 5} textAnchor="end" className="fill-muted-foreground text-xs">
        ${max.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </text>
      <text x={padding - 5} y={height - padding + 5} textAnchor="end" className="fill-muted-foreground text-xs">
        ${min.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </text>
    </svg>
  );
}

const CoinDetail = () => {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const { coins, isLoading } = useMarketData();
  const { user } = useAuth();
  const { progress, toggleFavorite } = useUserProgress();

  const coin = coins.find((c) => c.id === coinId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-lg mx-auto px-4 py-6">
          <Skeleton className="h-10 w-24 mb-6" />
          <Skeleton className="h-20 w-full mb-4" />
          <Skeleton className="h-[200px] w-full mb-6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Coin not found</p>
          <Button onClick={() => navigate("/market")}>Back to Market</Button>
        </div>
      </div>
    );
  }

  const safeChange = coin.price_change_percentage_24h ?? 0;
  const isPositive = safeChange >= 0;
  const isFavorite = (progress.favorites || []).includes(coin.id);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/market")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <button
            onClick={() => toggleFavorite(coin.id)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Star className={cn(
              "w-6 h-6 transition-colors",
              isFavorite ? "text-coin fill-coin" : "text-muted-foreground"
            )} />
          </button>
        </div>

        {/* Coin Info */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={coin.image}
            alt={coin.name}
            className="w-16 h-16 rounded-full"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{coin.name}</h1>
            <p className="text-muted-foreground uppercase">{coin.symbol}</p>
          </div>
        </div>

        {/* Price */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-1">Current Price</p>
          <p className="text-3xl font-bold text-foreground">
            ${coin.current_price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: coin.current_price < 1 ? 6 : 2
            })}
          </p>
          <div className={cn(
            "flex items-center gap-1 mt-2 font-semibold",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span>{isPositive ? "+" : ""}{safeChange.toFixed(2)}% (24h)</span>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-6">
          <h2 className="font-semibold text-foreground mb-4">7 Day Price Chart</h2>
          {coin.sparkline_in_7d?.price ? (
            <PriceChart data={coin.sparkline_in_7d.price} isPositive={isPositive} />
          ) : (
            <p className="text-muted-foreground text-center py-8">No chart data available</p>
          )}
        </div>

        {/* Market Stats */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-6">
          <h2 className="font-semibold text-foreground mb-4">Market Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Market Cap</p>
              <p className="font-semibold text-foreground">
                ${coin.market_cap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">24h Volume</p>
              <p className="font-semibold text-foreground">
                ${coin.total_volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        {/* Trade Panel */}
        {user && (
          <TradePanel
            symbol={coin.symbol}
            currentPrice={coin.current_price}
            assetType="crypto"
          />
        )}
      </div>
    </div>
  );
};

export default CoinDetail;
