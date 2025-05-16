
"use client";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Network } from "lucide-react";

export function Header() {
  const { open, toggleSidebar, isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {isMobile || !open ? (
        <SidebarTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Network className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SidebarTrigger>
      ) : null}
       <div className="flex items-center gap-2">
         <Network className="h-6 w-6 text-primary" />
         <h1 className="text-xl font-semibold tracking-tight">OUTbound</h1>
       </div>
      {/* Add other header elements like user profile, settings dropdown here if needed */}
    </header>
  );
}
