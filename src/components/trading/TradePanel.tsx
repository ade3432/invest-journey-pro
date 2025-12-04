import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowUpRight, ArrowDownRight, Wallet, Loader2 } from "lucide-react";

interface TradePanelProps {
  symbol: string;
  currentPrice: number;
  assetType: 'crypto' | 'stock';
}

export default function TradePanel({ symbol, currentPrice, assetType }: TradePanelProps) {
  const { user } = useAuth();
  const { portfolio, holdings, executeTrade } = usePortfolio();
  const [quantity, setQuantity] = useState("");
  const [isTrading, setIsTrading] = useState(false);

  const holding = holdings.find(h => h.symbol.toLowerCase() === symbol.toLowerCase());
  const totalCost = Number(quantity) * currentPrice;

  const handleTrade = async (type: 'buy' | 'sell') => {
    if (!quantity || Number(quantity) <= 0) return;
    
    setIsTrading(true);
    await executeTrade(symbol.toUpperCase(), assetType, type, Number(quantity), currentPrice);
    setQuantity("");
    setIsTrading(false);
  };

  if (!user) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Sign in to start paper trading</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Paper Trade
        </CardTitle>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Balance:</span>
          <span className="font-medium">${portfolio?.balance.toLocaleString() ?? '0'}</span>
        </div>
        {holding && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Holdings:</span>
            <span className="font-medium">{holding.quantity.toFixed(4)} {symbol.toUpperCase()}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="buy" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-500">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              Sell
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="buy" className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                step="any"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price:</span>
              <span>${currentPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Total:</span>
              <span>${totalCost.toLocaleString()}</span>
            </div>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => handleTrade('buy')}
              disabled={isTrading || !quantity || totalCost > (portfolio?.balance ?? 0)}
            >
              {isTrading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Buy {symbol.toUpperCase()}
            </Button>
          </TabsContent>
          
          <TabsContent value="sell" className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                step="any"
                max={holding?.quantity ?? 0}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price:</span>
              <span>${currentPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Total:</span>
              <span>${totalCost.toLocaleString()}</span>
            </div>
            <Button 
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={() => handleTrade('sell')}
              disabled={isTrading || !quantity || Number(quantity) > (holding?.quantity ?? 0)}
            >
              {isTrading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sell {symbol.toUpperCase()}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
