import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
}

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
}

export function useStockData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getQuote = useCallback(async (symbol: string): Promise<StockQuote | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('alpha-vantage', {
        body: { action: 'quote', symbol },
      });

      if (fnError) throw fnError;

      const quote = data['Global Quote'];
      if (!quote) {
        throw new Error('No data found for this symbol');
      }

      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent']?.replace('%', '') ?? '0'),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        previousClose: parseFloat(quote['08. previous close']),
        volume: parseInt(quote['06. volume']),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stock data';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchSymbols = useCallback(async (keywords: string): Promise<SearchResult[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('alpha-vantage', {
        body: { action: 'search', symbol: keywords },
      });

      if (fnError) throw fnError;

      const matches = data['bestMatches'] ?? [];
      return matches.map((m: Record<string, string>) => ({
        symbol: m['1. symbol'],
        name: m['2. name'],
        type: m['3. type'],
        region: m['4. region'],
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getTechnicalIndicator = useCallback(async (
    symbol: string,
    indicator: 'rsi' | 'macd' | 'sma' | 'ema',
    interval: string = 'daily'
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('alpha-vantage', {
        body: { action: indicator, symbol, interval },
      });

      if (fnError) throw fnError;

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch indicator';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getForexRate = useCallback(async (fromCurrency: string, toCurrency: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('alpha-vantage', {
        body: { action: 'forex', symbol: `${fromCurrency}/${toCurrency}` },
      });

      if (fnError) throw fnError;

      const rate = data['Realtime Currency Exchange Rate'];
      if (!rate) return null;

      return {
        from: rate['1. From_Currency Code'],
        to: rate['3. To_Currency Code'],
        rate: parseFloat(rate['5. Exchange Rate']),
        lastUpdated: rate['6. Last Refreshed'],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch forex rate';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getQuote,
    searchSymbols,
    getTechnicalIndicator,
    getForexRate,
  };
}
