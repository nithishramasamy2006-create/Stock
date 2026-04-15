import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

interface StockSearchProps {
  onSearch: (symbol: string) => void;
  isLoading: boolean;
}

const POPULAR_SYMBOLS = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'BTC-USD'];

export const StockSearch: React.FC<StockSearchProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.toUpperCase().trim());
    }
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-500 group-focus-within:text-brand-accent transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search symbol (e.g. AAPL, TSLA, BTC-USD)..."
          className="w-full bg-brand-card border border-brand-border rounded-xl py-4 pl-12 pr-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute inset-y-2 right-2 px-6 bg-brand-accent hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Analyze'}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {POPULAR_SYMBOLS.map((symbol) => (
          <button
            key={symbol}
            onClick={() => onSearch(symbol)}
            className="px-3 py-1.5 bg-brand-card/50 border border-brand-border rounded-full text-xs font-medium text-gray-400 hover:text-white hover:border-gray-500 transition-all"
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
};
