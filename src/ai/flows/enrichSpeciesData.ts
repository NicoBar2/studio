
'use server';
/**
 * @fileOverview A Genkit flow to enrich species data using AI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ConservationStatus } from '@/lib/types';

// Define the schema for the data we want the AI to find.
const EnrichedDataSchema = z.object({
  habitat: z.string().describe("The primary habitat of the species."),
  conservationStatus: z.enum([
    'En Peligro Crítico',
    'En Peligro',
    'Vulnerable',
    'Casi Amenazada',
    'Preocupación Menor',
    'Datos Insuficientes'
  ]).describe("The official IUCN conservation status. Use 'Datos Insuficientes' if unknown."),
  populationTrend: z.enum([
      'increasing', 'decreasing', 'stable', 'unknown'
  ]).describe("The current population trend (increasing, decreasing, stable, or unknown)."),
  threats: z.array(z.string()).describe("A list of the top 3-4 primary threats to the species."),
  keyStats: z.array(z.object({
    label: z.string().describe("The label for a key statistic (e.g., 'Peso Promedio', 'Envergadura')."),
    value: z.union([z.string(), z.number()]).describe("The value of the statistic."),
    unit: z.string().optional().describe("The unit for the statistic (e.g., 'kg', 'm').")
  })).describe("A list of 2-3 key statistics about the species.")
});

export type EnrichedData = z.infer<typeof EnrichedDataSchema>;

const enricherPrompt = ai.definePrompt({
  name: 'enrichSpeciesPrompt',
  input: { schema: z.string() },
  output: { schema: EnrichedDataSchema },
  prompt: `You are a wildlife data specialist for the Galapagos Islands.
  For the species named "{{input}}", find and provide the following information based on real, up-to-date sources.
  Provide the data in the requested structured format.
  - Primary habitat
  - Official IUCN conservation status
  - Current population trend
  - Top 3-4 primary threats
  - 2-3 key statistics (like average weight, lifespan, size, etc.)
  `,
});

const enrichSpeciesDataFlow = ai.defineFlow(
  {
    name: 'enrichSpeciesDataFlow',
    inputSchema: z.string(),
    outputSchema: EnrichedDataSchema,
  },
  async (speciesName) => {
    const { output } = await enricherPrompt(speciesName);
    if (!output) {
      throw new Error('Failed to generate enriched data.');
    }
    return output;
  }
);

// Wrapper function to be called from Server Actions
export async function enrichSpeciesData(speciesName: string): Promise<EnrichedData> {
    return enrichSpeciesDataFlow(speciesName);
}
