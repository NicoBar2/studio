
'use server';
/**
 * @fileOverview A Genkit flow to extract species information from a raw CSV text using an AI model.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractInputSchema = z.object({
  searchTerm: z.string().describe('The scientific or common name of the species to search for.'),
  csvText: z.string().describe('The full text content of a CSV file to be analyzed.'),
});

const SpeciesInfoSchema = z.object({
  scientificName: z.string().optional().describe('The scientific name found for the species.'),
  commonName: z.string().optional().describe('The common name found for the species.'),
  family: z.string().optional().describe('The family of the species.'),
  iucnStatus: z.string().optional().describe('The IUCN conservation status.'),
});

const ExtractOutputSchema = z.array(SpeciesInfoSchema).describe('An array of all unique species found in the document that match the search term.');


const extractPrompt = ai.definePrompt({
    name: 'extractSpeciesInfoPrompt',
    input: { schema: ExtractInputSchema },
    output: { schema: ExtractOutputSchema },
    prompt: `You are an expert biologist and data analyst. Your task is to analyze the provided CSV text and find all records that match the given search term: '{{{searchTerm}}}'.

The CSV text may have inconsistent headers or formatting. You must intelligently identify columns that correspond to scientific name, common name, family, and IUCN status.

Search for any mention of '{{{searchTerm}}}' across all fields in the CSV. For each matching record, extract the following information into a structured JSON object. If a field is not present or cannot be determined, omit it.

CSV Content to analyze:
\`\`\`csv
{{{csvText}}}
\`\`\`

Return a JSON array of all unique matching species found. Do not return duplicate entries. If no matches are found, return an empty array.`,
});

const extractSpeciesInfoFlow = ai.defineFlow(
    {
        name: 'extractSpeciesInfoFlow',
        inputSchema: ExtractInputSchema,
        outputSchema: ExtractOutputSchema,
    },
    async (input) => {
        // If csvText is very short or empty, don't bother calling the AI.
        if (input.csvText.length < 50) {
            return [];
        }
        
        try {
            const { output } = await extractPrompt(input);
            return output || [];
        } catch (e) {
            console.error(`[extractSpeciesInfoFlow] AI call failed for searchTerm: ${input.searchTerm}`, e);
            // In case of an error from the AI, return an empty array to avoid breaking the main process.
            return [];
        }
    }
);

// Wrapper function to be called from other server-side modules
export async function extractSpeciesInfo(input: z.infer<typeof ExtractInputSchema>): Promise<z.infer<typeof ExtractOutputSchema>> {
    return extractSpeciesInfoFlow(input);
}
