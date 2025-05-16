'use server';

/**
 * @fileOverview Summarizes network traffic analysis to identify patterns, anomalies, and security threats.
 *
 * - summarizeTrafficAnalysis - A function that handles the summarization of network traffic analysis.
 * - SummarizeTrafficAnalysisInput - The input type for the summarizeTrafficAnalysis function.
 * - SummarizeTrafficAnalysisOutput - The return type for the summarizeTrafficAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTrafficAnalysisInputSchema = z.object({
  trafficData: z
    .string()
    .describe('Captured network traffic data, including source, destination, and size.'),
});
export type SummarizeTrafficAnalysisInput = z.infer<
  typeof SummarizeTrafficAnalysisInputSchema
>;

const SummarizeTrafficAnalysisOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the analyzed outbound network traffic, highlighting key patterns, anomalies, and potential security threats.'
    ),
});
export type SummarizeTrafficAnalysisOutput = z.infer<
  typeof SummarizeTrafficAnalysisOutputSchema
>;

export async function summarizeTrafficAnalysis(
  input: SummarizeTrafficAnalysisInput
): Promise<SummarizeTrafficAnalysisOutput> {
  return summarizeTrafficAnalysisFlow(input);
}

const summarizeTrafficAnalysisPrompt = ai.definePrompt({
  name: 'summarizeTrafficAnalysisPrompt',
  input: {schema: SummarizeTrafficAnalysisInputSchema},
  output: {schema: SummarizeTrafficAnalysisOutputSchema},
  prompt: `You are an expert network security analyst.

  Analyze the following network traffic data and provide a concise summary of the key patterns, anomalies, and potential security threats. Focus on outbound traffic patterns and potential risks associated with the traffic.

  Traffic Data:
  {{trafficData}}`,
});

const summarizeTrafficAnalysisFlow = ai.defineFlow(
  {
    name: 'summarizeTrafficAnalysisFlow',
    inputSchema: SummarizeTrafficAnalysisInputSchema,
    outputSchema: SummarizeTrafficAnalysisOutputSchema,
  },
  async input => {
    const {output} = await summarizeTrafficAnalysisPrompt(input);
    return output!;
  }
);
