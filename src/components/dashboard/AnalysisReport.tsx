
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Info, ListChecks, ArrowUpRight } from "lucide-react";
import type { AiAnalysisReport } from "@/types";

interface AnalysisReportProps {
  report: AiAnalysisReport | null;
  isLoading: boolean;
  error?: string | null;
}

export function AnalysisReport({ report, isLoading, error }: AnalysisReportProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis in Progress</CardTitle>
          <CardDescription>AI is analyzing the traffic data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
       <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive-foreground bg-destructive/20 p-3 rounded-md">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Analysis Available</CardTitle>
          <CardDescription>Submit traffic data for analysis.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <Info className="mx-auto h-10 w-10 mb-2" />
          <p>The AI analysis report will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            Traffic Analysis Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ReportSection title="Summary" icon={<Info className="h-5 w-5 text-primary" />}>
            <p className="text-sm whitespace-pre-wrap">{report.summary}</p>
          </ReportSection>
          <ReportSection title="Potential Threats" icon={<AlertTriangle className="h-5 w-5 text-destructive" />}>
            <p className="text-sm whitespace-pre-wrap">{report.potentialThreats}</p>
          </ReportSection>
          <ReportSection title="Anomalies Detected" icon={<AlertTriangle className="h-5 w-5 text-accent" />}>
            <p className="text-sm whitespace-pre-wrap">{report.anomalies}</p>
          </ReportSection>
          <ReportSection title="OUTbound Traffic (Source to Remote)" icon={<ArrowUpRight className="h-5 w-5 text-blue-500" />}>
            <p className="text-sm whitespace-pre-wrap">{report.outboundSrcToRemote}</p>
          </ReportSection>
          <ReportSection title="Recommendations" icon={<ListChecks className="h-5 w-5 text-green-600" />}>
            <p className="text-sm whitespace-pre-wrap">{report.recommendations}</p>
          </ReportSection>
        </CardContent>
      </Card>
    </div>
  );
}

interface ReportSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function ReportSection({ title, icon, children }: ReportSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      <div className="pl-7 text-muted-foreground">{children}</div>
    </div>
  );
}

