

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

/**
 * Validates a 9-character passport number using the MRZ check digit algorithm.
 * @param passportNumber The 9-character passport number (e.g., L898902C<).
 * @returns True if the passport number is valid, false otherwise.
 */
export function validatePassportNumber(passportNumber: string): boolean {
    if (passportNumber.length !== 9) return false;

    const weights = [7, 3, 1];
    const characterValues: { [key: string]: number } = {
        '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
        '<': 0, 'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17,
        'I': 18, 'J': 19, 'K': 20, 'L': 21, 'M': 22, 'N': 23, 'O': 24, 'P': 25, 'Q': 26,
        'R': 27, 'S': 28, 'T': 29, 'U': 30, 'V': 31, 'W': 32, 'X': 33, 'Y': 34, 'Z': 35,
    };
    
    let checkSum = 0;
    const passportData = passportNumber.substring(0, 8);
    const checkDigitChar = passportNumber[8];
    
    // The check digit itself must be a number for this algorithm variant
    if (!/^\d$/.test(checkDigitChar)) return false;
    const checkDigit = parseInt(checkDigitChar, 10);
    
    for (let i = 0; i < 8; i++) {
        const char = passportData[i].toUpperCase();
        if (characterValues[char] === undefined) return false;
        checkSum += characterValues[char] * weights[i % 3];
    }

    return checkSum % 10 === checkDigit;
}


/**
 * Validates an ORCID iD using the ISO 7064 Mod 11-2 checksum algorithm.
 * @param orcid The ORCID iD, with or without hyphens.
 * @returns True if the ORCID iD is valid, false otherwise.
 */
export function validateOrcid(orcid: string): boolean {
  // Remove hyphens and check general format
  const clean = orcid.replace(/-/g, '');
  if (!/^\d{15}[\dX]$/.test(clean)) return false;

  // Calculate checksum (ISO 7064 Mod 11-2)
  let total = 0;
  for (let i = 0; i < 15; i++) {
    total = (total + parseInt(clean[i], 10)) * 2;
  }
  const remainder = total % 11;
  const result = (12 - remainder) % 11;
  const checkDigit = result === 10 ? 'X' : result.toString();

  // Compare with the last digit
  return clean[15] === checkDigit;
}
