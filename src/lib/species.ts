
import { promises as fs } from 'fs';
import path from 'path';
import type { Species, ConservationStatus, HistoricalDataPoint, SpeciesStat } from './types';


// Path to the JSON file database
const speciesDbPath = path.join(process.cwd(), 'src', 'lib', 'data', 'species.json');

// Helper function to read species data from the file
async function readSpecies(): Promise<Species[]> {
  try {
    const data = await fs.readFile(speciesDbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading species data:", error);
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


export const getSpeciesList = async (): Promise<Species[]> => {
    return await readSpecies();
}

export const getSpeciesById = async (id: string): Promise<Species | undefined> => {
  const speciesList = await readSpecies();
  return speciesList.find(s => s.id === id);
};

export const updateSpeciesData = async (id: string, updatedData: Partial<Species>): Promise<boolean> => {
  const speciesList = await readSpecies();
  const speciesIndex = speciesList.findIndex(s => s.id === id);
  if (speciesIndex === -1) return false;

  const updatedSpecies = {
    ...speciesList[speciesIndex],
    ...updatedData,
  };

  speciesList[speciesIndex] = updatedSpecies;

  await writeSpecies(speciesList);
  return true;
};

export const addSpecies = async (newSpeciesData: Partial<Species>): Promise<Species> => {
    const speciesList = await readSpecies();
    
    if (!newSpeciesData.spanishCommonName) {
        throw new Error("El nombre común en español es requerido para crear una nueva especie.");
    }

    const newId = newSpeciesData.spanishCommonName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    if (speciesList.some(s => s.id === newId)) {
        throw new Error(`Ya existe una especie con el id: ${newId}`);
    }

    // Setting default values for the extensive new model
    const speciesToAdd: Species = {
        id: newId,
        spanishCommonName: newSpeciesData.spanishCommonName,
        genus: newSpeciesData.genus || '',
        specificEpithet: newSpeciesData.specificEpithet || '',
        iucnStatus: newSpeciesData.iucnStatus || 'Datos Insuficientes',
        populationTrend: newSpeciesData.populationTrend || 'unknown',
        spanishDescription: newSpeciesData.spanishDescription || `Descripción para ${newSpeciesData.spanishCommonName}.`,
        habitat: newSpeciesData.habitat || '',
        threats: newSpeciesData.threats || [],
        
        // Defaulting other fields
        imageUrl: newSpeciesData.imageUrl || 'https://placehold.co/600x400.png',
        dataAiHint: newSpeciesData.dataAiHint || newSpeciesData.spanishCommonName.split(' ').slice(0, 2).join(' ').toLowerCase(),
        icon: newSpeciesData.icon || 'Footprints',
        keyStats: newSpeciesData.keyStats || [],
        historicalData: newSpeciesData.historicalData || [],
        showHistoricalDataToPublic: newSpeciesData.showHistoricalDataToPublic || false,

        // Initialize all boolean distribution flags to false
        is_darwin: false, is_española: false, is_fernandina: false, is_floreana: false,
        is_genovesa: false, is_isabela: false, is_marchena: false, is_pinta: false,
        is_pinzón: false, is_sanCristóbal: false, is_santaCruz: false, is_santaFé: false,
        is_santiago: false, is_unknownIsland: false, is_wolf: false, is_elizabethBay: false,
        is_farNorthern: false, is_northern: false, is_southEastern: false, is_unknownBioregion: false,
        is_western: false,

        // Spread the rest of the provided data
        ...newSpeciesData,
    };

    speciesList.push(speciesToAdd);
    await writeSpecies(speciesList);
    return speciesToAdd;
}
