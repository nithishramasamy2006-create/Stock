export interface StockData {
  timestamp: number[];
  indicators: {
    quote: Array<{
      close: number[];
      high: number[];
      low: number[];
      open: number[];
      volume: number[];
    }>;
  };
}

export interface ChartDataPoint {
  date: string;
  price: number;
  volume: number;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  name: string;
}

export interface PredictionResult {
  symbol: string;
  currentPrice: number;
  prediction: string;
  confidence: number;
  targetPrice: number;
  timeframe: string;
  rationale: string[];
  riskFactors: string[];
}
