
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SidebarInset } from '@/components/ui/sidebar';
import { useTheme } from '@/hooks/use-theme';
import { Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <SidebarInset>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
        </div>
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <Label htmlFor="dark-mode-switch" className="font-medium">
                  Dark Mode
                </Label>
              </div>
              <Switch
                id="dark-mode-switch"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                aria-label="Toggle dark mode"
              />
            </div>
             {/* Future settings can be added here */}
          </CardContent>
        </Card>
      </main>
    </SidebarInset>
  );
}

