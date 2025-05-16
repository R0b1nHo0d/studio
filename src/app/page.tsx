
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { TrafficLog, FilterRule, AiAnalysisReport } from "@/types";
import { analyzeTrafficDataAction } from "./actions";
import { FilterForm } from "@/components/dashboard/FilterForm";
import { TrafficDataTable } from "@/components/dashboard/TrafficDataTable";
import { AnalysisReport } from "@/components/dashboard/AnalysisReport";
import { StatCard } from "@/components/dashboard/StatCard";
import { PlayCircle, StopCircle, Package, DatabaseZap, Filter as FilterIcon, ShieldAlert, Trash2, ToggleRight, ToggleLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SidebarInset } from "@/components/ui/sidebar";

const initialMockTraffic: TrafficLog[] = [
  { id: "1", timestamp: new Date(Date.now() - 10000).toISOString(), sourceIp: "192.168.1.101", destinationIp: "104.18.30.106", destinationPort: 443, protocol: "TCP", size: 1500, packetSummary: "HTTPS traffic to example.com" },
  { id: "2", timestamp: new Date(Date.now() - 8000).toISOString(), sourceIp: "192.168.1.101", destinationIp: "8.8.8.8", destinationPort: 53, protocol: "UDP", size: 120, packetSummary: "DNS query to Google DNS" },
  { id: "3", timestamp: new Date(Date.now() - 5000).toISOString(), sourceIp: "192.168.1.105", destinationIp: "172.217.160.142", destinationPort: 80, protocol: "TCP", size: 850, packetSummary: "HTTP traffic to google.com" },
  { id: "4", timestamp: new Date(Date.now() - 2000).toISOString(), sourceIp: "192.168.1.101", destinationIp: "20.190.160.4", destinationPort: 22, protocol: "TCP", size: 300, packetSummary: "SSH connection attempt" },
  { id: "5", timestamp: new Date().toISOString(), sourceIp: "LOCAL_HOST", destinationIp: "52.200.100.50", destinationPort: 12345, protocol: "UDP", size: 64, packetSummary: "Custom game traffic" },
];

export default function DashboardPage() {
  const { toast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);
  const [trafficLogs, setTrafficLogs] = useState<TrafficLog[]>(initialMockTraffic);
  const [activeFilters, setActiveFilters] = useState<FilterRule[]>([]);
  const [aiTrafficInput, setAiTrafficInput] = useState("");
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AiAnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Simulate live traffic capture
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isCapturing) {
      setTrafficLogs(initialMockTraffic.slice(0,2)); // Reset to a few initial logs when starting
      intervalId = setInterval(() => {
        const newLog: TrafficLog = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          sourceIp: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          destinationIp: `${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254) + 1}`,
          destinationPort: Math.floor(Math.random() * 65535) + 1,
          protocol: (["TCP", "UDP", "ICMP"] as const)[Math.floor(Math.random() * 3)],
          size: Math.floor(Math.random() * 1400) + 60,
          packetSummary: "Generated mock traffic log entry",
        };
        setTrafficLogs((prevLogs) => [newLog, ...prevLogs].slice(0, 50)); // Keep max 50 logs
      }, 3000);
    } else {
       if (trafficLogs.length !== initialMockTraffic.length || trafficLogs[0]?.id !== initialMockTraffic[0]?.id) {
         setTrafficLogs(initialMockTraffic); // Reset to full initial mock data when stopped
       }
    }
    return () => clearInterval(intervalId);
  }, [isCapturing]);


  const handleAddFilter = (filter: FilterRule) => {
    setActiveFilters((prev) => [...prev, filter]);
    toast({ title: "Filter Added", description: `Filter for ${filter.field} ${filter.operator} ${filter.value} applied.` });
  };

  const handleToggleFilter = (filterId: string) => {
    setActiveFilters(prev => prev.map(f => f.id === filterId ? {...f, isEnabled: !f.isEnabled} : f));
  };

  const handleRemoveFilter = (filterId: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== filterId));
     toast({ title: "Filter Removed", variant: "destructive" });
  };

  const handleAnalyzeTraffic = async () => {
    if (!aiTrafficInput.trim()) {
      toast({ title: "Input Required", description: "Please paste traffic data for analysis.", variant: "destructive" });
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
  
  const totalPackets = trafficLogs.length;
  const dataTransferredMB = (trafficLogs.reduce((acc, log) => acc + log.size, 0) / (1024 * 1024)).toFixed(2);


  return (
    <SidebarInset>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Packets" value={totalPackets} icon={<Package />} description={isCapturing ? "Updating live..." : "Last capture"} />
          <StatCard title="Data Transferred" value={`${dataTransferredMB} MB`} icon={<DatabaseZap />} description="Outbound only" />
          <StatCard title="Active Filters" value={activeFilters.filter(f => f.isEnabled).length} icon={<FilterIcon />} description={`${activeFilters.length} total filters`} />
          <StatCard title="Threats Identified" value={aiAnalysisResult?.potentialThreats && aiAnalysisResult.potentialThreats !== "None" && aiAnalysisResult.potentialThreats !== "No potential threats identified." ? "Review Report" : "None"} icon={<ShieldAlert />} description="From last AI analysis" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader>
              <CardTitle>Capture & Filters</CardTitle>
              <CardDescription>Control traffic capture and define filtering rules.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-6">
              <div className="space-y-2">
                <h3 className="text-md font-semibold">Capture Control</h3>
                {isCapturing ? (
                  <Button onClick={() => setIsCapturing(false)} variant="destructive" className="w-full">
                    <StopCircle className="mr-2 h-4 w-4" /> Stop Capture
                  </Button>
                ) : (
                  <Button onClick={() => setIsCapturing(true)} variant="default" className="w-full">
                    <PlayCircle className="mr-2 h-4 w-4" /> Start Capture
                  </Button>
                )}
                 <p className="text-xs text-muted-foreground text-center">Simulates live outbound traffic capture.</p>
              </div>
              <div>
                <h3 className="text-md font-semibold mb-2">Define New Filter</h3>
                <FilterForm onAddFilter={handleAddFilter} />
              </div>
            </CardContent>
             <CardFooter className="mt-auto">
                {activeFilters.length > 0 && (
                  <div className="w-full space-y-2">
                    <h4 className="text-sm font-semibold">Active Filters:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                    {activeFilters.map((filter) => (
                      <div key={filter.id} className="flex items-center justify-between text-xs p-1.5 bg-muted rounded-md">
                        <span className={`${!filter.isEnabled ? 'line-through text-muted-foreground' : ''}`}>
                          {filter.field} {filter.operator} &quot;{String(filter.value).substring(0,20)}{String(filter.value).length > 20 ? '...' : ''}&quot;
                        </span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleFilter(filter.id)}>
                            {filter.isEnabled ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveFilter(filter.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                )}
              </CardFooter>
          </Card>

          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader>
              <CardTitle>AI-Powered Analysis</CardTitle>
              <CardDescription>Analyze captured traffic data using GenAI to identify patterns and threats.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <Textarea
                placeholder="Paste traffic data here for analysis (e.g., CSV or log format). Ensure data focuses on outbound traffic details like destination IPs, ports, protocols, and data size."
                value={aiTrafficInput}
                onChange={(e) => setAiTrafficInput(e.target.value)}
                className="min-h-[150px] font-mono text-xs"
                data-ai-hint="network logs"
              />
              <Button onClick={handleAnalyzeTraffic} disabled={isAnalyzing || !aiTrafficInput.trim()} className="w-full">
                {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
              </Button>
              <AnalysisReport report={aiAnalysisResult} isLoading={isAnalyzing} error={analysisError}/>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Captured Outbound Traffic Logs</CardTitle>
            <CardDescription>
              Displaying {isCapturing ? "live" : "last captured"} outbound network traffic. Filtered by active rules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrafficDataTable data={trafficLogs} activeFilters={activeFilters.filter(f => f.isEnabled)} />
          </CardContent>
        </Card>
      </main>
    </SidebarInset>
  );
}
