import { useState } from "react";
import { TopHeader } from "@/components/navigation/TopHeader";
import { MarketSentiment } from "@/components/market/MarketSentiment";
import { CoinCard } from "@/components/market/CoinCard";
import { useAuth } from "@/contexts/AuthContext";
import { useCloudProgress } from "@/hooks/useCloudProgress";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useMarketData } from "@/hooks/useMarketData";
import StockSearch from "@/components/market/StockSearch";
import TradePanel from "@/components/trading/TradePanel";
import PortfolioSummary from "@/components/trading/PortfolioSummary";
import { Search, TrendingUp, TrendingDown, RefreshCw, BarChart3, Coins } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type CryptoTab = "all" | "gainers" | "losers" | "watchlist";

const Market = () => {
  const { user } = useAuth();
  const { progress: cloudProgress } = useCloudProgress();
  const { progress: localProgress, toggleFavorite } = useUserProgress();
  const progress = user ? cloudProgress : localProgress;
  
  const { coins, isLoading, topGainers, topLosers, fearGreedIndex, refetch } = useMarketData();
  const [activeTab, setActiveTab] = useState<CryptoTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; price: number } | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<{ symbol: string; price: number } | null>(null);

  const filteredCoins = coins.filter((coin) => {
    const matchesSearch =
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (activeTab) {
      case "gainers":
        return coin.price_change_percentage_24h > 0;
      case "losers":
        return coin.price_change_percentage_24h < 0;
      case "watchlist":
        return (localProgress.favorites || []).includes(coin.id);
      default:
        return true;
    }
  });

  const displayCoins =
    activeTab === "gainers"
      ? topGainers
      : activeTab === "losers"
      ? topLosers
      : filteredCoins.slice(0, 20);

  const cryptoTabs = [
    { id: "all" as CryptoTab, label: "All" },
    { id: "gainers" as CryptoTab, label: "Gainers", icon: TrendingUp },
    { id: "losers" as CryptoTab, label: "Losers", icon: TrendingDown },
    { id: "watchlist" as CryptoTab, label: "Watchlist" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopHeader
        streak={progress.streak}
        hearts={progress.hearts}
        coins={progress.coins}
      />

      <main className="max-w-lg mx-auto px-4 py-6">
        <Tabs defaultValue="crypto" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="crypto" className="flex items-center gap-1">
              <Coins className="w-4 h-4" />
              Crypto
            </TabsTrigger>
            <TabsTrigger value="stocks" className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              Stocks
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-1">
              Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crypto" className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search coins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Sentiment + Refresh */}
            <div className="flex gap-4">
              <MarketSentiment value={fearGreedIndex} className="flex-1" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                className="h-auto aspect-square rounded-2xl"
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
            </div>

            {/* Crypto Tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {cryptoTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.icon && <tab.icon className="w-4 h-4" />}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Coin List */}
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-5 w-20 mb-2" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))
              ) : displayCoins && displayCoins.length > 0 ? (
                displayCoins.map((coin, index) => (
                  <div
                    key={coin.id}
                    className="animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setSelectedCrypto({ symbol: coin.symbol, price: coin.current_price })}
                  >
                    <CoinCard
                      name={coin.name}
                      symbol={coin.symbol}
                      price={coin.current_price}
                      change24h={coin.price_change_percentage_24h}
                      image={coin.image}
                      sparklineData={coin.sparkline_in_7d?.price}
                      isFavorite={(localProgress.favorites || []).includes(coin.id)}
                      onToggleFavorite={() => toggleFavorite(coin.id)}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {activeTab === "watchlist"
                      ? "No coins in your watchlist yet."
                      : "No coins found."}
                  </p>
                </div>
              )}
            </div>

            {/* Trade Panel for selected crypto */}
            {selectedCrypto && user && (
              <div className="mt-4">
                <TradePanel
                  symbol={selectedCrypto.symbol}
                  currentPrice={selectedCrypto.price}
                  assetType="crypto"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="stocks" className="space-y-4">
            <StockSearch onSelectStock={(symbol, price) => setSelectedStock({ symbol, price })} />
            
            {selectedStock && user && (
              <TradePanel
                symbol={selectedStock.symbol}
                currentPrice={selectedStock.price}
                assetType="stock"
              />
            )}

            {!user && (
              <div className="text-center py-8 text-muted-foreground">
                Sign in to paper trade stocks
              </div>
            )}
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioSummary />
            {!user && (
              <div className="text-center py-8 text-muted-foreground">
                Sign in to view your portfolio
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Market;
