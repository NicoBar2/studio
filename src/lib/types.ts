

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
  values?: Record<string, number>; // e.g. { is_isabela: 100, is_santa_cruz: 50 }
};

// Expanded Species type based on detailed column list
export type Species = {
  id: string;
  taxonID?: string;
  
  // Names
  englishCommonName?: string;
  spanishCommonName: string;
  localName?: string;
  ScientificName?: string; // From Darwin data
  CommonNameEnglish?: string; // From Darwin data

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
  is_espanola?: boolean;
  is_fernandina?: boolean;
  is_floreana?: boolean;
  is_genovesa?: boolean;
  is_isabela?: boolean;
  is_marchena?: boolean;
  is_pinta?: boolean;
  is_pinzon?: boolean;
  is_san_cristobal?: boolean;
  is_santa_cruz?: boolean;
  is_santa_fe?: boolean;
  is_santiago?: boolean;
  is_north_seymour?: boolean;
  is_wolf?: boolean;
  is_unknown_island?: boolean;
  
  // Distribution - Bioregions
  is_elizabeth_bay?: boolean;
  is_far_northern?: boolean;
  is_northern?: boolean;
  is_south_eastern?: boolean;
  is_unknown_bioregion?: boolean;
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
  createdAt?: string;
};

export type Researcher = {
    id: string;
    name: string;
    email: string;
    orcid: string;
    idNumber?: string;
    institution?: string;
    specialization?: string;
    isVerified: boolean;
    password?: string; // Can be a hashed password
    profileImageUrl?: string;
};
