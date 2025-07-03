"use client";

import { useMemo } from 'react';
import { Line, LineChart, CartesianGrid, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import type { Species } from '@/lib/types';
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

type SpeciesComparisonChartProps = {
  species: Species[];
  yearFilter?: { min: string; max: string };
};

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function SpeciesComparisonChart({ species, yearFilter }: SpeciesComparisonChartProps) {
  const { chartData, chartConfig, unit } = useMemo(() => {
    if (species.length === 0) return { chartData: [], chartConfig: {}, unit: '' };
    
    const minYear = yearFilter?.min ? parseInt(yearFilter.min, 10) : -Infinity;
    const maxYear = yearFilter?.max ? parseInt(yearFilter.max, 10) : Infinity;

    const firstSpecies = species[0];
    const unit = firstSpecies.historicalData?.[0]?.unit || 'valor';

    const allYears = new Set<number>();
    species.forEach(s => {
      if (s.historicalData) {
        s.historicalData.forEach(p => {
          const year = p.year;
          if (year >= minYear && year <= maxYear) {
            allYears.add(year);
          }
        });
      }
    });

    const sortedYears = Array.from(allYears).sort((a, b) => a - b);

    const data = sortedYears.map(year => {
      const dataPoint: { [key: string]: number | string | null } = { year: String(year) };
      species.forEach(s => {
        const point = s.historicalData?.find(p => p.year === year);
        dataPoint[s.id] = point ? point.value : null;
      });
      return dataPoint;
    });
    
    const config: any = {};
    species.forEach((s, index) => {
        config[s.id] = {
            label: s.spanishCommonName,
            color: CHART_COLORS[index % CHART_COLORS.length],
        };
    });

    return { chartData: data, chartConfig: config, unit };
  }, [species, yearFilter]);

  if (species.length === 0) {
    return null;
  }

  return (
    <ChartContainer config={chartConfig} className="w-full min-h-[400px]">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 20,
          right: 20,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          width={80}
          tickFormatter={(value) => value.toLocaleString()}
          tickLine={false}
          axisLine={false}
          domain={['dataMin', 'dataMax']}
        />
        <Tooltip
          cursor
          content={<ChartTooltipContent indicator="line" labelFormatter={(label) => `Año: ${label}`} />}
        />
        <Legend content={<ChartLegendContent />} />
        {Object.keys(chartConfig).map((speciesId) => (
          <Line
            key={speciesId}
            type="monotone"
            dataKey={speciesId}
            stroke={`var(--color-${speciesId})`}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
