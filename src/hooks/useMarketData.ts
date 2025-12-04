import { useQuery } from "@tanstack/react-query";

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

async function fetchCoins(): Promise<CoinData[]> {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true"
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch market data");
  }
  
  return response.json();
}

async function fetchFearGreedIndex(): Promise<{ value: number; classification: string }> {
  const response = await fetch("https://api.alternative.me/fng/");
  
  if (!response.ok) {
    // Return a default value if the API fails
    return { value: 50, classification: "Neutral" };
  }
  
  const data = await response.json();
  return {
    value: parseInt(data.data[0].value),
    classification: data.data[0].value_classification,
  };
}

export function useMarketData() {
  const coinsQuery = useQuery({
    queryKey: ["coins"],
    queryFn: fetchCoins,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });

  const fearGreedQuery = useQuery({
    queryKey: ["fearGreed"],
    queryFn: fetchFearGreedIndex,
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 60000,
  });

  const topGainers = coinsQuery.data
    ?.slice()
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 5);

  const topLosers = coinsQuery.data
    ?.slice()
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 5);

  return {
    coins: coinsQuery.data || [],
    isLoading: coinsQuery.isLoading,
    error: coinsQuery.error,
    topGainers,
    topLosers,
    fearGreedIndex: fearGreedQuery.data?.value ?? 50,
    refetch: coinsQuery.refetch,
  };
}
