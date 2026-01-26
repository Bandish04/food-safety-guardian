import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuthContext } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export const DashboardLayout = ({ children, title, description }: DashboardLayoutProps) => {
  const { profile, role } = useAuthContext();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground" />
              {title && (
                <div>
                  <h1 className="font-semibold text-lg">{title}</h1>
                  {description && (
                    <p className="text-sm text-muted-foreground hidden sm:block">{description}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger animate-pulse-slow" />
              </Button>
              <Badge variant="outline" className="capitalize hidden sm:inline-flex">
                {role?.replace('_', ' ') || 'Staff'}
              </Badge>
            </div>
          </header>

          <main className="p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
