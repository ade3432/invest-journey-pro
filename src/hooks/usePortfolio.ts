import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Portfolio {
  id: string;
  balance: number;
  totalValue: number;
  totalProfitLoss: number;
}

interface Holding {
  id: string;
  symbol: string;
  assetType: string;
  quantity: number;
  avgBuyPrice: number;
}

interface Trade {
  id: string;
  symbol: string;
  assetType: string;
  tradeType: string;
  quantity: number;
  price: number;
  totalValue: number;
  executedAt: string;
}

export function usePortfolio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (portfolioError) throw portfolioError;

      setPortfolio({
        id: portfolioData.id,
        balance: Number(portfolioData.balance),
        totalValue: Number(portfolioData.total_value),
        totalProfitLoss: Number(portfolioData.total_profit_loss),
      });

      const { data: holdingsData, error: holdingsError } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('portfolio_id', portfolioData.id);

      if (holdingsError) throw holdingsError;

      setHoldings(holdingsData.map(h => ({
        id: h.id,
        symbol: h.symbol,
        assetType: h.asset_type,
        quantity: Number(h.quantity),
        avgBuyPrice: Number(h.avg_buy_price),
      })));

      const { data: tradesData, error: tradesError } = await supabase
        .from('paper_trades')
        .select('*')
        .eq('user_id', user.id)
        .order('executed_at', { ascending: false })
        .limit(50);

      if (tradesError) throw tradesError;

      setTrades(tradesData.map(t => ({
        id: t.id,
        symbol: t.symbol,
        assetType: t.asset_type,
        tradeType: t.trade_type,
        quantity: Number(t.quantity),
        price: Number(t.price),
        totalValue: Number(t.total_value),
        executedAt: t.executed_at,
      })));
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const executeTrade = async (
    symbol: string,
    assetType: 'crypto' | 'stock',
    tradeType: 'buy' | 'sell',
    quantity: number,
    price: number
  ) => {
    if (!user || !portfolio) return false;

    const totalValue = quantity * price;

    if (tradeType === 'buy' && totalValue > portfolio.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this trade.",
        variant: "destructive",
      });
      return false;
    }

    if (tradeType === 'sell') {
      const holding = holdings.find(h => h.symbol === symbol);
      if (!holding || holding.quantity < quantity) {
        toast({
          title: "Insufficient holdings",
          description: "You don't have enough of this asset to sell.",
          variant: "destructive",
        });
        return false;
      }
    }

    try {
      // Record the trade
      const { error: tradeError } = await supabase
        .from('paper_trades')
        .insert({
          user_id: user.id,
          portfolio_id: portfolio.id,
          symbol,
          asset_type: assetType,
          trade_type: tradeType,
          order_type: 'market',
          quantity,
          price,
          total_value: totalValue,
        });

      if (tradeError) throw tradeError;

      // Update portfolio balance
      const newBalance = tradeType === 'buy' 
        ? portfolio.balance - totalValue 
        : portfolio.balance + totalValue;

      const { error: portfolioError } = await supabase
        .from('portfolios')
        .update({ balance: newBalance })
        .eq('id', portfolio.id);

      if (portfolioError) throw portfolioError;

      // Update holdings
      const existingHolding = holdings.find(h => h.symbol === symbol);

      if (tradeType === 'buy') {
        if (existingHolding) {
          const newQuantity = existingHolding.quantity + quantity;
          const newAvgPrice = ((existingHolding.avgBuyPrice * existingHolding.quantity) + (price * quantity)) / newQuantity;
          
          const { error } = await supabase
            .from('portfolio_holdings')
            .update({ quantity: newQuantity, avg_buy_price: newAvgPrice })
            .eq('id', existingHolding.id);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('portfolio_holdings')
            .insert({
              portfolio_id: portfolio.id,
              symbol,
              asset_type: assetType,
              quantity,
              avg_buy_price: price,
            });
          
          if (error) throw error;
        }
      } else {
        if (existingHolding) {
          const newQuantity = existingHolding.quantity - quantity;
          
          if (newQuantity <= 0) {
            const { error } = await supabase
              .from('portfolio_holdings')
              .delete()
              .eq('id', existingHolding.id);
            
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('portfolio_holdings')
              .update({ quantity: newQuantity })
              .eq('id', existingHolding.id);
            
            if (error) throw error;
          }
        }
      }

      toast({
        title: `${tradeType === 'buy' ? 'Bought' : 'Sold'} ${symbol}`,
        description: `${quantity} units at $${price.toFixed(2)}`,
      });

      await fetchPortfolio();
      return true;
    } catch (error) {
      console.error('Error executing trade:', error);
      toast({
        title: "Trade failed",
        description: "An error occurred while executing the trade.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    portfolio,
    holdings,
    trades,
    loading,
    executeTrade,
    refreshPortfolio: fetchPortfolio,
  };
}
