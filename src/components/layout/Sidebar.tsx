
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Mail, 
  Users, 
  FileText, 
  BarChart, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface SidebarItem {
  title: string;
  icon: React.ElementType;
  path: string;
}

export const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const location = useLocation();
  
  const items: SidebarItem[] = [
    { title: 'Dashboard', icon: BarChart, path: '/' },
    { title: 'Campaigns', icon: Mail, path: '/campaigns' },
    { title: 'Templates', icon: FileText, path: '/templates' },
    { title: 'Contacts', icon: Users, path: '/contacts' },
    { title: 'Settings', icon: Settings, path: '/settings' }
  ];

  return (
    <div 
      className={cn(
        "fixed h-full bg-brand-accent text-white z-20 transition-all duration-300",
        open ? "w-64" : "w-0 lg:w-20"
      )}
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
        <h1 className={cn(
          "text-xl font-bold text-brand-highlight transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 lg:hidden"
        )}>
          GPM Launch
        </h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setOpen(!open)}
          className="text-white hover:bg-brand-accent/30 hidden lg:flex"
        >
          {open ? <ChevronLeft /> : <ChevronRight />}
        </Button>
      </div>

      <div className="py-6">
        {items.map((item) => {
          const isActive = location.pathname === item.path || 
                        (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-6 py-3 mx-2 rounded-md transition-colors",
                isActive 
                  ? "bg-brand-highlight text-brand-accent font-medium" 
                  : "text-gray-300 hover:bg-white/10"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span 
                className={cn(
                  "ml-3 transition-opacity duration-200", 
                  open ? "opacity-100" : "opacity-0 hidden lg:hidden"
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
