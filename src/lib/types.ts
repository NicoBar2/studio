
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
  unit: string;
  description?: string;
};

// Expanded Species type based on detailed column list
export type Species = {
  id: string;
  taxonID?: string;
  
  // Names
  englishCommonName?: string;
  spanishCommonName: string;
  localName?: string;

  // Taxonomy
  domain?: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  suborder?: string;
  superfamily?: string;
  family?: string;
  subfamily?: string;
  tribe?: string;
  genus?: string;
  specificEpithet?: string;
  infraspecificEpithet?: string;
  author?: string;

  // Status
  origin?: string;
  suborigin?: string;
  iucnStatus: ConservationStatus;
  taxonStatus?: string;
  populationTrend: 'increasing' | 'decreasing' | 'stable' | 'unknown';

  // Distribution - Islands (using boolean flags for easier management in forms)
  is_darwin?: boolean;
  is_española?: boolean;
  is_fernandina?: boolean;
  is_floreana?: boolean;
  is_genovesa?: boolean;
  is_isabela?: boolean;
  is_marchena?: boolean;
  is_pinta?: boolean;
  is_pinzón?: boolean;
  is_sanCristóbal?: boolean;
  is_santaCruz?: boolean;
  is_santaFé?: boolean;
  is_santiago?: boolean;
  is_unknownIsland?: boolean;
  is_wolf?: boolean;
  
  // Distribution - Bioregions
  is_elizabethBay?: boolean;
  is_farNorthern?: boolean;
  is_northern?: boolean;
  is_southEastern?: boolean;
  is_unknownBioregion?: boolean;
  is_western?: boolean;
  
  // Comments & Descriptions
  taxonomicComments?: string;
  distributionComments?: string;
  spanishDistributionComments?: string;
  englishComments?: string;
  spanishComments?: string;
  englishDescription?: string;
  spanishDescription: string;
  
  // Legacy fields to keep for now, they can be refactored into more structured data later
  imageUrl: string;
  dataAiHint: string;
  icon: string;
  keyStats: SpeciesStat[];
  historicalData: HistoricalDataPoint[];
  threats: string[];
  habitat: string; 
  showHistoricalDataToPublic?: boolean;
};

export type Researcher = {
    id: string;
    name: string;
    email: string;
    institution?: string;
    specialization?: string;
    isVerified: boolean;
    password?: string; // Can be a hashed password
};
