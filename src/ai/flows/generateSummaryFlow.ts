
'use server';
/**
 * @fileOverview A Genkit flow to generate a brief, insightful summary for a species.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ConservationStatus } from '@/lib/types';

const GetSummaryInputSchema = z.object({
  spanishCommonName: z.string().describe('The Spanish common name of the species.'),
  scientificName: z.string().describe('The full scientific name (genus and species).'),
  iucnStatus: z.enum([
    'En Peligro Crítico',
    'En Peligro',
    'Vulnerable',
    'Casi Amenazada',
    'Preocupación Menor',
    'Datos Insuficientes'
  ]),
  populationTrend: z.enum(['increasing', 'decreasing', 'stable', 'unknown']),
  habitat: z.string().describe('A brief description of the species\' habitat.'),
  threats: z.array(z.string()).describe('A list of known threats to the species.'),
  spanishDescription: z.string().describe('A general description of the species in Spanish.'),
});

export type GetSummaryInput = z.infer<typeof GetSummaryInputSchema>;

const SummaryOutputSchema = z.string().describe("A concise summary in Spanish (2-4 sentences) about the species, formatted as a single paragraph. Do not use Markdown.");
export type SummaryOutput = z.infer<typeof SummaryOutputSchema>;


const summaryPrompt = ai.definePrompt({
    name: 'generateSpeciesSummaryPrompt',
    input: { schema: GetSummaryInputSchema },
    output: { schema: SummaryOutputSchema },
    prompt: `Eres un biólogo conservacionista experto resumiendo información clave sobre especies de Galápagos.
    Basado en los siguientes datos, genera un resumen conciso y fácil de entender en español.

    Datos de la Especie:
    - **Nombre Común:** {{{spanishCommonName}}}
    - **Nombre Científico:** {{{scientificName}}}
    - **Descripción:** {{{spanishDescription}}}
    - **Estado de Conservación (UICN):** {{{iucnStatus}}}
    - **Tendencia Poblacional:** {{{populationTrend}}}
    - **Hábitat:** {{{habitat}}}
    - **Amenazas:** {{#each threats}}{{{this}}}{{/each}}

    Tu resumen debe:
    1.  Ser un solo párrafo de 2 a 4 oraciones.
    2.  Integrar el estado de conservación y la tendencia poblacional.
    3.  Mencionar un aspecto clave de su descripción o hábitat.
    4.  Ser informativo y accesible para un público general.
    5.  Estar escrito completamente en español.
    6.  No usar ningún formato Markdown (negritas, encabezados, etc.).
    `,
});

const generateSummaryFlow = ai.defineFlow(
    {
        name: 'generateSummaryFlow',
        inputSchema: GetSummaryInputSchema,
        outputSchema: SummaryOutputSchema,
    },
    async (speciesData) => {
        const { output } = await summaryPrompt(speciesData);
        if (!output) {
            throw new Error('Failed to generate species summary.');
        }
        return output;
    }
);

// Wrapper function to be called from Server Actions
export async function getSummary(speciesData: GetSummaryInput): Promise<SummaryOutput> {
    return generateSummaryFlow(speciesData);
}
