import React from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Target, Clock, CheckCircle2, Activity } from 'lucide-react';
import { PredictionResult } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface AIPredictionProps {
  prediction: PredictionResult | null;
  isLoading: boolean;
}

export const AIPrediction: React.FC<AIPredictionProps> = ({ prediction, isLoading }) => {
  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="w-12 h-12 text-brand-accent" />
        </motion.div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white">Gemini AI is Analyzing...</h3>
          <p className="text-gray-400 text-sm mt-2">Scanning market sentiment, news, and technical data</p>
        </div>
        <div className="w-full max-w-xs bg-brand-border h-1.5 rounded-full overflow-hidden">
          <motion.div 
            className="bg-brand-accent h-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
        <div className="p-4 bg-brand-accent/10 rounded-full">
          <Brain className="w-10 h-10 text-brand-accent" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">AI Market Insights</h3>
          <p className="text-gray-400 max-w-sm mt-2">Search for a stock symbol to get a comprehensive AI-powered prediction and market analysis.</p>
        </div>
      </div>
    );
  }

  const isBullish = prediction.prediction.toLowerCase() === 'bullish';
  const isBearish = prediction.prediction.toLowerCase() === 'bearish';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <div className="p-6 border-b border-brand-border flex items-center justify-between bg-gradient-to-r from-brand-accent/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-accent/20 rounded-lg">
            <Brain className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Gemini AI Analysis</h3>
            <p className="text-xs text-gray-400">Powered by real-time search & technical indicators</p>
          </div>
        </div>
        <div className={cn(
          "px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2",
          isBullish ? "bg-brand-success/20 text-brand-success" : 
          isBearish ? "bg-brand-danger/20 text-brand-danger" : 
          "bg-gray-500/20 text-gray-400"
        )}>
          {isBullish ? <TrendingUp className="w-4 h-4" /> : isBearish ? <TrendingDown className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
          {prediction.prediction.toUpperCase()}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Target className="w-4 h-4" />
            <span>Target Price</span>
          </div>
          <div className="text-3xl font-mono font-bold text-white">
            ${prediction.targetPrice?.toFixed(2) ?? 'N/A'}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-brand-border h-2 rounded-full overflow-hidden">
              <div 
                className="bg-brand-accent h-full" 
                style={{ width: `${prediction.confidence}%` }} 
              />
            </div>
            <span className="text-xs font-mono text-brand-accent">{prediction.confidence}% Conf.</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>Timeframe</span>
          </div>
          <div className="text-xl font-medium text-white">
            {prediction.timeframe}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Prediction based on current market volatility and historical trends.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Risk Factors</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {prediction.riskFactors.map((risk, i) => (
              <span key={i} className="px-2 py-1 bg-brand-danger/10 text-brand-danger text-[10px] uppercase font-bold rounded border border-brand-danger/20">
                {risk}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 bg-brand-bg/50 border-t border-brand-border">
        <h4 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-accent" />
          Key Rationale
        </h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {prediction.rationale.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-400 leading-relaxed">
              <span className="text-brand-accent font-mono">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};
