
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
 * Validates an Ecuadorian ID number (cédula) using the provided algorithm.
 * @param cedula The 10-digit ID number as a string.
 * @returns True if the ID is valid, false otherwise.
 */
export function validateEcuadorianId(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false;

  const provincia = parseInt(cedula.substring(0, 2));
  if (provincia < 1 || provincia > 24) return false;

  const digitoVerificador = parseInt(cedula[9]);
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let num = parseInt(cedula[i]);
    if (i % 2 === 0) {
      num *= 2;
      if (num > 9) num -= 9;
    }
    suma += num;
  }

  const resultado = (10 - (suma % 10)) % 10;

  return resultado === digitoVerificador;
}
