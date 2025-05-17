
'use server';
import { generateTrafficAnalysisReport } from '@/ai/flows/generate-traffic-analysis-report';
import type { TrafficAnalysisReportInput, TrafficAnalysisReportOutput } from '@/ai/flows/generate-traffic-analysis-report';


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

