
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
import type { IpFrequencyData } from '@/types'; // Import the new type

const TrafficAnalysisReportInputSchema = z.object({
  trafficData: z
    .string()
    .describe('Captured network traffic data in a standard format like PCAP or JSON, converted to text. This text should include details like source/destination IPs, ports, protocols, packet summaries, and ideally TCP flags (SYN, ACK) and HTTP request details (method, URL, status) if available.'),
  filters: z
    .string()
    .optional()
    .describe('Optional context or filters to apply to the traffic data before analysis.'),
  whitelistedDomains: z
    .string()
    .optional()
    .describe('A comma-separated list of whitelisted domains. e.g., "google.com,example.com"'),
});
export type TrafficAnalysisReportInput = z.infer<typeof TrafficAnalysisReportInputSchema>;

const TrafficAnalysisReportOutputSchema = z.object({
  summary: z.string().describe('A high-level summary of the network traffic.'),
  potentialThreats: z
    .string()
    .describe('An analysis of potential security threats identified in the traffic.'),
  anomalies: z.string().describe('Identified anomalies or unusual patterns in the traffic.'),
  outboundSrcToRemote: z.string().describe('A summary of notable outbound traffic connections from local source IPs to remote destination IPs, including protocols and common ports if identifiable.'),
  connectionsToWhitelistedDomains: z
    .string()
    .describe('Summary of connections to whitelisted domains, including identified apps or services if possible.'),
  connectionsToNonWhitelistedDomains: z
    .string()
    .describe('Summary of connections to non-whitelisted (or unknown) domains, including identified apps or services if possible, highlighting potentially suspicious ones.'),
  httpRequestsSummary: z
    .string()
    .optional()
    .describe("A summary of observed HTTP requests, including methods (GET, POST, etc.), requested URLs or hostnames, and any notable patterns or suspicious requests. This should be based on textual data representing HTTP traffic, if present in the input. If no clear HTTP data is present or inferable, state that."),
  tcpHandshakeAnalysis: z
    .string()
    .optional()
    .describe("An analysis of TCP handshake patterns (e.g., SYN, ACK, SYN-ACK sequences). Highlight any anomalies like excessive SYN packets without ACKs, unusual handshake timings if inferable from logs, or repeated failed connection attempts. This is based on textual data showing TCP flags or connection events. If TCP flag/event data is insufficient for this analysis, state that."),
  recommendations: z
    .string()
    .describe('Recommendations for improving network security based on the analysis.'),
  ipFrequency: z.array(z.object({
      ip: z.string().describe('The IP address.'),
      count: z.number().describe('The frequency count of this IP address.'),
    }))
    .optional()
    .describe('A list of top 5-10 destination IP addresses and their frequency counts. Only include if data allows for meaningful frequency analysis. Example: [{"ip": "8.8.8.8", "count": 42}]'),
  threatCount: z.number().optional().describe('The total number of distinct potential security threats identified. Provide 0 if none.'),
  anomalyCount: z.number().optional().describe('The total number of distinct anomalies or unusual patterns identified. Provide 0 if none.'),
  significantOutboundConnectionsCount: z.number().optional().describe('A count of significant or notable outbound connections summarized. Provide 0 if none or not applicable.'),
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
  prompt: `You are an expert network security analyst. Analyze the provided network traffic data (which is a textual representation of network logs, possibly converted from PCAP) and generate a report.

Traffic Data:
{{trafficData}}

{{#if filters}}
Additional Context/Filters for Analysis:
{{filters}}
{{/if}}

{{#if whitelistedDomains}}
Whitelisted Domains:
{{whitelistedDomains}}
When analyzing connections, use this list to differentiate between traffic to whitelisted domains and traffic to non-whitelisted/unknown domains.
{{else}}
No whitelisted domains provided. Analyze all outbound connections.
{{/if}}

Report Requirements:
1. Summary: Briefly describe the overall network traffic patterns.
2. Potential Threats: Identify any potential security threats present in the traffic data and describe them in detail.
3. Anomalies: Highlight any unusual or anomalous patterns observed in the traffic.
4. Outbound Traffic (Source to Remote): Detail significant outbound connections observed from local sources to remote destinations. For each connection, mention the source IP, destination IP, protocol, and any common service ports if identifiable.
5. Connections to Whitelisted Domains: If whitelisted domains were provided, summarize connections to these domains. Attempt to identify the application or service making the connection if possible.
6. Connections to Non-Whitelisted Domains: Summarize connections to domains NOT on the whitelist (or all connections if no whitelist provided). Highlight any that seem unusual, suspicious, or connect to unexpected remote destinations. Attempt to identify the application or service making the connection if possible.
7. HTTP Request Summary: If the traffic data includes details of HTTP requests (e.g., GET/POST methods, URLs, hostnames, headers, status codes from logs), summarize the notable HTTP requests. Mention common destinations, types of requests, and anything that appears suspicious or unexpected. If no clear HTTP data is present or inferable from the logs, state that this information could not be determined.
8. TCP Handshake Analysis: Analyze TCP connection establishment patterns based on any SYN, ACK, FIN, RST flags or connection event logs present in the data. Summarize observations like completed handshakes, connection attempts (e.g., SYN sent), connection resets, or anomalies like SYN floods (many SYNs to a destination without corresponding SYNs-ACKs/ACKs) or repeated failed attempts. If TCP flag/event data is insufficient for this analysis, state that this information could not be determined.
9. Recommendations: Provide actionable recommendations to improve network security based on the analysis.
10. IP Address Frequency: Identify the top 5-10 most frequent *destination* IP addresses observed in the outbound traffic. For each, provide the IP address and its count of occurrences. Format this as an array of objects, where each object has an "ip" (string) and "count" (number) property. If the traffic data is insufficient or too sparse to determine meaningful frequency, you may return an empty array for ipFrequency or omit the field. Example: [{"ip": "8.8.8.8", "count": 42}, {"ip": "1.1.1.1", "count": 20}]
11. Summary Counts:
    - threatCount: Provide the total number of distinct potential security threats you identified. If none, return 0.
    - anomalyCount: Provide the total number of distinct anomalies or unusual patterns you identified. If none, return 0.
    - significantOutboundConnectionsCount: Provide a count of the significant or notable outbound connections you summarized in the "Outbound Traffic (Source to Remote)" section. If none or not applicable, return 0.`,
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
