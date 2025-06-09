
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Sidebar, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarInset } from '@/components/ui/sidebar';
import { LayoutDashboard, Edit3, BarChart3, HomeIcon } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleBasedGuard allowedRoles={['admin', 'researcher']}>
      <SidebarProvider defaultOpen>
        <div className="flex">
          <Sidebar collapsible="icon" className="border-r">
            <SidebarHeader className="p-4">
              <Link href="/dashboard" className="flex items-center gap-2 font-headline text-lg font-semibold text-primary">
                <LayoutDashboard className="h-6 w-6" />
                <span className="group-data-[state=collapsed]:hidden">Panel</span>
              </Link>
            </SidebarHeader>
            <SidebarMenu className="p-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild variant="ghost" className="justify-start w-full">
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    <span className="group-data-[state=collapsed]:hidden">Resumen</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Dynamic links for editing/visualizing specific species would typically go here,
                  or be part of sub-navigation on specific pages. For now, general links. */}
              <SidebarMenuItem>
                 <SidebarMenuButton asChild variant="ghost" className="justify-start w-full">
                  <Link href="/">
                    <HomeIcon />
                    <span className="group-data-[state=collapsed]:hidden">Sitio Público</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </Sidebar>
          <SidebarInset className="flex-1 p-6 bg-background">
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </RoleBasedGuard>
  );
}
