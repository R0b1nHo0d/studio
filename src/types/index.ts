
export interface TrafficLog {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  destinationPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'OTHER';
  size: number; // in bytes
  packetSummary: string; 
}

export interface FilterRule {
  id: string;
  field: keyof Omit<TrafficLog, 'id' | 'packetSummary' | 'protocol'> | 'protocol' | 'custom'; // Ensure protocol is correctly typed
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
  value: string | number;
  isEnabled: boolean;
}

export interface AiAnalysisReport {
  summary: string;
  potentialThreats: string;
  anomalies: string;
  outboundSrcToRemote: string;
  recommendations: string;
}

