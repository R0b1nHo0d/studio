
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FilterRule } from "@/types";
import { PlusCircle } from "lucide-react";

const filterRuleSchema = z.object({
  field: z.enum([
    "timestamp",
    "sourceIp",
    "destinationIp",
    "destinationPort",
    "protocol",
    "size",
    "custom",
  ]),
  operator: z.enum([
    "equals",
    "contains",
    "startsWith",
    "endsWith",
    "greaterThan",
    "lessThan",
  ]),
  value: z.string().min(1, "Value is required"),
});

type FilterFormValues = z.infer<typeof filterRuleSchema>;

interface FilterFormProps {
  onAddFilter: (filter: FilterRule) => void;
}

const fieldOptions = [
  { value: "sourceIp", label: "Source IP" },
  { value: "destinationIp", label: "Destination IP" },
  { value: "destinationPort", label: "Destination Port" },
  { value: "protocol", label: "Protocol (TCP, UDP, ICMP)" },
  { value: "size", label: "Size (bytes)" },
  { value: "timestamp", label: "Timestamp" },
  { value: "custom", label: "Custom (Raw Packet Summary)" },
];

const operatorOptions = [
  { value: "equals", label: "Equals" },
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts With" },
  { value: "endsWith", label: "Ends With" },
  { value: "greaterThan", label: "Greater Than (>)" },
  { value: "lessThan", label: "Less Than (<)" },
];

export function FilterForm({ onAddFilter }: FilterFormProps) {
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterRuleSchema),
    defaultValues: {
      field: "destinationIp",
      operator: "equals",
      value: "",
    },
  });

  function onSubmit(data: FilterFormValues) {
    const newFilter: FilterRule = {
      id: crypto.randomUUID(),
      field: data.field as FilterRule["field"], // Type assertion
      operator: data.operator as FilterRule["operator"],
      value: data.field === "destinationPort" || data.field === "size" ? Number(data.value) : data.value,
      isEnabled: true,
    };
    onAddFilter(newFilter);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="field"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a field" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {fieldOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="operator"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operator</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an operator" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {operatorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter filter value" 
                  {...field} 
                  type={form.getValues("field") === "destinationPort" || form.getValues("field") === "size" ? "number" : "text"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Filter
        </Button>
      </form>
    </Form>
  );
}
