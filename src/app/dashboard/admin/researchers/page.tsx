
"use client";
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import ResearcherManagementClient from '@/components/admin/ResearcherManagementClient';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ManageResearchersPage() {
  return (
    <RoleBasedGuard allowedRoles={['admin']}>
      <div className="space-y-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel Principal
          </Link>
        </Button>
        <ResearcherManagementClient />
      </div>
    </RoleBasedGuard>
  );
}
