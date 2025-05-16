
// Use server directive is required when using Genkit flows in Next.js
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating traffic analysis reports.
 *
 * generateTrafficAnalysisReport - A function that takes network traffic data and returns an analysis report.
 * TrafficAnalysisReportInput - The input type for the generateTrafficAnalysisReport function.
 * TrafficAnalysisReportOutput - The return type for the generateTrafficAnalysisReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrafficAnalysisReportInputSchema = z.object({
  trafficData: z
    .string()
    .describe('Captured network traffic data in a standard format like PCAP or JSON.'),
  filters: z
    .string()
    .optional()
    .describe('Optional filters to apply to the traffic data before analysis.'),
});
export type TrafficAnalysisReportInput = z.infer<typeof TrafficAnalysisReportInputSchema>;

const TrafficAnalysisReportOutputSchema = z.object({
  summary: z.string().describe('A high-level summary of the network traffic.'),
  potentialThreats: z
    .string()
    .describe('An analysis of potential security threats identified in the traffic.'),
  anomalies: z.string().describe('Identified anomalies or unusual patterns in the traffic.'),
  outboundSrcToRemote: z.string().describe('A summary of notable outbound traffic connections from local source IPs to remote destination IPs, including protocols and common ports if identifiable.'),
  recommendations: z
    .string()
    .describe('Recommendations for improving network security based on the analysis.'),
});
export type TrafficAnalysisReportOutput = z.infer<typeof TrafficAnalysisReportOutputSchema>;

export async function generateTrafficAnalysisReport(
  input: TrafficAnalysisReportInput
): Promise<TrafficAnalysisReportOutput> {
  return generateTrafficAnalysisReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'trafficAnalysisReportPrompt',
  input: {schema: TrafficAnalysisReportInputSchema},
  output: {schema: TrafficAnalysisReportOutputSchema},
  prompt: `You are an expert network security analyst. Analyze the provided network traffic data and generate a report that includes a summary, potential threats, anomalies, outbound traffic details, and recommendations.

Traffic Data:
{{trafficData}}

Filters Applied (if any):
{{#if filters}}
{{filters}}
{{else}}
No filters applied.
{{/if}}

Report:
Summary: Briefly describe the overall network traffic patterns.
Potential Threats: Identify any potential security threats present in the traffic data and describe them in detail.
Anomalies: Highlight any unusual or anomalous patterns observed in the traffic.
Outbound Traffic (Source to Remote): Detail significant outbound connections observed from local sources to remote destinations. For each connection, mention the source IP, destination IP, protocol, and any common service ports if identifiable.
Recommendations: Provide actionable recommendations to improve network security based on the analysis.`,
});

const generateTrafficAnalysisReportFlow = ai.defineFlow(
  {
    name: 'generateTrafficAnalysisReportFlow',
    inputSchema: TrafficAnalysisReportInputSchema,
    outputSchema: TrafficAnalysisReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

