
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { AiAnalysisReport } from "@/types";
import { analyzeTrafficDataAction } from "./actions";
import { AnalysisReport } from "@/components/dashboard/AnalysisReport";
import { IpFrequencyChart } from "@/components/dashboard/IpFrequencyChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { UploadCloud, ShieldAlert, ListTree, ArrowUpRightSquare } from "lucide-react";
import { SidebarInset } from "@/components/ui/sidebar";

export default function DashboardPage() {
  const { toast } = useToast();
  const [aiTrafficInput, setAiTrafficInput] = useState("");
  const [whitelistedDomainsInput, setWhitelistedDomainsInput] = useState("");
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AiAnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setAiTrafficInput(text);
      };
      reader.onerror = () => {
        toast({ title: "File Error", description: "Could not read the file.", variant: "destructive" });
        setFileName(null);
        setAiTrafficInput("");
      };
      reader.readAsText(file);
    } else {
      setFileName(null);
      setAiTrafficInput("");
    }
  };

  const handleAnalyzeTraffic = async () => {
    if (!aiTrafficInput.trim()) {
      toast({ title: "No Data for Analysis", description: "Please upload a traffic data file.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAiAnalysisResult(null);
    try {
      const result = await analyzeTrafficDataAction({ 
        trafficData: aiTrafficInput,
        whitelistedDomains: whitelistedDomainsInput.trim() || undefined,
      });
      setAiAnalysisResult(result);
      toast({ title: "Analysis Complete", description: "Traffic data analyzed successfully." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during analysis.";
      setAnalysisError(errorMessage);
      toast({ title: "Analysis Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasSummaryStats = aiAnalysisResult && (
    typeof aiAnalysisResult.threatCount === 'number' ||
    typeof aiAnalysisResult.anomalyCount === 'number' ||
    typeof aiAnalysisResult.significantOutboundConnectionsCount === 'number'
  );

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col md:flex-row gap-6 px-4 py-6 sm:px-6">
        {/* Left Column - Description Box */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle>About OUTbound Analyzer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                OUTbound Analyzer is a tool designed to help you understand and secure your network traffic.
              </p>
              <p className="text-sm text-muted-foreground">
                Upload your captured network logs (e.g., from tools like Wireshark or tcpdump, converted to text format) 
                to leverage AI-powered analysis. 
              </p>
              <p className="text-sm text-muted-foreground">
                Identify patterns, anomalies, potential security threats, 
                and see how your applications are communicating with whitelisted and non-whitelisted domains.
                The visual IP frequency chart also helps pinpoint the most common destinations in your traffic.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Existing Content */}
        <div className="flex-1 flex flex-col gap-6">
          <Card className="flex-1 flex flex-col shadow-lg">
            <CardHeader>
              <CardTitle>AI-Powered Analysis</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-6 p-6">
              <div className="non-printable space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="traffic-file-upload" className="block text-sm font-medium text-foreground">
                    Upload Traffic Data File
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="traffic-file-upload"
                      type="file"
                      onChange={handleFileChange}
                      accept=".txt,.log,.csv,.json" 
                      className="w-full cursor-pointer border-input"
                      data-ai-hint="upload logs"
                    />
                    <UploadCloud className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {fileName && <p className="text-xs text-muted-foreground">Selected file: {fileName}</p>}
                  <p className="text-xs text-muted-foreground">
                    Upload traffic data (e.g., CSV, TXT, JSON, or LOG format). The AI expects text-based input. <br />
                    For PCAP files, please convert them to a text format (e.g., using tshark or tcpdump) before uploading.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whitelisted-domains-input" className="block text-sm font-medium text-foreground">
                    Whitelisted Domains (Optional)
                  </Label>
                  <Textarea
                    id="whitelisted-domains-input"
                    placeholder="Enter comma-separated domains, e.g., google.com, mycompany.com, api.service.com"
                    value={whitelistedDomainsInput}
                    onChange={(e) => setWhitelistedDomainsInput(e.target.value)}
                    className="min-h-[60px]"
                    data-ai-hint="whitelist domains"
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a list of domains you trust. The AI will categorize connections based on this list.
                  </p>
                </div>

                <Button onClick={handleAnalyzeTraffic} disabled={isAnalyzing || !aiTrafficInput.trim()} className="w-full">
                  {isAnalyzing ? "Analyzing..." : "Analyze Uploaded Data"}
                </Button>
              </div>
              
              {/* Summary Statistics Section */}
              {!isAnalyzing && hasSummaryStats && aiAnalysisResult && (
                <div className="grid gap-4 md:grid-cols-3 my-4">
                  {typeof aiAnalysisResult.threatCount === 'number' && (
                    <StatCard
                      title="Potential Threats"
                      value={aiAnalysisResult.threatCount}
                      icon={<ShieldAlert className="h-5 w-5 text-destructive" />}
                    />
                  )}
                  {typeof aiAnalysisResult.anomalyCount === 'number' && (
                    <StatCard
                      title="Anomalies Detected"
                      value={aiAnalysisResult.anomalyCount}
                      icon={<ListTree className="h-5 w-5 text-accent" />}
                    />
                  )}
                  {typeof aiAnalysisResult.significantOutboundConnectionsCount === 'number' && (
                    <StatCard
                      title="Sig. Outbound Conns."
                      value={aiAnalysisResult.significantOutboundConnectionsCount}
                      icon={<ArrowUpRightSquare className="h-5 w-5 text-blue-500" />}
                      description="Count of notable connections"
                    />
                  )}
                </div>
              )}
              
              {/* Wrapper for printable content */}
              <div id="ai-analysis-report-card" className="space-y-6">
                <AnalysisReport report={aiAnalysisResult} isLoading={isAnalyzing} error={analysisError} />
                
                {/* IP Frequency Chart - now part of the printable area if visible */}
                {(aiAnalysisResult || isAnalyzing) && !analysisError && (
                    <IpFrequencyChart data={aiAnalysisResult?.ipFrequency} isLoading={isAnalyzing} />
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  );
}
