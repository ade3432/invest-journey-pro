import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet, TrendingUp, TrendingDown, PieChart, History } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PortfolioSummary() {
  const { user } = useAuth();
  const { portfolio, holdings, trades, loading } = usePortfolio();

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading portfolio...</p>
        </CardContent>
      </Card>
    );
  }

  const profitLossPercent = portfolio 
    ? ((portfolio.totalProfitLoss / 10000) * 100).toFixed(2)
    : '0.00';
  const isProfit = (portfolio?.totalProfitLoss ?? 0) >= 0;

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Paper Trading Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-bold">
                ${portfolio?.balance.toLocaleString() ?? '10,000.00'}
              </p>
              <p className="text-sm text-muted-foreground">Available Cash</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-lg font-semibold">
                  ${portfolio?.totalValue.toLocaleString() ?? '10,000.00'}
                </p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
              <div>
                <p className={cn(
                  "text-lg font-semibold flex items-center gap-1",
                  isProfit ? "text-green-500" : "text-red-500"
                )}>
                  {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {isProfit ? '+' : ''}{profitLossPercent}%
                </p>
                <p className="text-xs text-muted-foreground">P&L</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holdings */}
      {holdings.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Holdings ({holdings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {holdings.map((holding) => (
              <div key={holding.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-medium">{holding.symbol}</p>
                  <p className="text-xs text-muted-foreground">
                    {holding.quantity.toFixed(4)} @ ${holding.avgBuyPrice.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${(holding.quantity * holding.avgBuyPrice).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Trades */}
      {trades.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <History className="w-4 h-4" />
              Recent Trades
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {trades.slice(0, 5).map((trade) => (
              <div key={trade.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-medium flex items-center gap-1">
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      trade.tradeType === 'buy' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                    )}>
                      {trade.tradeType.toUpperCase()}
                    </span>
                    {trade.symbol}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(trade.executedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${trade.totalValue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {trade.quantity.toFixed(4)} @ ${trade.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
