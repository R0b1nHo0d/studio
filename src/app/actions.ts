
'use server';
import { generateTrafficAnalysisReport } from '@/ai/flows/generate-traffic-analysis-report';
import type { TrafficAnalysisReportInput, TrafficAnalysisReportOutput } from '@/ai/flows/generate-traffic-analysis-report';
import { summarizeTrafficAnalysis } from '@/ai/flows/summarize-traffic-analysis';
import type { SummarizeTrafficAnalysisInput, SummarizeTrafficAnalysisOutput } from '@/ai/flows/summarize-traffic-analysis';


export async function analyzeTrafficDataAction(input: TrafficAnalysisReportInput): Promise<TrafficAnalysisReportOutput> {
  try {
    const report = await generateTrafficAnalysisReport(input);
    return report;
  } catch (error) {
    console.error("Error analyzing traffic data:", error);
    // Consider re-throwing a more specific error or returning a structured error
    throw new Error("Failed to analyze traffic data via generateTrafficAnalysisReport. Please check server logs.");
  }
}

export async function summarizeTrafficDataAction(input: SummarizeTrafficAnalysisInput): Promise<SummarizeTrafficAnalysisOutput> {
  try {
    const summary = await summarizeTrafficAnalysis(input);
    return summary;
  } catch (error) {
    console.error("Error summarizing traffic data:", error);
    throw new Error("Failed to summarize traffic data via summarizeTrafficAnalysis. Please check server logs.");
  }
}
