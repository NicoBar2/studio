
"use client";

import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/species';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users } from 'lucide-react';

export default function LoginSimulator() {
  const { role, setRole } = useAuth();

  const handleRoleChange = (newRole: string) => {
    setRole(newRole as UserRole);
  };

  return (
    <div className="flex items-center gap-2">
      <Users className="h-5 w-5 text-primary" />
      <Label htmlFor="role-simulator" className="text-sm font-medium text-foreground sr-only md:not-sr-only">
        Simulate Role:
      </Label>
      <Select value={role || 'tourist'} onValueChange={handleRoleChange}>
        <SelectTrigger id="role-simulator" className="w-[150px] bg-background text-foreground border-primary focus:ring-primary">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tourist">Tourist</SelectItem>
          <SelectItem value="researcher">Researcher</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
