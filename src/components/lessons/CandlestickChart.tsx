import { cn } from "@/lib/utils";

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  candles: Candle[];
  height?: number;
  highlightLast?: number;
  patternName?: string;
}

export default function CandlestickChart({ 
  candles, 
  height = 200,
  highlightLast = 0,
  patternName
}: CandlestickChartProps) {
  const allPrices = candles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;
  
  const scaleY = (price: number) => {
    return height - 20 - ((price - minPrice) / priceRange) * (height - 40);
  };

  const candleWidth = Math.min(30, (280 / candles.length) - 4);
  const gap = 4;

  return (
    <div className="relative bg-card rounded-xl p-4 border border-border">
      {patternName && (
        <div className="absolute top-2 left-2 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
          {patternName}
        </div>
      )}
      <svg 
        viewBox={`0 0 ${candles.length * (candleWidth + gap) + 20} ${height}`} 
        className="w-full"
        style={{ maxHeight: height }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
          <line
            key={i}
            x1="10"
            y1={20 + pct * (height - 40)}
            x2={candles.length * (candleWidth + gap) + 10}
            y2={20 + pct * (height - 40)}
            stroke="currentColor"
            strokeOpacity={0.1}
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
              {/* Highlight background */}
              {isHighlighted && (
                <rect
                  x={x - 2}
                  y={10}
                  width={candleWidth + 4}
                  height={height - 20}
                  fill="currentColor"
                  fillOpacity={0.05}
                  rx={4}
                />
              )}
              
              {/* Wick */}
              <line
                x1={x + candleWidth / 2}
                y1={scaleY(candle.high)}
                x2={x + candleWidth / 2}
                y2={scaleY(candle.low)}
                stroke={isGreen ? "#22c55e" : "#ef4444"}
                strokeWidth={2}
              />
              
              {/* Body */}
              <rect
                x={x}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={isGreen ? "#22c55e" : "#ef4444"}
                rx={2}
                className={cn(
                  isHighlighted && "animate-pulse"
                )}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Predefined patterns for lessons
export const CHART_PATTERNS = {
  bullishEngulfing: {
    name: "Bullish Engulfing",
    candles: [
      { open: 100, high: 102, low: 95, close: 96 },
      { open: 96, high: 98, low: 94, close: 95 },
      { open: 95, high: 96, low: 93, close: 94 },
      { open: 94, high: 95, low: 92, close: 93 },
      { open: 92, high: 100, low: 91, close: 99 },
    ],
    highlightLast: 2,
    isBullish: true,
  },
  bearishEngulfing: {
    name: "Bearish Engulfing",
    candles: [
      { open: 90, high: 95, low: 89, close: 94 },
      { open: 94, high: 98, low: 93, close: 97 },
      { open: 97, high: 100, low: 96, close: 99 },
      { open: 99, high: 101, low: 98, close: 100 },
      { open: 101, high: 102, low: 93, close: 94 },
    ],
    highlightLast: 2,
    isBullish: false,
  },
  hammer: {
    name: "Hammer",
    candles: [
      { open: 100, high: 101, low: 97, close: 98 },
      { open: 98, high: 99, low: 94, close: 95 },
      { open: 95, high: 96, low: 90, close: 91 },
      { open: 91, high: 92, low: 85, close: 86 },
      { open: 85, high: 89, low: 80, close: 88 },
    ],
    highlightLast: 1,
    isBullish: true,
  },
  shootingStar: {
    name: "Shooting Star",
    candles: [
      { open: 85, high: 88, low: 84, close: 87 },
      { open: 87, high: 91, low: 86, close: 90 },
      { open: 90, high: 94, low: 89, close: 93 },
      { open: 93, high: 97, low: 92, close: 96 },
      { open: 97, high: 105, low: 96, close: 98 },
    ],
    highlightLast: 1,
    isBullish: false,
  },
  doji: {
    name: "Doji",
    candles: [
      { open: 95, high: 98, low: 94, close: 97 },
      { open: 97, high: 100, low: 96, close: 99 },
      { open: 99, high: 102, low: 98, close: 101 },
      { open: 101, high: 104, low: 100, close: 103 },
      { open: 103, high: 107, low: 99, close: 103.2 },
    ],
    highlightLast: 1,
    isBullish: false, // Signals indecision/potential reversal
  },
  morningstar: {
    name: "Morning Star",
    candles: [
      { open: 100, high: 101, low: 95, close: 96 },
      { open: 96, high: 97, low: 91, close: 92 },
      { open: 92, high: 93, low: 88, close: 89 },
      { open: 88, high: 90, low: 86, close: 87.5 },
      { open: 88, high: 95, low: 87, close: 94 },
    ],
    highlightLast: 3,
    isBullish: true,
  },
  eveningStar: {
    name: "Evening Star",
    candles: [
      { open: 88, high: 92, low: 87, close: 91 },
      { open: 91, high: 96, low: 90, close: 95 },
      { open: 95, high: 100, low: 94, close: 99 },
      { open: 100, high: 102, low: 99, close: 100.5 },
      { open: 100, high: 101, low: 93, close: 94 },
    ],
    highlightLast: 3,
    isBullish: false,
  },
  doubleBottom: {
    name: "Double Bottom",
    candles: [
      { open: 100, high: 101, low: 96, close: 97 },
      { open: 97, high: 98, low: 90, close: 91 },
      { open: 91, high: 95, low: 90, close: 94 },
      { open: 94, high: 95, low: 89, close: 90 },
      { open: 90, high: 97, low: 89, close: 96 },
    ],
    highlightLast: 4,
    isBullish: true,
  },
  headAndShoulders: {
    name: "Head & Shoulders",
    candles: [
      { open: 90, high: 95, low: 89, close: 94 },
      { open: 94, high: 100, low: 93, close: 99 },
      { open: 99, high: 105, low: 98, close: 100 },
      { open: 100, high: 101, low: 94, close: 95 },
      { open: 95, high: 96, low: 88, close: 89 },
    ],
    highlightLast: 5,
    isBullish: false,
  },
  threeWhiteSoldiers: {
    name: "Three White Soldiers",
    candles: [
      { open: 90, high: 91, low: 87, close: 88 },
      { open: 88, high: 89, low: 85, close: 86 },
      { open: 87, high: 92, low: 86, close: 91 },
      { open: 91, high: 96, low: 90, close: 95 },
      { open: 95, high: 100, low: 94, close: 99 },
    ],
    highlightLast: 3,
    isBullish: true,
  },
};

export type PatternKey = keyof typeof CHART_PATTERNS;
