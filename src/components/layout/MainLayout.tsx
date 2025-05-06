
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-brand-light">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className={cn(
        "flex-1 transition-all duration-300", 
        sidebarOpen ? "ml-64" : "ml-0"
      )}>
        <header className="h-16 px-6 bg-brand-white flex items-center shadow-sm z-10 sticky top-0">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-4 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-brand-accent">Blast Master</h1>
        </header>
        <main className="px-6 py-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
