'use server';
/**
 * @fileOverview A Genkit flow to answer questions based on a provided document.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const FileQaInputSchema = z.object({
  fileContent: z.string().describe("The text content of the file to be queried."),
  question: z.string().describe("The user's question about the file content."),
});
export type FileQaInput = z.infer<typeof FileQaInputSchema>;

export const FileQaOutputSchema = z.string().describe("The answer to the question, based *only* on the provided file content. If the answer is not in the content, state that.");

const fileQaPrompt = ai.definePrompt({
    name: 'fileQaPrompt',
    input: { schema: FileQaInputSchema },
    output: { schema: FileQaOutputSchema },
    prompt: `You are an expert research assistant. Your task is to answer questions based *exclusively* on the provided document text.
    Do not use any external knowledge. If the answer cannot be found within the document, you must state that the information is not present in the provided text.

    DOCUMENT TEXT:
    ---
    {{{fileContent}}}
    ---

    QUESTION:
    "{{{question}}}"

    Answer in Spanish.
    `,
});

const fileQaFlow = ai.defineFlow(
    {
        name: 'fileQaFlow',
        inputSchema: FileQaInputSchema,
        outputSchema: FileQaOutputSchema,
    },
    async (input) => {
        const { output } = await fileQaPrompt(input);
        if (!output) {
            throw new Error('Failed to generate an answer from the document.');
        }
        return output;
    }
);

export async function answerQuestionFromFile(input: FileQaInput): Promise<string> {
    return fileQaFlow(input);
}
