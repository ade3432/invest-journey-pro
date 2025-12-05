import { useState } from "react";
import { X, ChevronRight, TrendingUp, TrendingDown, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ChartPattern {
  id: string;
  name: string;
  category: "reversal" | "continuation";
  signal: "bullish" | "bearish" | "neutral";
  description: string;
  howToSpot: string[];
  tradingTip: string;
  candles: Candle[];
  highlightLast: number;
}

const ADVANCED_PATTERNS: ChartPattern[] = [
  {
    id: "double-top",
    name: "Double Top",
    category: "reversal",
    signal: "bearish",
    description: "A bearish reversal pattern that forms after an uptrend. The price reaches a high point twice with a moderate decline between the two highs.",
    howToSpot: [
      "Two peaks at approximately the same price level",
      "A valley (neckline) between the peaks",
      "Volume typically decreases on the second peak",
      "Confirmation when price breaks below the neckline"
    ],
    tradingTip: "Wait for the price to break below the neckline before entering a short position. The target is typically the distance from the peaks to the neckline.",
    candles: [
      { open: 90, high: 92, low: 89, close: 91 },
      { open: 91, high: 95, low: 90, close: 94 },
      { open: 94, high: 100, low: 93, close: 99 },
      { open: 99, high: 100, low: 94, close: 95 },
      { open: 95, high: 97, low: 94, close: 96 },
      { open: 96, high: 100, low: 95, close: 99 },
      { open: 99, high: 100, low: 93, close: 94 },
    ],
    highlightLast: 5,
  },
  {
    id: "double-bottom",
    name: "Double Bottom",
    category: "reversal",
    signal: "bullish",
    description: "A bullish reversal pattern that forms after a downtrend. The price reaches a low point twice with a moderate rise between the two lows.",
    howToSpot: [
      "Two troughs at approximately the same price level",
      "A peak (neckline) between the troughs",
      "Volume typically increases on the second bottom",
      "Confirmation when price breaks above the neckline"
    ],
    tradingTip: "Enter a long position when price breaks above the neckline. Set stop-loss below the second bottom.",
    candles: [
      { open: 100, high: 101, low: 99, close: 99 },
      { open: 99, high: 100, low: 94, close: 95 },
      { open: 95, high: 96, low: 90, close: 91 },
      { open: 91, high: 96, low: 90, close: 95 },
      { open: 95, high: 97, low: 94, close: 94 },
      { open: 94, high: 95, low: 90, close: 91 },
      { open: 91, high: 98, low: 90, close: 97 },
    ],
    highlightLast: 5,
  },
  {
    id: "head-shoulders",
    name: "Head and Shoulders",
    category: "reversal",
    signal: "bearish",
    description: "A highly reliable bearish reversal pattern with three peaks: a higher peak (head) between two lower peaks (shoulders).",
    howToSpot: [
      "Left shoulder: price rise followed by decline",
      "Head: higher price rise followed by decline",
      "Right shoulder: rise similar to left shoulder",
      "Neckline connects the two troughs"
    ],
    tradingTip: "Short when price breaks below the neckline. Target is the distance from head to neckline projected downward.",
    candles: [
      { open: 90, high: 95, low: 89, close: 94 },
      { open: 94, high: 95, low: 91, close: 92 },
      { open: 92, high: 100, low: 91, close: 99 },
      { open: 99, high: 100, low: 92, close: 93 },
      { open: 93, high: 96, low: 92, close: 95 },
      { open: 95, high: 96, low: 89, close: 90 },
    ],
    highlightLast: 6,
  },
  {
    id: "inverse-head-shoulders",
    name: "Inverse Head and Shoulders",
    category: "reversal",
    signal: "bullish",
    description: "A bullish reversal pattern that is the mirror image of head and shoulders, signaling the end of a downtrend.",
    howToSpot: [
      "Left shoulder: price decline followed by rise",
      "Head: lower price decline followed by rise",
      "Right shoulder: decline similar to left shoulder",
      "Neckline connects the two peaks"
    ],
    tradingTip: "Go long when price breaks above the neckline. Target is the distance from head to neckline projected upward.",
    candles: [
      { open: 100, high: 101, low: 95, close: 96 },
      { open: 96, high: 98, low: 95, close: 97 },
      { open: 97, high: 98, low: 90, close: 91 },
      { open: 91, high: 98, low: 90, close: 97 },
      { open: 97, high: 98, low: 94, close: 95 },
      { open: 95, high: 100, low: 94, close: 99 },
    ],
    highlightLast: 6,
  },
  {
    id: "ascending-triangle",
    name: "Ascending Triangle",
    category: "continuation",
    signal: "bullish",
    description: "A bullish continuation pattern where price makes higher lows while resistance remains flat, showing increasing buying pressure.",
    howToSpot: [
      "Flat or horizontal resistance line",
      "Rising support line (higher lows)",
      "Price consolidates in a tightening range",
      "Breakout typically occurs upward"
    ],
    tradingTip: "Enter long on breakout above resistance with increased volume. Stop-loss below the last higher low.",
    candles: [
      { open: 90, high: 98, low: 89, close: 97 },
      { open: 97, high: 98, low: 92, close: 93 },
      { open: 93, high: 98, low: 92, close: 97 },
      { open: 97, high: 98, low: 94, close: 95 },
      { open: 95, high: 98, low: 94, close: 97 },
      { open: 97, high: 102, low: 96, close: 101 },
    ],
    highlightLast: 5,
  },
  {
    id: "descending-triangle",
    name: "Descending Triangle",
    category: "continuation",
    signal: "bearish",
    description: "A bearish continuation pattern where price makes lower highs while support remains flat, showing increasing selling pressure.",
    howToSpot: [
      "Flat or horizontal support line",
      "Falling resistance line (lower highs)",
      "Price consolidates in a tightening range",
      "Breakout typically occurs downward"
    ],
    tradingTip: "Enter short on breakout below support. Stop-loss above the last lower high.",
    candles: [
      { open: 100, high: 101, low: 92, close: 93 },
      { open: 93, high: 99, low: 92, close: 98 },
      { open: 98, high: 99, low: 92, close: 93 },
      { open: 93, high: 97, low: 92, close: 96 },
      { open: 96, high: 97, low: 92, close: 93 },
      { open: 93, high: 94, low: 88, close: 89 },
    ],
    highlightLast: 5,
  },
  {
    id: "bull-flag",
    name: "Bull Flag",
    category: "continuation",
    signal: "bullish",
    description: "A bullish continuation pattern that looks like a flag on a pole. Forms during a strong uptrend with a brief consolidation.",
    howToSpot: [
      "Strong upward move (the pole)",
      "Parallel downward sloping consolidation (the flag)",
      "Decreasing volume during consolidation",
      "Breakout with increased volume"
    ],
    tradingTip: "Buy on breakout above the flag's upper trendline. Target is the pole's length added to breakout point.",
    candles: [
      { open: 85, high: 90, low: 84, close: 89 },
      { open: 89, high: 96, low: 88, close: 95 },
      { open: 95, high: 100, low: 94, close: 99 },
      { open: 99, high: 100, low: 96, close: 97 },
      { open: 97, high: 98, low: 95, close: 96 },
      { open: 96, high: 102, low: 95, close: 101 },
    ],
    highlightLast: 4,
  },
  {
    id: "bear-flag",
    name: "Bear Flag",
    category: "continuation",
    signal: "bearish",
    description: "A bearish continuation pattern that looks like an inverted flag. Forms during a strong downtrend with a brief consolidation.",
    howToSpot: [
      "Strong downward move (the pole)",
      "Parallel upward sloping consolidation (the flag)",
      "Decreasing volume during consolidation",
      "Breakdown with increased volume"
    ],
    tradingTip: "Short on breakdown below the flag's lower trendline. Target is the pole's length subtracted from breakdown point.",
    candles: [
      { open: 105, high: 106, low: 100, close: 101 },
      { open: 101, high: 102, low: 95, close: 96 },
      { open: 96, high: 97, low: 90, close: 91 },
      { open: 91, high: 94, low: 90, close: 93 },
      { open: 93, high: 95, low: 92, close: 94 },
      { open: 94, high: 95, low: 88, close: 89 },
    ],
    highlightLast: 4,
  },
  {
    id: "rising-wedge",
    name: "Rising Wedge",
    category: "reversal",
    signal: "bearish",
    description: "A bearish pattern where both support and resistance lines slope upward and converge. Often signals a reversal after an uptrend.",
    howToSpot: [
      "Both trendlines slope upward",
      "Lines converge (price range narrows)",
      "Higher highs and higher lows, but momentum slowing",
      "Typically breaks downward"
    ],
    tradingTip: "Wait for breakdown below support. Volume often decreases within the wedge and increases on breakdown.",
    candles: [
      { open: 90, high: 94, low: 89, close: 93 },
      { open: 93, high: 96, low: 92, close: 95 },
      { open: 95, high: 98, low: 94, close: 97 },
      { open: 97, high: 99, low: 96, close: 98 },
      { open: 98, high: 100, low: 97, close: 99 },
      { open: 99, high: 100, low: 93, close: 94 },
    ],
    highlightLast: 5,
  },
  {
    id: "falling-wedge",
    name: "Falling Wedge",
    category: "reversal",
    signal: "bullish",
    description: "A bullish pattern where both support and resistance lines slope downward and converge. Often signals a reversal after a downtrend.",
    howToSpot: [
      "Both trendlines slope downward",
      "Lines converge (price range narrows)",
      "Lower highs and lower lows, but selling pressure fading",
      "Typically breaks upward"
    ],
    tradingTip: "Enter long on breakout above resistance. Volume often increases significantly on the breakout.",
    candles: [
      { open: 100, high: 101, low: 96, close: 97 },
      { open: 97, high: 98, low: 94, close: 95 },
      { open: 95, high: 96, low: 92, close: 93 },
      { open: 93, high: 94, low: 91, close: 92 },
      { open: 92, high: 93, low: 90, close: 91 },
      { open: 91, high: 97, low: 90, close: 96 },
    ],
    highlightLast: 5,
  },
  {
    id: "cup-handle",
    name: "Cup and Handle",
    category: "continuation",
    signal: "bullish",
    description: "A bullish continuation pattern resembling a tea cup. The cup is U-shaped, followed by a small consolidation (handle) before breakout.",
    howToSpot: [
      "U-shaped cup (not V-shaped)",
      "Cup depth typically 12-33% of prior move",
      "Handle drifts slightly downward",
      "Breakout above the handle's resistance"
    ],
    tradingTip: "Buy on breakout above the handle with strong volume. Stop-loss at the bottom of the handle.",
    candles: [
      { open: 98, high: 99, low: 94, close: 95 },
      { open: 95, high: 96, low: 90, close: 91 },
      { open: 91, high: 93, low: 90, close: 92 },
      { open: 92, high: 96, low: 91, close: 95 },
      { open: 95, high: 98, low: 94, close: 94 },
      { open: 94, high: 100, low: 93, close: 99 },
    ],
    highlightLast: 6,
  },
];

function PatternChart({ candles, highlightLast, height = 160 }: { candles: Candle[]; highlightLast: number; height?: number }) {
  const allPrices = candles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;
  
  const scaleY = (price: number) => {
    return height - 20 - ((price - minPrice) / priceRange) * (height - 40);
  };

  const candleWidth = Math.min(28, (260 / candles.length) - 4);
  const gap = 4;

  return (
    <svg 
      viewBox={`0 0 ${candles.length * (candleWidth + gap) + 20} ${height}`} 
      className="w-full"
      style={{ maxHeight: height }}
    >
      {/* Grid lines */}
      {[0, 0.5, 1].map((pct, i) => (
        <line
          key={i}
          x1="10"
          y1={20 + pct * (height - 40)}
          x2={candles.length * (candleWidth + gap) + 10}
          y2={20 + pct * (height - 40)}
          stroke="hsl(var(--border))"
          strokeDasharray="4 4"
        />
      ))}
      
      {candles.map((candle, i) => {
        const x = 10 + i * (candleWidth + gap);
        const isGreen = candle.close >= candle.open;
        const bodyTop = scaleY(Math.max(candle.open, candle.close));
        const bodyBottom = scaleY(Math.min(candle.open, candle.close));
        const bodyHeight = Math.max(2, bodyBottom - bodyTop);
        const isHighlighted = highlightLast > 0 && i >= candles.length - highlightLast;
        
        return (
          <g key={i}>
            {isHighlighted && (
              <rect
                x={x - 2}
                y={10}
                width={candleWidth + 4}
                height={height - 20}
                fill="hsl(var(--primary))"
                fillOpacity={0.1}
                rx={4}
              />
            )}
            <line
              x1={x + candleWidth / 2}
              y1={scaleY(candle.high)}
              x2={x + candleWidth / 2}
              y2={scaleY(candle.low)}
              stroke={isGreen ? "hsl(var(--success))" : "hsl(var(--destructive))"}
              strokeWidth={2}
            />
            <rect
              x={x}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              fill={isGreen ? "hsl(var(--success))" : "hsl(var(--destructive))"}
              rx={2}
            />
          </g>
        );
      })}
    </svg>
  );
}

interface ChartPatternLibraryProps {
  onClose: () => void;
}

export function ChartPatternLibrary({ onClose }: ChartPatternLibraryProps) {
  const [selectedPattern, setSelectedPattern] = useState<ChartPattern | null>(null);
  const [filter, setFilter] = useState<"all" | "reversal" | "continuation">("all");

  const filteredPatterns = ADVANCED_PATTERNS.filter(p => 
    filter === "all" || p.category === filter
  );

  if (selectedPattern) {
    return (
      <div className="fixed inset-0 bg-background z-50 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedPattern(null)}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-bold text-foreground">{selectedPattern.name}</h2>
            <div className="w-10" />
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-6 pb-6">
              {/* Pattern Chart */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <PatternChart 
                  candles={selectedPattern.candles} 
                  highlightLast={selectedPattern.highlightLast}
                  height={180}
                />
              </div>

              {/* Signal Badge */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold",
                  selectedPattern.signal === "bullish" && "bg-success/20 text-success",
                  selectedPattern.signal === "bearish" && "bg-destructive/20 text-destructive",
                  selectedPattern.signal === "neutral" && "bg-muted text-muted-foreground"
                )}>
                  {selectedPattern.signal === "bullish" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {selectedPattern.signal.charAt(0).toUpperCase() + selectedPattern.signal.slice(1)} Signal
                </div>
                <span className="text-sm text-muted-foreground capitalize">
                  {selectedPattern.category} Pattern
                </span>
              </div>

              {/* Description */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <h3 className="font-semibold text-foreground mb-2">What is it?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {selectedPattern.description}
                </p>
              </div>

              {/* How to Spot */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <h3 className="font-semibold text-foreground mb-3">How to Spot It</h3>
                <ul className="space-y-2">
                  {selectedPattern.howToSpot.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trading Tip */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-4">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Trading Tip
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {selectedPattern.tradingTip}
                </p>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 animate-fade-in">
      <div className="max-w-lg mx-auto px-4 py-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-bold text-foreground">Chart Patterns</h2>
          <div className="w-10" />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "all" as const, label: "All" },
            { id: "reversal" as const, label: "Reversal" },
            { id: "continuation" as const, label: "Continuation" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "px-4 py-2 rounded-xl font-semibold text-sm transition-all",
                filter === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pattern List */}
        <ScrollArea className="flex-1">
          <div className="space-y-3 pb-6">
            {filteredPatterns.map((pattern, index) => (
              <div
                key={pattern.id}
                className="bg-card rounded-2xl border border-border p-4 animate-fade-in cursor-pointer hover:border-primary/50 transition-all active:scale-[0.98]"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedPattern(pattern)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-16 bg-muted/50 rounded-xl overflow-hidden flex-shrink-0">
                    <PatternChart 
                      candles={pattern.candles} 
                      highlightLast={0}
                      height={64}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground">{pattern.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded",
                        pattern.signal === "bullish" && "bg-success/20 text-success",
                        pattern.signal === "bearish" && "bg-destructive/20 text-destructive"
                      )}>
                        {pattern.signal === "bullish" ? "↑ Bullish" : "↓ Bearish"}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {pattern.category}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
