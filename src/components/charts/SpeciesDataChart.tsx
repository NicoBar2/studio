
"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import type { HistoricalDataPoint } from '@/lib/species';
import { useTheme } from 'next-themes'; // Assuming next-themes is or could be used for dark mode

type SpeciesDataChartProps = {
  data: HistoricalDataPoint[];
  dataKey: string; // e.g., "value"
  nameKey: string; // e.g., "year"
  unit: string;
  chartType?: 'bar' | 'line';
};

export default function SpeciesDataChart({ data, dataKey, nameKey, unit, chartType = 'line' }: SpeciesDataChartProps) {
  const { resolvedTheme } = useTheme(); // For potential theme-specific styling
  const isDarkMode = resolvedTheme === 'dark';

  const chartConfig = {
    [dataKey]: {
      label: unit,
      color: isDarkMode ? "hsl(var(--chart-1))" : "hsl(var(--primary))",
    },
  };
  
  const formattedData = data.map(item => ({
    ...item,
    [nameKey]: String(item[nameKey]) // Ensure nameKey is string for XAxis
  }));


  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      {chartType === 'line' ? (
        <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey={nameKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value}
            stroke="hsl(var(--foreground))"
          />
          <YAxis
            tickFormatter={(value) => `${value} ${unit}`}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            stroke="hsl(var(--foreground))"
          />
          <Tooltip
            cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 1.5 }}
            content={<ChartTooltipContent 
                formatter={(value, name, item) => (
                    <>
                        <div className="font-medium">{item.payload[nameKey]}</div>
                        <div className="text-muted-foreground">
                           {unit}: {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                    </>
                )} 
            />}
          />
          <Legend content={<ChartLegendContent />} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={`hsl(var(--primary))`}
            strokeWidth={2.5}
            dot={{
              fill: `hsl(var(--primary))`,
              r: 4,
            }}
            activeDot={{
              r: 6,
              style: { stroke: `hsl(var(--accent))`, opacity: 0.5 },
            }}
          />
        </LineChart>
      ) : (
        <BarChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey={nameKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value}
            stroke="hsl(var(--foreground))"
          />
          <YAxis
            tickFormatter={(value) => `${value} ${unit}`}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            stroke="hsl(var(--foreground))"
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--accent))', opacity: 0.3 }}
            content={<ChartTooltipContent 
                formatter={(value, name, item) => (
                    <>
                        <div className="font-medium">{item.payload[nameKey]}</div>
                        <div className="text-muted-foreground">
                            {unit}: {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                    </>
                )} 
            />}
          />
          <Legend content={<ChartLegendContent />} />
          <Bar dataKey={dataKey} fill={`hsl(var(--primary))`} radius={[4, 4, 0, 0]} />
        </BarChart>
      )}
    </ChartContainer>
  );
}
