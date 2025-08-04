
'use server';
/**
 * @fileOverview A Genkit flow to process a CSV file using AI and extract structured species data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ConservationStatus } from '@/lib/types';

// Define the input schema: the raw text content of a CSV file.
const CsvInputSchema = z.string().describe('The full text content of a CSV file to be analyzed.');

// Define the output schema for a single species record.
const SpeciesRecordSchema = z.object({
  iucnStatus: z.string().optional().describe('The IUCN conservation status. Should match one of the valid statuses if possible.'),
  englishCommonName: z.string().optional().describe('The English common name of the species.'),
  spanishCommonName: z.string().describe('The Spanish common name of the species. This field is required.'),
  family: z.string().optional().describe('The family of the species.'),
  genus: z.string().optional().describe('The genus of the species.'),
  specificEpithet: z.string().optional().describe('The specific epithet of the species.'),
  is_darwin: z.boolean().optional().describe('Presence on Darwin island.'),
  is_espanola: z.boolean().optional().describe('Presence on Española island.'),
  is_fernandina: z.boolean().optional().describe('Presence on Fernandina island.'),
  is_floreana: z.boolean().optional().describe('Presence on Floreana island.'),
  is_genovesa: z.boolean().optional().describe('Presence on Genovesa island.'),
  is_isabela: z.boolean().optional().describe('Presence on Isabela island.'),
  is_marchena: z.boolean().optional().describe('Presence on Marchena island.'),
  is_pinta: z.boolean().optional().describe('Presence on Pinta island.'),
  is_pinzon: z.boolean().optional().describe('Presence on Pinzón island.'),
  is_san_cristobal: z.boolean().optional().describe('Presence on San Cristóbal island.'),
  is_santa_cruz: z.boolean().optional().describe('Presence on Santa Cruz island.'),
  is_santa_fe: z.boolean().optional().describe('Presence on Santa Fé island.'),
  is_santiago: z.boolean().optional().describe('Presence on Santiago island.'),
  is_wolf: z.boolean().optional().describe('Presence on Wolf island.'),
});

// The final output is an array of these records.
const CsvOutputSchema = z.array(SpeciesRecordSchema);

export type ProcessCsvOutput = z.infer<typeof CsvOutputSchema>;

// Define the prompt for the AI model.
const processCsvPrompt = ai.definePrompt({
  name: 'processCsvWithAIPrompt',
  input: { schema: CsvInputSchema },
  output: { schema: CsvOutputSchema },
  prompt: `You are an expert data analyst specializing in biological data from the Galapagos.
Your task is to analyze the provided CSV text and extract specific information for each species record (each row).
For each row, create a JSON object containing ONLY the following fields:

- iucnStatus
- englishCommonName
- spanishCommonName (this is the most critical field, ensure it's present)
- family
- genus
- specificEpithet
- is_darwin (boolean, true if present, based on a column like 'Darwin')
- is_espanola (boolean, true if present, based on a column like 'Española')
- is_fernandina (boolean, true if present, based on a column like 'Fernandina')
- is_floreana (boolean, true if present, based on a column like 'Floreana')
- is_genovesa (boolean, true if present, based on a column like 'Genovesa')
- is_isabela (boolean, true if present, based on a column like 'Isabela')
- is_marchena (boolean, true if present, based on a column like 'Marchena')
- is_pinta (boolean, true if present, based on a column like 'Pinta')
- is_pinzon (boolean, true if present, based on a column like 'Pinzón')
- is_san_cristobal (boolean, true if present, based on a column like 'San Cristóbal')
- is_santa_cruz (boolean, true if present, based on a column like 'Santa Cruz')
- is_santa_fe (boolean, true if present, based on a column like 'Santa Fé')
- is_santiago (boolean, true if present, based on a column like 'Santiago')
- is_wolf (boolean, true if present, based on a column like 'Wolf')

The column names in the CSV might vary (e.g., "Spanish Common Name", "spanishCommonName", "Nombre Común"). You must intelligently map them to the required fields.
For island presence columns, a value like 'x' or '1' indicates presence (true). An empty cell means absence (false).

If a row does not contain a valid 'spanishCommonName', skip it entirely.
Return a JSON array of all the processed species records. Ignore all other columns from the source file.

CSV content to analyze:
\`\`\`csv
{{{this}}}
\`\`\`
`,
});

// Define the main flow.
const processCsvWithAIFlow = ai.defineFlow(
  {
    name: 'processCsvWithAIFlow',
    inputSchema: CsvInputSchema,
    outputSchema: CsvOutputSchema,
  },
  async (csvText) => {
    if (csvText.length < 50) {
      console.log('CSV text is too short, returning empty array.');
      return [];
    }

    console.log('Starting AI processing for CSV content...');
    const { output } = await processCsvPrompt(csvText);

    if (!output) {
      console.error('AI processing failed to return output.');
      throw new Error('Failed to process CSV with AI.');
    }

    console.log(`AI processing completed. Found ${output.length} records.`);
    return output;
  }
);

// Export a wrapper function to be easily called from other server-side modules.
export async function processCsvWithAI(csvText: string): Promise<ProcessCsvOutput> {
  return processCsvWithAIFlow(csvText);
}
