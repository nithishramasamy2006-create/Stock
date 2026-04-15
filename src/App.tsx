import React, { useState, useEffect } from 'react';
import { StockChart } from './components/StockChart';
import { StockSearch } from './components/StockSearch';
import { AIPrediction } from './components/AIPrediction';
import { getStockPrediction } from './services/geminiService';
import { StockQuote, ChartDataPoint, PredictionResult } from './types';
import { TrendingUp, TrendingDown, Activity, RefreshCw, Info, ExternalLink } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [symbol, setSymbol] = useState('AAPL');
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (targetSymbol: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/stock/${targetSymbol}?range=1mo&interval=1d`);
      const data = await response.json();

      if (data.error || !data.chart?.result) {
        throw new Error(data.error || "Symbol not found");
      }

      const result = data.chart.result[0];
      const meta = result.meta;
      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];

      const formattedChartData: ChartDataPoint[] = timestamps.map((ts: number, i: number) => ({
        date: new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: quotes.close[i],
        volume: quotes.volume[i]
      })).filter((d: any) => d.price !== null);

      setChartData(formattedChartData);
      setSymbol(targetSymbol);
      
      const currentPrice = meta.regularMarketPrice;
      const prevClose = meta.previousClose;
      const change = currentPrice - prevClose;
      const changePercent = (change / prevClose) * 100;

      setQuote({
        symbol: targetSymbol,
        price: currentPrice,
        change,
        changePercent,
        high: meta.dayHigh,
        low: meta.dayLow,
        volume: meta.regularMarketVolume,
        name: targetSymbol // Yahoo API sometimes doesn't give full name easily in this endpoint
      });

      // Trigger AI Prediction
      fetchPrediction(targetSymbol, currentPrice);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrediction = async (targetSymbol: string, currentPrice: number) => {
    setIsAiLoading(true);
    try {
      const result = await getStockPrediction(targetSymbol, currentPrice);
      setPrediction(result);
    } catch (err) {
      console.error("AI Prediction failed", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    fetchData('AAPL');
  }, []);

  const isPositive = quote && quote.change >= 0;

  return (
    <div className="min-h-screen bg-brand-bg grid-bg selection:bg-brand-accent/30">
      {/* Header */}
      <header className="border-b border-brand-border bg-brand-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">StockPulse <span className="text-brand-accent">AI</span></h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Markets</a>
            <a href="#" className="hover:text-white transition-colors">Portfolio</a>
            <a href="#" className="hover:text-white transition-colors">AI Insights</a>
            <div className="h-4 w-px bg-brand-border" />
            <button className="text-brand-accent hover:text-blue-400 transition-colors flex items-center gap-1">
              Connect Wallet <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Search Section */}
        <section className="max-w-2xl mx-auto">
          <StockSearch onSearch={fetchData} isLoading={isLoading} />
          {error && (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-brand-danger text-sm mt-2 text-center font-medium"
            >
              {error}
            </motion.p>
          )}
        </section>

        <AnimatePresence mode="wait">
          {quote && (
            <motion.div 
              key={quote.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Quote Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass rounded-2xl p-6 space-y-6">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-3xl font-bold text-white">{quote.symbol}</h2>
                        <span className="px-2 py-0.5 bg-brand-border rounded text-[10px] font-bold text-gray-400 uppercase tracking-widest">NASDAQ</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-4xl font-mono font-bold text-white">${quote.price?.toFixed(2) ?? '0.00'}</span>
                        <div className={cn(
                          "flex items-center gap-1 font-medium",
                          isPositive ? "text-brand-success" : "text-brand-danger"
                        )}>
                          {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          <span className="text-lg">{isPositive ? '+' : ''}{quote.change?.toFixed(2) ?? '0.00'} ({quote.changePercent?.toFixed(2) ?? '0.00'}%)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Day High</p>
                        <p className="text-sm font-mono font-medium text-white">${quote.high?.toFixed(2) ?? '0.00'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Day Low</p>
                        <p className="text-sm font-mono font-medium text-white">${quote.low?.toFixed(2) ?? '0.00'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Volume</p>
                        <p className="text-sm font-mono font-medium text-white">{((quote.volume || 0) / 1000000).toFixed(2)}M</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-[400px]">
                    <StockChart data={chartData} color={isPositive ? '#10B981' : '#EF4444'} />
                  </div>
                </div>

                <div className="space-y-6">
                  <AIPrediction prediction={prediction} isLoading={isAiLoading} />
                  
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Info className="w-4 h-4 text-brand-accent" />
                      Market Sentiment
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Fear & Greed Index</span>
                        <span className="text-brand-success font-bold">64 (Greed)</span>
                      </div>
                      <div className="w-full bg-brand-border h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-brand-danger via-yellow-500 to-brand-success h-full w-[64%]" />
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Market sentiment is currently leaning towards greed, suggesting potential overvaluation in the short term.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border py-12 mt-12 bg-brand-card/30">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-accent" />
              <span className="text-lg font-bold text-white">StockPulse AI</span>
            </div>
            <p className="text-sm text-gray-500">
              Empowering investors with AI-driven market intelligence and real-time technical analysis.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-brand-accent">Market Data</a></li>
              <li><a href="#" className="hover:text-brand-accent">AI Predictions</a></li>
              <li><a href="#" className="hover:text-brand-accent">Technical Tools</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-brand-accent">API Documentation</a></li>
              <li><a href="#" className="hover:text-brand-accent">Market Guides</a></li>
              <li><a href="#" className="hover:text-brand-accent">Help Center</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold mb-4">Stay Updated</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="Email address" className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-brand-accent" />
              <button className="bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-medium">Join</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">© 2026 StockPulse AI. All rights reserved. Financial data provided by Yahoo Finance.</p>
          <div className="flex gap-6 text-xs text-gray-600">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Cookie Settings</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
