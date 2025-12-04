import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const alphaVantageApiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, symbol, interval, outputsize } = await req.json();

    if (!alphaVantageApiKey) {
      throw new Error('ALPHA_VANTAGE_API_KEY is not configured');
    }

    let url = `https://www.alphavantage.co/query?apikey=${alphaVantageApiKey}`;

    switch (action) {
      case 'quote':
        url += `&function=GLOBAL_QUOTE&symbol=${symbol}`;
        break;
      case 'intraday':
        url += `&function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval || '5min'}&outputsize=${outputsize || 'compact'}`;
        break;
      case 'daily':
        url += `&function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=${outputsize || 'compact'}`;
        break;
      case 'weekly':
        url += `&function=TIME_SERIES_WEEKLY&symbol=${symbol}`;
        break;
      case 'monthly':
        url += `&function=TIME_SERIES_MONTHLY&symbol=${symbol}`;
        break;
      case 'rsi':
        url += `&function=RSI&symbol=${symbol}&interval=${interval || 'daily'}&time_period=14&series_type=close`;
        break;
      case 'macd':
        url += `&function=MACD&symbol=${symbol}&interval=${interval || 'daily'}&series_type=close`;
        break;
      case 'sma':
        url += `&function=SMA&symbol=${symbol}&interval=${interval || 'daily'}&time_period=20&series_type=close`;
        break;
      case 'ema':
        url += `&function=EMA&symbol=${symbol}&interval=${interval || 'daily'}&time_period=20&series_type=close`;
        break;
      case 'search':
        url += `&function=SYMBOL_SEARCH&keywords=${symbol}`;
        break;
      case 'forex':
        const [from, to] = symbol.split('/');
        url += `&function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}`;
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log('Fetching from Alpha Vantage:', action, symbol);

    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    if (data['Note']) {
      console.warn('Alpha Vantage rate limit warning:', data['Note']);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in alpha-vantage function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
