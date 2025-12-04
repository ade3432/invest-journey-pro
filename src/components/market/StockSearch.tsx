import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStockData } from "@/hooks/useStockData";
import { Search, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockSearchProps {
  onSelectStock: (symbol: string, price: number) => void;
}

export default function StockSearch({ onSelectStock }: StockSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ symbol: string; name: string; type: string; region: string }>>([]);
  const [selectedQuote, setSelectedQuote] = useState<{
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
  } | null>(null);
  const { loading, searchSymbols, getQuote } = useStockData();

  const handleSearch = async () => {
    if (!query.trim()) return;
    const matches = await searchSymbols(query);
    setResults(matches);
    setSelectedQuote(null);
  };

  const handleSelectSymbol = async (symbol: string) => {
    const quote = await getQuote(symbol);
    if (quote) {
      setSelectedQuote({
        symbol: quote.symbol,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
      });
      onSelectStock(quote.symbol, quote.price);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stocks (e.g., AAPL, GOOGL)"
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      {selectedQuote && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{selectedQuote.symbol}</h3>
                <p className="text-2xl font-bold">${selectedQuote.price.toFixed(2)}</p>
              </div>
              <div className={cn(
                "flex items-center gap-1 text-lg font-semibold",
                selectedQuote.change >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {selectedQuote.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {selectedQuote.change >= 0 ? '+' : ''}{selectedQuote.changePercent.toFixed(2)}%
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && !selectedQuote && (
        <Card className="border-border/50">
          <CardContent className="p-2">
            <div className="max-h-60 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.symbol}
                  className="w-full text-left p-3 hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => handleSelectSymbol(result.symbol)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{result.symbol}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {result.name}
                      </p>
                    </div>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {result.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
