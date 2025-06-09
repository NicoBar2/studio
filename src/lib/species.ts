
import type { LucideIcon } from 'lucide-react';
import { Turtle, Bird, Fish, Footprints, ShieldQuestion, Shell, Bug, Waves } from 'lucide-react';

export type UserRole = 'admin' | 'researcher' | 'tourist';

export type ConservationStatus = 
  | 'Critically Endangered' 
  | 'Endangered' 
  | 'Vulnerable' 
  | 'Near Threatened' 
  | 'Least Concern'
  | 'Data Deficient';

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
  icon: LucideIcon;
  populationTrend: 'increasing' | 'decreasing' | 'stable' | 'unknown';
  conservationStatus: ConservationStatus;
  habitat: string;
  threats: string[];
  keyStats: SpeciesStat[];
  historicalData: HistoricalDataPoint[];
};

export const speciesList: Species[] = [
  {
    id: 'giant-tortoise',
    name: 'Galapagos Giant Tortoise',
    scientificName: 'Chelonoidis niger',
    description: 'Iconic reptiles known for their long lifespan and large size, playing a crucial role in shaping their environment.',
    longDescription: 'The Galapagos Giant Tortoise comprises 15 distinct subspecies, each adapted to its specific island environment. They are herbivores, feeding on cacti, grasses, leaves, and fruits. Their slow metabolism and ability to store water allow them to survive long periods without food or water. They are a keystone species, influencing vegetation patterns through grazing and seed dispersal.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'giant tortoise Galapagos',
    icon: Turtle,
    populationTrend: 'stable', // Some subspecies increasing, others vulnerable
    conservationStatus: 'Vulnerable',
    habitat: 'Highlands with lush vegetation and coastal lowlands with arid scrub.',
    threats: ['Introduced species (rats, pigs, goats)', 'Habitat loss from agriculture', 'Past exploitation for food and oil', 'Climate change impacting vegetation'],
    keyStats: [
      { label: 'Average Lifespan', value: '100-150', unit: 'years' },
      { label: 'Average Weight', value: '250', unit: 'kg' },
      { label: 'Shell Length', value: 'Up to 1.5', unit: 'm' },
      { label: 'Number of Subspecies', value: 15 }
    ],
    historicalData: [
      { year: 1970, value: 3000, unit: 'individuals (estimated total)' },
      { year: 1990, value: 8000, unit: 'individuals (estimated total)' },
      { year: 2010, value: 15000, unit: 'individuals (estimated total)' },
      { year: 2023, value: 19000, unit: 'individuals (estimated total)' },
    ],
  },
  {
    id: 'marine-iguana',
    name: 'Marine Iguana',
    scientificName: 'Amblyrhynchus cristatus',
    description: 'The world\'s only sea-going lizard, found exclusively in the Galapagos, feeding on marine algae.',
    longDescription: 'Marine Iguanas are unique among modern lizards for their ability to forage in the sea. They have specialized glands to excrete excess salt and flattened tails for swimming. They bask on volcanic rocks to warm up after cold ocean dives. Coloration varies between islands, from black to reddish or greenish.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'marine iguana Galapagos',
    icon: ShieldQuestion, // Kept as specific reptile icons are limited in Lucide.
    populationTrend: 'stable',
    conservationStatus: 'Vulnerable',
    habitat: 'Rocky coastlines, lava shores, and intertidal zones.',
    threats: ['El Niño events (reducing algae)', 'Introduced predators (cats, dogs)', 'Marine pollution', 'Climate change affecting algae growth'],
    keyStats: [
      { label: 'Diving Depth', value: 'Up to 20', unit: 'm' },
      { label: 'Diet', value: 'Marine algae' },
      { label: 'Group Name', value: 'Colony or Mess' },
      { label: 'Unique Feature', value: 'Salt-excreting nasal glands'}
    ],
    historicalData: [
      { year: 1980, value: 250000, unit: 'individuals' },
      { year: 1998, value: 150000, unit: 'individuals (post El Niño)' },
      { year: 2010, value: 200000, unit: 'individuals' },
      { year: 2023, value: 220000, unit: 'individuals' },
    ],
  },
  {
    id: 'darwins-finches',
    name: 'Darwin\'s Finches',
    scientificName: 'Geospizinae subfamily',
    description: 'A group of about 15 closely related bird species, famous for their beak diversity illustrating adaptive radiation.',
    longDescription: 'Darwin\'s Finches are a classic example of evolution by natural selection. Their beak shapes and sizes have adapted to different food sources available on various islands, such as seeds, insects, and nectar. This diversity played a key role in Charles Darwin\'s formulation of his theory of evolution.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'finch bird Galapagos',
    icon: Bird,
    populationTrend: 'stable', // Varies by species
    conservationStatus: 'Least Concern', // Varies by species, some are vulnerable
    habitat: 'Diverse habitats across all islands, from arid lowlands to humid highlands.',
    threats: ['Introduced parasitic fly (Philornis downsi)', 'Habitat degradation', 'Competition with introduced bird species', 'Avian diseases'],
    keyStats: [
      { label: 'Number of Species', value: '~15' },
      { label: 'Primary Adaptation', value: 'Beak shape and size' },
      { label: 'Studied By', value: 'Charles Darwin' },
      { label: 'Common Ancestor', value: 'Single species from mainland'}
    ],
    historicalData: [ // Example data for a common finch species population index
      { year: 1977, value: 100, unit: 'population index' },
      { year: 1987, value: 120, unit: 'population index' },
      { year: 2000, value: 90, unit: 'population index' },
      { year: 2020, value: 110, unit: 'population index' },
    ],
  },
  {
    id: 'blue-footed-booby',
    name: 'Blue-footed Booby',
    scientificName: 'Sula nebouxii',
    description: 'A marine bird known for its distinctive bright blue feet, used in elaborate mating rituals.',
    longDescription: 'The Blue-footed Booby is a comical and charismatic seabird. Their blue feet are a result of carotenoid pigments from their diet. Males display their feet in a high-stepping courtship dance. They are plunge divers, feeding on small fish like sardines and anchovies.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'blue footed booby Galapagos',
    icon: Footprints, 
    populationTrend: 'decreasing',
    conservationStatus: 'Least Concern', // Globally, but Galapagos population has declined
    habitat: 'Tropical and subtropical Pacific coasts; nests on rocky shores and cliffs.',
    threats: ['Decline in sardine populations (key food source)', 'Disturbance at nesting sites', 'Climate change affecting fish stocks'],
    keyStats: [
      { label: 'Foot Color Origin', value: 'Dietary carotenoids' },
      { label: 'Wingspan', value: '~1.5', unit: 'm' },
      { label: 'Nesting Habit', value: 'Ground nester' },
      { label: 'Clutch Size', value: '1-3 eggs'}
    ],
    historicalData: [
      { year: 1960, value: 20000, unit: 'breeding pairs (Galapagos)' },
      { year: 1990, value: 15000, unit: 'breeding pairs (Galapagos)' },
      { year: 2012, value: 6500, unit: 'breeding pairs (Galapagos)' },
      { year: 2023, value: 6000, unit: 'breeding pairs (Galapagos)' },
    ],
  },
  {
    id: 'galapagos-penguin',
    name: 'Galapagos Penguin',
    scientificName: 'Spheniscus mendiculus',
    description: 'The only penguin species found north of the equator, uniquely adapted to the warm Galapagos climate.',
    longDescription: 'Galapagos Penguins are one of the smallest penguin species. They survive in the equatorial heat thanks to the cool waters of the Humboldt and Cromwell currents. They nest in volcanic crevices and caves to escape the sun. Their small population is highly susceptible to climate fluctuations.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'Galapagos penguin',
    icon: Bird, // Changed from VenetianMask to Bird
    populationTrend: 'stable', // Fluctuates, recovering from lows
    conservationStatus: 'Endangered',
    habitat: 'Coastal areas, particularly on Fernandina and Isabela islands.',
    threats: ['El Niño events (reducing food supply)', 'Predation by introduced species', 'Fisheries bycatch', 'Climate change warming sea temperatures'],
    keyStats: [
      { label: 'Height', value: '~49', unit: 'cm' },
      { label: 'Weight', value: '~2.5', unit: 'kg' },
      { label: 'Unique Trait', value: 'Northernmost penguin' },
      { label: 'Diet', value: 'Small fish, crustaceans'}
    ],
    historicalData: [
      { year: 1971, value: 3400, unit: 'individuals' },
      { year: 1983, value: 500, unit: 'individuals (post El Niño)' },
      { year: 2004, value: 1000, unit: 'individuals' },
      { year: 2023, value: 2000, unit: 'individuals' },
    ],
  },
  {
    id: 'flightless-cormorant',
    name: 'Flightless Cormorant',
    scientificName: 'Phalacrocorax harrisi',
    description: 'A unique cormorant species that has lost the ability to fly, endemic to the Galapagos Islands.',
    longDescription: 'The Flightless Cormorant is the largest cormorant species and the only one that cannot fly. Its wings are small and stubby. It is an excellent swimmer and diver, using its powerful legs to propel itself underwater to hunt fish and octopus near the seabed.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'flightless cormorant Galapagos',
    icon: Bird,
    populationTrend: 'stable',
    conservationStatus: 'Vulnerable',
    habitat: 'Rocky shores of Fernandina and Isabela islands.',
    threats: ['Limited range makes them vulnerable', 'Introduced predators', 'El Niño events affecting food availability', 'Human disturbance'],
    keyStats: [
      { label: 'Wingspan', value: 'Too small to fly' },
      { label: 'Diving Ability', value: 'Excellent' },
      { label: 'Endemic To', value: 'Fernandina & Isabela Islands' },
      { label: 'Weight', value: '~4', unit: 'kg'}
    ],
    historicalData: [
      { year: 1977, value: 800, unit: 'breeding pairs' },
      { year: 2000, value: 900, unit: 'breeding pairs' },
      { year: 2013, value: 1200, unit: 'breeding pairs' },
      { year: 2023, value: 1000, unit: 'breeding pairs' },
    ],
  },
  {
    id: 'waved-albatross',
    name: 'Waved Albatross',
    scientificName: 'Phoebastria irrorata',
    description: 'A large seabird that breeds almost exclusively on Española Island in the Galapagos, known for its elaborate courtship dances.',
    longDescription: 'The Waved Albatross is a critically endangered species. They are magnificent fliers, spending most of their lives at sea. They return to Española Island to breed, engaging in complex mating rituals that include bill-circling and sky-pointing. They lay a single egg per breeding season.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'waved albatross Galapagos',
    icon: Bird,
    populationTrend: 'decreasing',
    conservationStatus: 'Critically Endangered',
    habitat: 'Breeds on Española Island; forages in the eastern Pacific Ocean.',
    threats: ['Longline fishing bycatch', 'Plastic ingestion', 'Limited breeding range', 'Introduced predators on breeding grounds (historically)'],
    keyStats: [
      { label: 'Wingspan', value: 'Up to 2.5', unit: 'm' },
      { label: 'Breeding Site', value: 'Primarily Española Island' },
      { label: 'Lifespan', value: 'Up to 40-50', unit: 'years' },
      { label: 'Flight Style', value: 'Dynamic soaring'}
    ],
    historicalData: [
      { year: 1970, value: 30000, unit: 'breeding pairs' },
      { year: 1994, value: 18000, unit: 'breeding pairs' },
      { year: 2007, value: 12000, unit: 'breeding pairs' },
      { year: 2023, value: 10000, unit: 'breeding pairs (estimate)' },
    ],
  },
  {
    id: 'galapagos-sea-lion',
    name: 'Galapagos Sea Lion',
    scientificName: 'Zalophus wollebaeki',
    description: 'An endemic species of sea lion that breeds in the Galapagos, often seen playing in the surf or lounging on beaches.',
    longDescription: 'Galapagos Sea Lions are playful and curious marine mammals. They are smaller than their Californian relatives. Males establish and defend territories during the breeding season. They feed on fish and squid, and are preyed upon by sharks and orcas.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'Galapagos sea lion',
    icon: Waves, // Changed from Footprints to Waves
    populationTrend: 'decreasing',
    conservationStatus: 'Endangered',
    habitat: 'Sandy beaches and rocky coastlines throughout the archipelago.',
    threats: ['El Niño events (reducing food, increasing pup mortality)', 'Disease outbreaks', 'Entanglement in fishing gear', 'Human disturbance'],
    keyStats: [
      { label: 'Male Weight', value: 'Up to 250', unit: 'kg' },
      { label: 'Female Weight', value: 'Up to 100', unit: 'kg' },
      { label: 'Social Structure', value: 'Harem-based breeding' },
      { label: 'Diving Depth', value: 'Up to 200', unit: 'm'}
    ],
    historicalData: [
      { year: 1978, value: 40000, unit: 'individuals' },
      { year: 2001, value: 20000, unit: 'individuals' },
      { year: 2015, value: 16000, unit: 'individuals' },
      { year: 2023, value: 14000, unit: 'individuals (estimate)' },
    ],
  },
  {
    id: 'galapagos-fur-seal',
    name: 'Galapagos Fur Seal',
    scientificName: 'Arctocephalus galapagoensis',
    description: 'The smallest of all eared seals, also endemic to the Galapagos, with a thicker fur coat than sea lions.',
    longDescription: 'Galapagos Fur Seals have a dense underfur, providing insulation. They prefer rocky, shaded coastlines and spend more time on land than sea lions. They are nocturnal hunters, feeding on fish and cephalopods further offshore.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'Galapagos fur seal',
    icon: Waves, // Changed from Footprints to Waves
    populationTrend: 'stable', // Recovered from near extinction
    conservationStatus: 'Endangered',
    habitat: 'Shady, rocky coastlines with boulders and caves.',
    threats: ['Past hunting for fur', 'El Niño events', 'Sensitivity to sea temperature changes', 'Entanglement'],
    keyStats: [
      { label: 'Unique Trait', value: 'Smallest eared seal' },
      { label: 'Fur', value: 'Dense underfur' },
      { label: 'Hunting Time', value: 'Primarily nocturnal' },
      { label: 'Weight', value: '~65', unit: 'kg (male)'}
    ],
    historicalData: [ // Population fluctuates significantly
      { year: 1970, value: 5000, unit: 'individuals' },
      { year: 1990, value: 30000, unit: 'individuals' },
      { year: 2000, value: 15000, unit: 'individuals' },
      { year: 2023, value: 25000, unit: 'individuals (estimate)' },
    ],
  },
  {
    id: 'lava-lizard',
    name: 'Lava Lizard',
    scientificName: 'Microlophus spp.',
    description: 'Small, agile lizards found across the Galapagos, with various species adapted to different islands.',
    longDescription: 'Lava Lizards are common reptiles in the Galapagos. There are several species, each often endemic to specific islands or groups of islands. Males are typically larger and more brightly colored than females. They feed on insects, spiders, and other small invertebrates.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'lava lizard Galapagos',
    icon: Bug, // Changed from Shell to Bug
    populationTrend: 'stable',
    conservationStatus: 'Least Concern', // Most species
    habitat: 'Arid and coastal zones, lava fields, and dry scrubland.',
    threats: ['Introduced predators (cats, rats)', 'Habitat alteration in some areas'],
    keyStats: [
      { label: 'Number of Species', value: '~7-9 (Galapagos)' },
      { label: 'Behavior', value: 'Territorial, push-up displays' },
      { label: 'Diet', value: 'Insects, spiders, scorpions' },
      { label: 'Size', value: '15-30', unit: 'cm (total length)'}
    ],
    historicalData: [ // Data not typically tracked this way for lava lizards; illustrative
      { year: 2000, value: 500000, unit: 'total individuals (estimate)' },
      { year: 2010, value: 520000, unit: 'total individuals (estimate)' },
      { year: 2020, value: 510000, unit: 'total individuals (estimate)' },
      { year: 2023, value: 515000, unit: 'total individuals (estimate)' },
    ],
  },
];

export const getSpeciesById = (id: string): Species | undefined => {
  return speciesList.find(s => s.id === id);
};

export const updateSpeciesData = (id: string, updatedData: Partial<Species>): boolean => {
  const speciesIndex = speciesList.findIndex(s => s.id === id);
  if (speciesIndex === -1) return false;
  
  // In a real app, this would be an API call. Here we mutate the mock data.
  speciesList[speciesIndex] = { ...speciesList[speciesIndex], ...updatedData };
  return true;
};
