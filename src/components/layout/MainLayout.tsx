import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-brand-light">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className={cn(
        "flex-1 transition-all duration-300 w-full", 
        sidebarOpen ? "lg:ml-64" : "lg:ml-20"
      )}>
        <header className="h-16 px-6 bg-brand-white flex items-center justify-between shadow-sm z-10 sticky top-0">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-brand-accent">Email Blasting</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-600 hidden md:block">
                {user.name || user.email}
              </span>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </Button>
          </div>
        </header>
        <main className="px-6 py-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
