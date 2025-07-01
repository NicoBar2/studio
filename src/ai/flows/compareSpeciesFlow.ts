
'use server';
/**
 * @fileOverview A Genkit flow to generate a comparative analysis of species data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { HistoricalDataPoint, ConservationStatus } from '@/lib/types';

const SpeciesComparisonDataSchema = z.object({
  spanishCommonName: z.string(),
  iucnStatus: z.enum([
    'En Peligro Crítico',
    'En Peligro',
    'Vulnerable',
    'Casi Amenazada',
    'Preocupación Menor',
    'Datos Insuficientes'
  ]),
  populationTrend: z.enum(['increasing', 'decreasing', 'stable', 'unknown']),
  historicalData: z.array(z.object({
    year: z.number(),
    value: z.number(),
    unit: z.string(),
    description: z.string().optional(),
  })),
});

const CompareSpeciesInputSchema = z.array(SpeciesComparisonDataSchema);
export type CompareSpeciesInput = z.infer<typeof CompareSpeciesInputSchema>;

const CompareSpeciesOutputSchema = z.string().describe("A detailed comparative analysis in Spanish, formatted in Markdown. Use paragraphs and **bold** text for emphasis. Do not use Markdown headers (e.g., #, ##).");
export type CompareSpeciesOutput = z.infer<typeof CompareSpeciesOutputSchema>;


const comparisonPrompt = ai.definePrompt({
    name: 'compareSpeciesPrompt',
    input: { schema: CompareSpeciesInputSchema },
    output: { schema: CompareSpeciesOutputSchema },
    prompt: `You are an expert conservation biologist analyzing data from the Galapagos Islands.
    Based on the following data for multiple species, provide a comparative analysis.

    Data:
    {{#each this}}
    - **Especie:** {{{this.spanishCommonName}}}
      - **Estado de Conservación (UICN):** {{{this.iucnStatus}}}
      - **Tendencia Poblacional:** {{{this.populationTrend}}}
      {{#if this.historicalData}}
      - **Datos Históricos ({{this.historicalData.0.unit}}):**
        {{#each this.historicalData}}
        - Año: {{year}}, Valor: {{value}}{{#if description}} (Nota: {{description}}){{/if}}
        {{/each}}
      {{/if}}
    {{/each}}

    Your analysis should:
    1.  Compare the population trends. Which species are recovering, which are declining, and which are stable?
    2.  Contrast their conservation statuses. Are there species in more critical danger than others?
    3.  Analyze the historical data. Look for significant changes, periods of sharp decline or growth, and compare the magnitudes. If notes are provided for certain years, incorporate that context into your analysis.
    4.  Synthesize the information to provide a concluding insight about the overall health of this group of species.

    Provide the final analysis as a well-written text in Spanish, formatted using Markdown.
    - Use paragraphs for structure.
    - Use **bold** markdown for emphasis on key terms and species names.
    - Do NOT use any Markdown headers (like #, ##, ###).
    `,
});

const compareSpeciesFlow = ai.defineFlow(
    {
        name: 'compareSpeciesFlow',
        inputSchema: CompareSpeciesInputSchema,
        outputSchema: CompareSpeciesOutputSchema,
    },
    async (speciesData) => {
        const { output } = await comparisonPrompt(speciesData);
        if (!output) {
            throw new Error('Failed to generate comparison analysis.');
        }
        return output;
    }
);

// Wrapper function to be called from Server Actions
export async function getComparisonAnalysis(speciesData: CompareSpeciesInput): Promise<CompareSpeciesOutput> {
    return compareSpeciesFlow(speciesData);
}
