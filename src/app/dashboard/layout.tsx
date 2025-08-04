"use client"; 
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Sidebar, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { LayoutDashboard, Users, HomeIcon, FileUp, GitCompareArrows, PlusCircle, Layers, DatabaseZap, ListChecks, Search } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = useAuth();
  const { t } = useLanguage();

  return (
    <RoleBasedGuard allowedRoles={['admin', 'researcher']}>
      <SidebarProvider defaultOpen>
        <div className="flex min-h-[calc(100vh-var(--header-height,8rem))]">
          <Sidebar collapsible="icon" className="border-r">
            <SidebarHeader className="p-4 flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2 font-headline text-lg font-semibold text-primary">
                <LayoutDashboard className="h-6 w-6" />
                <span className="group-data-[state=collapsed]:hidden">{t.dashboard}</span>
              </Link>
            </SidebarHeader>

            <div className="flex-1 overflow-y-auto">
              <SidebarMenu className="p-2">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild variant="ghost" className="justify-start w-full" tooltip={t.sidebar_summary}>
                    <Link href="/dashboard">
                      <LayoutDashboard />
                      <span className="group-data-[state=collapsed]:hidden">{t.sidebar_summary}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild variant="ghost" className="justify-start w-full" tooltip={t.sidebar_generate_query}>
                    <Link href="/dashboard/compare">
                      <GitCompareArrows />
                      <span className="group-data-[state=collapsed]:hidden">{t.sidebar_generate_query}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild variant="ghost" className="justify-start w-full" tooltip={t.sidebar_heatmap}>
                    <Link href="/dashboard/heatmap">
                      <Layers />
                      <span className="group-data-[state=collapsed]:hidden">{t.sidebar_heatmap}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild variant="ghost" className="justify-start w-full" tooltip={t.sidebar_add_species}>
                    <Link href="/dashboard/add-species">
                      <PlusCircle />
                      <span className="group-data-[state=collapsed]:hidden">{t.sidebar_add_species}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {role === 'admin' && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild variant="ghost" className="justify-start w-full" tooltip={t.sidebar_manage_researchers}>
                        <Link href="/dashboard/admin/researchers">
                          <Users />
                          <span className="group-data-[state=collapsed]:hidden">{t.sidebar_manage_researchers}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild variant="ghost" className="justify-start w-full" tooltip={t.sidebar_import_species}>
                        <Link href="/dashboard/admin/import">
                          <FileUp />
                          <span className="group-data-[state=collapsed]:hidden">{t.sidebar_import_species}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild variant="ghost" className="justify-start w-full" tooltip="Consulta Darwin">
                            <Link href="/dashboard/admin/darwin-query">
                                <Search />
                                <span className="group-data-[state=collapsed]:hidden">Consulta Darwin</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}

                <SidebarMenuItem>
                  <SidebarMenuButton asChild variant="ghost" className="justify-start w-full" tooltip={t.sidebar_public_site}>
                    <Link href="/">
                      <HomeIcon />
                      <span className="group-data-[state=collapsed]:hidden">{t.sidebar_public_site}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>

            <div className="p-2 border-t mt-auto">
              <SidebarTrigger className="hidden md:flex" />
            </div>
            
          </Sidebar>
          <SidebarInset className="flex-1 p-6 bg-background">
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </RoleBasedGuard>
  );
}
