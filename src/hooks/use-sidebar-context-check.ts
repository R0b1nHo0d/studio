
"use client"

import * as React from "react"
// Assuming SidebarContext is exported from the sidebar component directly or re-exported
// If SidebarContext is not directly exported, this import path needs adjustment.
// For now, let's assume it might be part of the main export or needs to be explicitly exported from ui/sidebar.
// Let's try to define it here if it's not exported directly from @/components/ui/sidebar
// This is a common pattern for context usage.

// This is a simplified context type. The actual SidebarContext type from sidebar.tsx would be more complex.
// If `SidebarContext` is not exported from `@/components/ui/sidebar`, we'd need to either export it
// or replicate its type here carefully.
// For the purpose of this example, let's assume the `SidebarContext` type from `sidebar.tsx` is:
type SidebarContextType = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
} | null;

// Attempting to import SidebarContext if it was exported.
// If this fails, it means SidebarContext is not exported from the sidebar.tsx file.
// For now, we will have to get it from the component itself if not exported.
// We'll assume it's not exported and get it from the component as it is common.

// The Sidebar component itself uses React.createContext internally.
// The useSidebar hook in sidebar.tsx already does the context check.
// So, we can directly use the hook from there.
// This file might be redundant if the hook from sidebar.tsx is sufficient.
// Let's re-export the useSidebar hook for semantic clarity if needed, or just use the original.

import { useSidebar as useOriginalSidebar } from "@/components/ui/sidebar";

export function useSidebar() {
  // useOriginalSidebar already performs the null check and throws an error.
  // So, this custom hook essentially re-exports it.
  return useOriginalSidebar();
}
