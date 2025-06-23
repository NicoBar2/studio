
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Species } from "./species";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const GALAPAGOS_ISLANDS_NAMES: string[] = [
  "Darwin",
  "Española",
  "Fernandina",
  "Floreana",
  "Genovesa",
  "Isabela",
  "Marchena",
  "Pinta",
  "Pinzón",
  "San Cristóbal",
  "Santa Cruz",
  "Santa Fé",
  "Santiago",
  "North Seymour",
  "Wolf"
];


export const getSpeciesImageUrl = (species: Species | undefined | null): string => {
  if (species && species.imageUrl && !species.imageUrl.startsWith('data:image')) {
     return `https://placehold.co/600x400.png?text=${encodeURIComponent(species.spanishCommonName)}`;
  }
  if (species && species.imageUrl) {
    return species.imageUrl;
  }
  return 'https://placehold.co/600x400.png';
};
