
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { AiAnalysisReport } from "@/types";
import { analyzeTrafficDataAction } from "./actions";
import { AnalysisReport } from "@/components/dashboard/AnalysisReport";
import { UploadCloud } from "lucide-react";
import { SidebarInset } from "@/components/ui/sidebar";

export default function DashboardPage() {
  const { toast } = useToast();
  const [aiTrafficInput, setAiTrafficInput] = useState("");
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
      <main className="flex flex-1 flex-col">
        <Card className="flex flex-1 flex-col m-2 shadow-lg rounded-lg">
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
                  accept=".txt,.log,.csv,.json" // Specify acceptable file types
                  className="w-full cursor-pointer border-input"
                  data-ai-hint="upload logs"
                  />
                  <UploadCloud className="h-5 w-5 text-muted-foreground" />
              </div>
              {fileName && <p className="text-xs text-muted-foreground">Selected file: {fileName}</p>}
              <p className="text-xs text-muted-foreground">
                Upload traffic data (e.g., CSV, TXT, JSON, or LOG format). The AI expects text-based input. <br/>
                For PCAP files, please convert them to a text format (e.g., using tshark or tcpdump) before uploading.
              </p>
            </div>
            <Button onClick={handleAnalyzeTraffic} disabled={isAnalyzing || !aiTrafficInput.trim()} className="w-full">
              {isAnalyzing ? "Analyzing..." : "Analyze Uploaded Data"}
            </Button>
            <AnalysisReport report={aiAnalysisResult} isLoading={isAnalyzing} error={analysisError}/>
          </CardContent>
        </Card>
      </main>
    </SidebarInset>
  );
}
