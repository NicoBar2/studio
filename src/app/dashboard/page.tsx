
"use client";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { speciesList } from '@/lib/species';
import { Edit3, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const { role } = useAuth();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-headline font-bold text-primary mb-2">
          Welcome, {role === 'admin' ? 'Administrator' : 'Researcher'}!
        </h1>
        <p className="text-lg text-foreground">
          Manage and analyze Galapagos species data.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              View and edit statistical data for each species.
              {role === 'admin' && " As an admin, you have full control over species data."}
              {role === 'researcher' && " As a researcher, you can update and contribute to the data."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Select a species below to edit its information.</p>
            {/* List species with edit links */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Visualization</CardTitle>
            <CardDescription>
              Access interactive charts and graphs for in-depth analysis.
              {role === 'researcher' && " Use these tools to explore trends and patterns."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Select a species below to visualize its data.</p>
            {/* List species with visualize links */}
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Species Overview</h2>
        <div className="space-y-4">
          {speciesList.map(species => (
            <Card key={species.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {species.name}
                  <species.icon className="h-6 w-6 text-muted-foreground" />
                </CardTitle>
                <CardDescription>{species.scientificName}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/edit/${species.id}`}>
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Data
                  </Link>
                </Button>
                {role === 'researcher' && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/visualize/${species.id}`}>
                      <BarChart3 className="mr-2 h-4 w-4" /> View Visualizations
                    </Link>
                  </Button>
                )}
                 <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/90">
                  <Link href={`/species/${species.id}`}>
                    View Public Page
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
