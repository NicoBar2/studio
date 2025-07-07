
"use client"; 
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Sidebar, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { LayoutDashboard, Users, HomeIcon, FileUp, GitCompareArrows, PlusCircle, Webhook } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = useAuth();

  return (
    <RoleBasedGuard allowedRoles={['admin', 'researcher']}>
      <SidebarProvider defaultOpen>
        <div className="flex min-h-[calc(100vh-var(--header-height,8rem))]">
          <Sidebar collapsible="icon" className="border-r">
            <SidebarHeader className="p-4 flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2 font-headline text-lg font-semibold text-primary">
                <LayoutDashboard className="h-6 w-6" />
                <span className="group-data-[state=collapsed]:hidden">Panel</span>
              </Link>
            </SidebarHeader>

            <div className="flex-1 overflow-y-auto">
              <SidebarMenu className="p-2">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild variant="ghost" className="justify-start w-full" tooltip="Resumen">
                    <Link href="/dashboard">
                      <LayoutDashboard />
                      <span className="group-data-[state=collapsed]:hidden">Resumen</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild variant="ghost" className="justify-start w-full" tooltip="Generar Consulta">
                    <Link href="/dashboard/compare">
                      <GitCompareArrows />
                      <span className="group-data-[state=collapsed]:hidden">Generar Consulta</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild variant="ghost" className="justify-start w-full" tooltip="Añadir Especie">
                    <Link href="/dashboard/add-species">
                      <PlusCircle />
                      <span className="group-data-[state=collapsed]:hidden">Añadir Especie</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {role === 'admin' && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild variant="ghost" className="justify-start w-full" tooltip="Gestionar Investigadores">
                        <Link href="/dashboard/admin/researchers">
                          <Users />
                          <span className="group-data-[state=collapsed]:hidden">Gestionar Investigadores</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild variant="ghost" className="justify-start w-full" tooltip="Importar especies">
                        <Link href="/dashboard/admin/import">
                          <FileUp />
                          <span className="group-data-[state=collapsed]:hidden">Importar especies</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                      <SidebarMenuButton asChild variant="ghost" className="justify-start w-full" tooltip="Importar por Scrapping">
                        <Link href="/dashboard/admin/scrapper">
                          <Webhook />
                          <span className="group-data-[state=collapsed]:hidden">Importar por Scrapping</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}

                <SidebarMenuItem>
                  <SidebarMenuButton asChild variant="ghost" className="justify-start w-full" tooltip="Sitio Público">
                    <Link href="/">
                      <HomeIcon />
                      <span className="group-data-[state=collapsed]:hidden">Sitio Público</span>
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
