
import SpeciesCard from '@/components/species/SpeciesCard';
import { speciesList } from '@/lib/species';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
// This page will be client-side rendered to allow for search/filter functionality
"use client"; 
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSpecies, setFilteredSpecies] = useState(speciesList);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = speciesList.filter(species =>
      species.name.toLowerCase().includes(lowercasedFilter) ||
      species.scientificName.toLowerCase().includes(lowercasedFilter) ||
      species.description.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredSpecies(filtered);
  }, [searchTerm]);

  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-card rounded-lg shadow-sm">
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">
          Discover the Wonders of Galapagos
        </h1>
        <p className="text-lg text-foreground max-w-2xl mx-auto">
          Explore statistical data and learn about the 10 most representative species of the Galapagos Islands.
        </p>
      </section>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search species by name, scientific name, or description..."
          className="pl-10 w-full text-base py-3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredSpecies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpecies.map((species) => (
            <SpeciesCard key={species.id} species={species} />
          ))}
        </div>
      ) : (
        <p className="text-center text-lg text-muted-foreground py-10">
          No species found matching your search criteria.
        </p>
      )}
    </div>
  );
}
