import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Species } from "./species";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const GALAPAGOS_ISLANDS_NAMES: string[] = [
    'Isabela', 'Santa Cruz', 'San Cristobal', 'Fernandina',
    'Española', 'Floreana', 'Santiago', 'Genovesa',
    'Pinta', 'Marchena', 'North Seymour'
];

export const getSpeciesImageUrl = (species: Species | undefined | null): string => {
  if (species && species.imageUrl) {
    return species.imageUrl;
  }
  // Return a default placeholder if no image or species
  return 'https://placehold.co/600x400.png';
};
