
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
    <ChartContainer config={chartConfig} className="w-full h-full">
      {chartType === 'line' ? (
        <LineChart data={formattedData} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={nameKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value}
          />
          <YAxis
            tickFormatter={(value) => `${value} ${unit}`}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={`var(--color-${dataKey})`}
            strokeWidth={2}
            dot={{
              r: 4,
              fill: `var(--color-${dataKey})`,
              stroke: "transparent"
            }}
            activeDot={{
              r: 6,
              fill: `var(--color-${dataKey})`,
              stroke: "hsl(var(--background))"
            }}
          />
        </LineChart>
      ) : (
        <BarChart data={formattedData} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={nameKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value}
          />
          <YAxis
            tickFormatter={(value) => `${value} ${unit}`}
          />
          <Tooltip
            cursor={false}
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
          <Bar dataKey={dataKey} fill={`var(--color-${dataKey})`} radius={4} />
        </BarChart>
      )}
    </ChartContainer>
  );
}
