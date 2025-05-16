
"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Network, LayoutDashboard, FileText, SettingsIcon, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/hooks/use-sidebar-context-check"; // Using the check hook

export function SidebarNav() {
  const { open, toggleSidebar, isMobile, state } = useSidebar();
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex items-center justify-between p-3">
            <div className={`flex items-center gap-2 ${state === 'collapsed' && !isMobile ? 'hidden' : ''}`}>
              <Network className="h-6 w-6 text-sidebar-primary" />
              <span className="font-semibold text-lg text-sidebar-foreground">OUTbound</span>
            </div>
            {(!isMobile && open) && (
              <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent" onClick={toggleSidebar}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className="justify-start"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className={`${state === 'collapsed' && !isMobile ? 'hidden' : ''}`}>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className={`${state === 'collapsed' && !isMobile ? 'hidden' : ''} p-3`}>
          <p className="text-xs text-sidebar-foreground/70">© 2024 OUTbound</p>
        </SidebarFooter>
      </Sidebar>
       {/* The main content area, wrapped by SidebarInset */}
      {/* This part will be implicitly handled by the {children} in RootLayout, wrapped by SidebarInset */}
    </>
  );
}

// Dummy implementation for /reports and /settings pages to avoid 404s
export function ReportsPagePlaceholder() {
  return (
    <SidebarInset>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p>Reports page is under construction.</p>
      </main>
    </SidebarInset>
  );
}

export function SettingsPagePlaceholder() {
  return (
    <SidebarInset>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p>Settings page is under construction.</p>
      </main>
    </SidebarInset>
  );
}
