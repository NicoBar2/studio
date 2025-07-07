'use server';
/**
 * @fileOverview A Genkit flow to create a new species entry using AI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ConservationStatus } from '@/lib/types';

// This schema should contain everything needed to create a new species entry.
const NewSpeciesDataSchema = z.object({
  spanishCommonName: z.string().describe("The common name of the species in Spanish."),
  englishCommonName: z.string().describe("The common name of the species in English."),
  genus: z.string().describe("The genus of the species."),
  specificEpithet: z.string().describe("The specific epithet of the species."),
  spanishDescription: z.string().describe("A concise description of the species in Spanish."),
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

export type NewSpeciesData = z.infer<typeof NewSpeciesDataSchema>;

const creatorPrompt = ai.definePrompt({
  name: 'createSpeciesPrompt',
  input: { schema: z.string() },
  output: { schema: NewSpeciesDataSchema },
  prompt: `You are a wildlife data specialist for the Galapagos Islands.
  For the species named "{{input}}", find and provide the following information based on real, up-to-date sources.
  Provide the data in the requested structured format. The species name you provide should be the corrected or most common Spanish name.
  - Common name in Spanish (spanishCommonName)
  - Common name in English (englishCommonName)
  - Genus
  - Specific Epithet
  - A concise description in Spanish (spanishDescription)
  - Primary habitat
  - Official IUCN conservation status
  - Current population trend
  - Top 3-4 primary threats
  - 2-3 key statistics (like average weight, lifespan, size, etc.)
  `,
});

const createSpeciesWithAIFlow = ai.defineFlow(
  {
    name: 'createSpeciesWithAIFlow',
    inputSchema: z.string(),
    outputSchema: NewSpeciesDataSchema,
  },
  async (speciesName) => {
    const { output } = await creatorPrompt(speciesName);
    if (!output) {
      throw new Error('Failed to generate species data with AI.');
    }
    return output;
  }
);

// Wrapper function to be called from Server Actions
export async function createSpeciesDataWithAI(speciesName: string): Promise<NewSpeciesData> {
    return createSpeciesWithAIFlow(speciesName);
}
