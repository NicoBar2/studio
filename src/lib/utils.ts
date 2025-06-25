
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Species } from "./types";

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
  // If an imageUrl is provided (either a data URI or a normal URL), use it.
  if (species && species.imageUrl) {
    return species.imageUrl;
  }
  // If no imageUrl is provided, but we have a name, generate a placeholder.
  if (species && species.spanishCommonName) {
     return `https://placehold.co/600x400.png?text=${encodeURIComponent(species.spanishCommonName)}`;
  }
  // Fallback if there's no species or no name.
  return 'https://placehold.co/600x400.png';
};
