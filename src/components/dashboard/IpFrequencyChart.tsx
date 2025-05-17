
"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { IpFrequencyData } from "@/types";
import { Network } from "lucide-react";

interface IpFrequencyChartProps {
  data: IpFrequencyData[] | undefined;
  isLoading: boolean;
}

const chartConfig = {
  count: {
    label: "Connections",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function IpFrequencyChart({ data, isLoading }: IpFrequencyChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="mr-2 h-5 w-5 text-primary" />
            Top Destination IPs
          </CardTitle>
          <CardDescription>Loading IP frequency data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6 h-[350px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="mr-2 h-5 w-5 text-primary" />
            Top Destination IPs
          </CardTitle>
          <CardDescription>
            No IP frequency data available from the analysis, or data was insufficient.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6 h-[350px] text-muted-foreground">
          <p>Upload traffic data to see IP frequency.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort data by count descending and take top 10 for cleaner chart
  const sortedAndTrimmedData = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <Network className="mr-2 h-5 w-5 text-primary" />
            Top Destination IPs by Connection Count
        </CardTitle>
        <CardDescription>
          Most frequent destination IP addresses found in the traffic data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedAndTrimmedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" dataKey="count" />
              <YAxis
                dataKey="ip"
                type="category"
                tick={{ fontSize: 12 }}
                width={100} // Adjust as needed for IP address length
                interval={0} // Show all IP labels
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Legend />
              <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
