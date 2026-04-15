import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { ChartDataPoint } from '../types';

interface StockChartProps {
  data: ChartDataPoint[];
  color?: string;
}

export const StockChart: React.FC<StockChartProps> = ({ data, color = "#3B82F6" }) => {
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-gray-500">No data available</div>;

  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#71717A" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              stroke="#71717A" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              domain={[minPrice - padding, maxPrice + padding]}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: '8px' }}
              itemStyle={{ color: '#F4F4F5' }}
              labelStyle={{ color: '#A1A1AA' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: '8px' }}
              itemStyle={{ color: '#F4F4F5' }}
              labelStyle={{ color: '#A1A1AA' }}
              formatter={(value: number) => [value.toLocaleString(), 'Volume']}
            />
            <Bar dataKey="volume">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index > 0 && data[index].price >= data[index-1].price ? '#10B981' : '#EF4444'} opacity={0.5} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
