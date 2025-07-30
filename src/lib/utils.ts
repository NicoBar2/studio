
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
  if (species && species.imageUrl) {
    // Check if the URL is a placeholder from old data and clean it up.
    if (species.imageUrl.includes('placehold.co')) {
        return 'https://placehold.co/600x400.png';
    }
    return species.imageUrl;
  }
  // Fallback if there's no species or no imageUrl.
  return 'https://placehold.co/600x400.png';
};


/**
 * Validates an Ecuadorian ID number (cédula).
 * @param id The 10-digit ID number as a string.
 * @returns True if the ID is valid, false otherwise.
 */
export function validateEcuadorianId(id: string): boolean {
    if (typeof id !== 'string' || id.length !== 10 || !/^\d+$/.test(id)) {
        return false;
    }

    const provinceCode = parseInt(id.substring(0, 2));
    if (provinceCode < 1 || provinceCode > 24) { // 24 provinces
        return false;
    }

    const thirdDigit = parseInt(id[2]);
    if (thirdDigit < 0 || thirdDigit > 5) { // Third digit must be 0-5
        return false;
    }

    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const verifier = parseInt(id[9]);
    let sum = 0;

    for (let i = 0; i < 9; i++) {
        let product = parseInt(id[i]) * coefficients[i];
        if (product >= 10) {
            product -= 9;
        }
        sum += product;
    }

    const calculatedVerifier = (sum % 10 === 0) ? 0 : 10 - (sum % 10);

    return verifier === calculatedVerifier;
}
