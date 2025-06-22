
import { promises as fs } from 'fs';
import path from 'path';

export type UserRole = 'admin' | 'researcher' | 'tourist';

export type ConservationStatus =
  | 'En Peligro Crítico'
  | 'En Peligro'
  | 'Vulnerable'
  | 'Casi Amenazada'
  | 'Preocupación Menor'
  | 'Datos Insuficientes';

export type SpeciesStat = {
  label: string;
  value: string | number;
  unit?: string;
};

export type HistoricalDataPoint = {
  year: number;
  value: number;
  unit: string
};

export type Species = {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  dataAiHint: string;
  icon: string;
  populationTrend: 'increasing' | 'decreasing' | 'stable' | 'unknown';
  conservationStatus: ConservationStatus;
  habitat: string;
  threats: string[];
  keyStats: SpeciesStat[];
  historicalData: HistoricalDataPoint[];
  islands: string[];
};


// Path to the JSON file database
const speciesDbPath = path.join(process.cwd(), 'src', 'lib', 'data', 'species.json');

// Helper function to read species data from the file
async function readSpecies(): Promise<Species[]> {
  try {
    const data = await fs.readFile(speciesDbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading species data:", error);
    // In a real app, you might want to handle this more gracefully,
    // but for the prototype, we assume the file exists.
    return [];
  }
}

// Helper function to write species data to the file
async function writeSpecies(data: Species[]): Promise<void> {
  try {
    await fs.writeFile(speciesDbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing species data:", error);
  }
}


export const GALAPAGOS_ISLANDS_NAMES: string[] = [
    'Isabela', 'Santa Cruz', 'San Cristobal', 'Fernandina',
    'Española', 'Floreana', 'Santiago', 'Genovesa',
    'Pinta', 'Marchena', 'North Seymour'
];

export const getSpeciesList = async (): Promise<Species[]> => {
    return await readSpecies();
}

export const getSpeciesById = async (id: string): Promise<Species | undefined> => {
  const speciesList = await readSpecies();
  return speciesList.find(s => s.id === id);
};

export const getSpeciesImageUrl = (species: Species | undefined | null): string => {
  if (species && species.imageUrl) {
    return species.imageUrl;
  }
  // Return a default placeholder if no image or species
  return 'https://placehold.co/600x400.png';
};

export const updateSpeciesData = async (id: string, updatedData: Partial<Species>): Promise<boolean> => {
  const speciesList = await readSpecies();
  const speciesIndex = speciesList.findIndex(s => s.id === id);
  if (speciesIndex === -1) return false;

  // Create a new object for the updated species
  const updatedSpecies = {
    ...speciesList[speciesIndex],
    ...updatedData,
  };

  // Replace the old species object with the updated one
  speciesList[speciesIndex] = updatedSpecies;

  await writeSpecies(speciesList);
  return true;
};
