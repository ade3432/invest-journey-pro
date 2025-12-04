import { useState } from "react";
import { TopHeader } from "@/components/navigation/TopHeader";
import { MarketSentiment } from "@/components/market/MarketSentiment";
import { CoinCard } from "@/components/market/CoinCard";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useMarketData } from "@/hooks/useMarketData";
import { Search, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = "all" | "gainers" | "losers" | "watchlist";

const Market = () => {
  const { progress, toggleFavorite } = useUserProgress();
  const { coins, isLoading, topGainers, topLosers, fearGreedIndex, refetch } = useMarketData();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");

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
        return progress.favorites.includes(coin.id);
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

  const tabs = [
    { id: "all" as Tab, label: "All" },
    { id: "gainers" as Tab, label: "Gainers", icon: TrendingUp },
    { id: "losers" as Tab, label: "Losers", icon: TrendingDown },
    { id: "watchlist" as Tab, label: "Watchlist" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopHeader
        streak={progress.streak}
        hearts={progress.hearts}
        coins={progress.coins}
      />

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-6">
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
        <div className="flex gap-4 mb-6">
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
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
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CoinCard
                  name={coin.name}
                  symbol={coin.symbol}
                  price={coin.current_price}
                  change24h={coin.price_change_percentage_24h}
                  image={coin.image}
                  isFavorite={progress.favorites.includes(coin.id)}
                  onToggleFavorite={() => toggleFavorite(coin.id)}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {activeTab === "watchlist"
                  ? "No coins in your watchlist yet. Star some coins!"
                  : "No coins found."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Market;
