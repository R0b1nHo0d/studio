
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { TrafficLog, AiAnalysisReport } from "@/types";
import { analyzeTrafficDataAction } from "./actions";
import { TrafficDataTable } from "@/components/dashboard/TrafficDataTable";
import { AnalysisReport } from "@/components/dashboard/AnalysisReport";
import { UploadCloud } from "lucide-react";
import { SidebarInset } from "@/components/ui/sidebar";

// Function to generate initial mock traffic, to be called on the client-side
const getClientSideInitialMockTraffic = (): TrafficLog[] => [
  { id: "1", timestamp: new Date(Date.now() - 10000).toISOString(), sourceIp: "192.168.1.101", destinationIp: "104.18.30.106", destinationPort: 443, protocol: "TCP", size: 1500, packetSummary: "HTTPS traffic to example.com" },
  { id: "2", timestamp: new Date(Date.now() - 8000).toISOString(), sourceIp: "192.168.1.101", destinationIp: "8.8.8.8", destinationPort: 53, protocol: "UDP", size: 120, packetSummary: "DNS query to Google DNS" },
  { id: "3", timestamp: new Date(Date.now() - 5000).toISOString(), sourceIp: "192.168.1.105", destinationIp: "172.217.160.142", destinationPort: 80, protocol: "TCP", size: 850, packetSummary: "HTTP traffic to google.com" },
  { id: "4", timestamp: new Date(Date.now() - 2000).toISOString(), sourceIp: "192.168.1.101", destinationIp: "20.190.160.4", destinationPort: 22, protocol: "TCP", size: 300, packetSummary: "SSH connection attempt" },
  { id: "5", timestamp: new Date().toISOString(), sourceIp: "LOCAL_HOST", destinationIp: "52.200.100.50", destinationPort: 12345, protocol: "UDP", size: 64, packetSummary: "Custom game traffic" },
];

export default function DashboardPage() {
  const { toast } = useToast();
  const [trafficLogs, setTrafficLogs] = useState<TrafficLog[]>([]);
  const clientInitialMockTrafficRef = useRef<TrafficLog[] | null>(null);
  const [aiTrafficInput, setAiTrafficInput] = useState("");
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AiAnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    const generatedMockData = getClientSideInitialMockTraffic();
    clientInitialMockTrafficRef.current = generatedMockData;
    setTrafficLogs(generatedMockData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const result = await analyzeTrafficDataAction({ trafficData: aiTrafficInput });
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

  return (
    <SidebarInset>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        {/* StatCards and Capture & Filters card removed as per request */}
        
        <div className="grid grid-cols-1 gap-6"> {/* Simplified grid, AI card will take full width */}
          <Card className="lg:col-span-1 flex flex-col"> {/* Adjusted to lg:col-span-1 to take full width in a single column grid */}
            <CardHeader>
              <CardTitle>AI-Powered Analysis</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div className="space-y-2">
                <label htmlFor="traffic-file-upload" className="block text-sm font-medium text-foreground">
                  Upload Traffic Data File
                </label>
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
                  Upload traffic data (e.g., CSV, TXT, or LOG format). The AI expects text-based input. <br/>
                  For PCAP files, please convert them to a text format (e.g., using tshark or tcpdump) before uploading.
                </p>
              </div>
              <Button onClick={handleAnalyzeTraffic} disabled={isAnalyzing || !aiTrafficInput.trim()} className="w-full">
                {isAnalyzing ? "Analyzing..." : "Analyze Uploaded Data"}
              </Button>
              <AnalysisReport report={aiAnalysisResult} isLoading={isAnalyzing} error={analysisError}/>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Captured Outbound Traffic Logs (Mock Data)</CardTitle>
          </CardHeader>
          <CardContent>
            <TrafficDataTable data={trafficLogs} activeFilters={[]} /> {/* Pass empty array for activeFilters */}
          </CardContent>
        </Card>
      </main>
    </SidebarInset>
  );
}
