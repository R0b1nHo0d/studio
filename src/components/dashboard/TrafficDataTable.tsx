
"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TrafficLog, FilterRule } from "@/types";
import { Download, ArrowUpDown, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface TrafficDataTableProps {
  data: TrafficLog[];
  activeFilters: FilterRule[];
}

type SortConfig = {
  key: keyof TrafficLog | null;
  direction: "ascending" | "descending";
};

function exportToCsv(filename: string, rows: TrafficLog[]) {
  if (!rows || !rows.length) {
    return;
  }
  const separator = ',';
  const keys: (keyof TrafficLog)[] = ['id', 'timestamp', 'sourceIp', 'destinationIp', 'destinationPort', 'protocol', 'size', 'packetSummary'];
  
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows.map(row => {
      return keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cell = cell instanceof Date ? cell.toLocaleString() : (cell as any).toString().replace(/"/g, '""');
        if ((cell as string).search(/("|,|\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(separator);
    }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}


export function TrafficDataTable({ data, activeFilters }: TrafficDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'timestamp', direction: 'descending' });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Record<keyof TrafficLog, boolean>>({
    id: false,
    timestamp: true,
    sourceIp: true,
    destinationIp: true,
    destinationPort: true,
    protocol: true,
    size: true,
    packetSummary: true,
  });

  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply activeFilters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(log => 
        activeFilters.every(filter => {
          if (!filter.isEnabled) return true;
          const logValue = filter.field === 'custom' ? log.packetSummary : log[filter.field as keyof Omit<TrafficLog, 'id' | 'packetSummary'>];
          const filterValue = filter.value;

          if (logValue === undefined || logValue === null) return false;
          const logStr = String(logValue).toLowerCase();
          const filterStr = String(filterValue).toLowerCase();

          switch (filter.operator) {
            case 'equals': return logStr === filterStr;
            case 'contains': return logStr.includes(filterStr);
            case 'startsWith': return logStr.startsWith(filterStr);
            case 'endsWith': return logStr.endsWith(filterStr);
            case 'greaterThan': return typeof logValue === 'number' && typeof filterValue === 'number' && logValue > filterValue;
            case 'lessThan': return typeof logValue === 'number' && typeof filterValue === 'number' && logValue < filterValue;
            default: return true;
          }
        })
      );
    }
    
    // Apply searchTerm (quick search)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        Object.values(log).some(val =>
          String(val).toLowerCase().includes(lowerSearchTerm)
        )
      );
    }
    return filtered;
  }, [data, activeFilters, searchTerm]);

  const sortedData = useMemo(() => {
    if (sortConfig.key === null) return filteredData;
    return [...filteredData].sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aValue = a[sortConfig.key as keyof TrafficLog] as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bValue = b[sortConfig.key as keyof TrafficLog] as any;
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const requestSort = (key: keyof TrafficLog) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(sortedData.map(row => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelectedRows = new Set(selectedRows);
    if (checked) {
      newSelectedRows.add(id);
    } else {
      newSelectedRows.delete(id);
    }
    setSelectedRows(newSelectedRows);
  };
  
  const toggleColumnVisibility = (key: keyof TrafficLog) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const columnDefs: { key: keyof TrafficLog; header: string; isMonospace?: boolean }[] = [
    { key: "timestamp", header: "Timestamp" },
    { key: "sourceIp", header: "Source IP", isMonospace: true },
    { key: "destinationIp", header: "Destination IP", isMonospace: true },
    { key: "destinationPort", header: "Port", isMonospace: true },
    { key: "protocol", header: "Protocol" },
    { key: "size", header: "Size (Bytes)" },
    { key: "packetSummary", header: "Summary" },
  ];

  const selectAllCheckboxState: boolean | 'indeterminate' = useMemo(() => {
    const numSelected = selectedRows.size;
    const numRows = sortedData.length;
    if (numRows === 0) return false;
    if (numSelected === 0) return false;
    if (numSelected === numRows) return true;
    return 'indeterminate';
  }, [selectedRows, sortedData]);


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            type="search"
            placeholder="Quick search all fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 sm:w-1/2 md:w-1/3"
            />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {columnDefs.map(col => (
              <DropdownMenuItem key={col.key} onSelect={(e) => e.preventDefault()} onClick={() => toggleColumnVisibility(col.key)}>
                <Checkbox checked={visibleColumns[col.key]} className="mr-2" />
                {col.header}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={() => exportToCsv('outbound_traffic.csv', sortedData)} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead padding="checkbox">
                <Checkbox
                  checked={selectAllCheckboxState}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  aria-label="Select all rows"
                />
              </TableHead>
              {columnDefs.filter(col => visibleColumns[col.key]).map(col => (
                <TableHead key={col.key}>
                  <Button variant="ghost" onClick={() => requestSort(col.key)} className="px-1">
                    {col.header}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((log) => (
                <TableRow key={log.id} data-state={selectedRows.has(log.id) ? "selected" : ""}>
                  <TableCell padding="checkbox">
                    <Checkbox
                        checked={selectedRows.has(log.id)}
                        onCheckedChange={(checked) => handleSelectRow(log.id, !!checked)}
                        aria-label={`Select row ${log.id}`}
                    />
                  </TableCell>
                  {columnDefs.filter(col => visibleColumns[col.key]).map(column => (
                     <TableCell key={column.key} className={column.isMonospace ? "font-mono" : ""}>
                      {column.key === 'protocol' ? (
                        <Badge variant={
                          log[column.key] === 'TCP' ? 'default' :
                          log[column.key] === 'UDP' ? 'secondary' :
                          log[column.key] === 'ICMP' ? 'outline' : 'destructive' // Example variants
                        }>{String(log[column.key])}</Badge>
                      ) : (
                        String(log[column.key])
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnDefs.filter(col => visibleColumns[col.key]).length + 1} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>{selectedRows.size} of {sortedData.length} row(s) selected.</div>
        {/* TODO: Add pagination if needed */}
        <div>Page 1 of 1</div> 
      </div>
    </div>
  );
}

