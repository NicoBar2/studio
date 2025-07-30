

"use server";

import { revalidatePath } from 'next/cache';
import * as xlsx from 'xlsx';
import { promises as fs } from 'fs';
import path from 'path';
import type { Species, HistoricalDataPoint, SpeciesStat, ConservationStatus, UserRole, Researcher } from '@/lib/types';
import { getComparisonAnalysis, type CompareSpeciesInput } from '@/ai/flows/compareSpeciesFlow';
import { generatePdfFlow, type GeneratePdfInput } from '@/ai/flows/generatePdfFlow';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import fetch from 'node-fetch';
import { Resend } from 'resend';
import admin from 'firebase-admin';
import axios from 'axios';
import FormData from 'form-data';
import { validateEcuadorianId, validatePassportNumber, validateOrcid } from '@/lib/utils';


// --- Data Access Functions (moved from /lib) ---

const speciesDbPath = path.join(process.cwd(), 'src', 'lib', 'data', 'species.json');
const researchersDbPath = path.join(process.cwd(), 'src', 'lib', 'data', 'researchers.json');


if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.log('Firebase admin initialization error', error);
  }
}

const db = admin.firestore();


async function readJsonFile<T>(filePath: string): Promise<T[]> {
    try {
        await fs.access(filePath);
        const data = await fs.readFile(filePath, 'utf-8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            await writeJsonFile(filePath, []);
            return [];
        }
        console.error(`Failed to read from ${filePath}:`, error);
        throw error; // Rethrow other errors
    }
}

async function writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Failed to write to ${filePath}:`, error);
        throw error;
    }
}

// -- Species Data Functions --

async function getSpeciesList(): Promise<Species[]> {
    return await readJsonFile<Species>(speciesDbPath);
}

async function getSpeciesById(id: string): Promise<Species | undefined> {
  const speciesList = await getSpeciesList();
  return speciesList.find(s => s.id === id);
};

async function updateSpeciesData(id: string, updatedData: Partial<Species>): Promise<boolean> {
  const speciesList = await getSpeciesList();
  const speciesIndex = speciesList.findIndex(s => s.id === id);
  if (speciesIndex === -1) return false;

  speciesList[speciesIndex] = { ...speciesList[speciesIndex], ...updatedData };
  await writeJsonFile(speciesDbPath, speciesList);
  return true;
};

async function addSpecies(newSpeciesData: Partial<Species>): Promise<Species> {
    const speciesList = await getSpeciesList();
    
    if (!newSpeciesData.spanishCommonName || newSpeciesData.spanishCommonName.trim().length < 3) {
        throw new Error("El nombre común en español es requerido y debe tener al menos 3 caracteres.");
    }

    const newId = newSpeciesData.id || newSpeciesData.spanishCommonName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    if (!newId) {
        throw new Error("El nombre de la especie no es válido para generar un ID.");
    }

    if (speciesList.some(s => s.id === newId)) {
        throw new Error(`La especie "${newSpeciesData.spanishCommonName}" ya existe en la base de datos.`);
    }

    const speciesToAdd: Species = {
        ...newSpeciesData,
        id: newId,
        spanishCommonName: newSpeciesData.spanishCommonName,
        genus: newSpeciesData.genus || '',
        specificEpithet: newSpeciesData.specificEpithet || '',
        iucnStatus: newSpeciesData.iucnStatus || 'Datos Insuficientes',
        populationTrend: newSpeciesData.populationTrend || 'unknown',
        spanishDescription: newSpeciesData.spanishDescription || `Descripción para ${newSpeciesData.spanishCommonName}.`,
        habitat: newSpeciesData.habitat || '',
        threats: newSpeciesData.threats || [],
        imageUrl: newSpeciesData.imageUrl || 'https://placehold.co/600x400.png',
        dataAiHint: newSpeciesData.dataAiHint || newSpeciesData.spanishCommonName.split(' ').slice(0, 2).join(' ').toLowerCase(),
        icon: newSpeciesData.icon || 'Footprints',
        keyStats: newSpeciesData.keyStats || [],
        historicalData: newSpeciesData.historicalData || [],
        showHistoricalDataToPublic: newSpeciesData.showHistoricalDataToPublic ?? false,
        createdAt: new Date().toISOString(),
        is_darwin: newSpeciesData.is_darwin ?? false,
        is_espanola: newSpeciesData.is_espanola ?? false,
        is_fernandina: newSpeciesData.is_fernandina ?? false,
        is_floreana: newSpeciesData.is_floreana ?? false,
        is_genovesa: newSpeciesData.is_genovesa ?? false,
        is_isabela: newSpeciesData.is_isabela ?? false,
        is_marchena: newSpeciesData.is_marchena ?? false,
        is_pinta: newSpeciesData.is_pinta ?? false,
        is_pinzon: newSpeciesData.is_pinzon ?? false,
        is_san_cristobal: newSpeciesData.is_san_cristobal ?? false,
        is_santa_cruz: newSpeciesData.is_santa_cruz ?? false,
        is_santa_fe: newSpeciesData.is_santa_fe ?? false,
        is_santiago: newSpeciesData.is_santiago ?? false,
        is_north_seymour: newSpeciesData.is_north_seymour ?? false,
        is_wolf: newSpeciesData.is_wolf ?? false,
        is_unknown_island: newSpeciesData.is_unknown_island ?? false,
        is_elizabeth_bay: newSpeciesData.is_elizabeth_bay ?? false,
        is_far_northern: newSpeciesData.is_far_northern ?? false,
        is_northern: newSpeciesData.is_northern ?? false,
        is_south_eastern: newSpeciesData.is_south_eastern ?? false,
        is_unknown_bioregion: newSpeciesData.is_unknown_bioregion ?? false,
        is_western: newSpeciesData.is_western ?? false,
    };

    speciesList.push(speciesToAdd);
    await writeJsonFile(speciesDbPath, speciesList);
    return speciesToAdd;
}

async function deleteSpeciesById(id: string): Promise<boolean> {
  let speciesList = await getSpeciesList();
  const initialLength = speciesList.length;
  speciesList = speciesList.filter(s => s.id !== id);
  if (speciesList.length < initialLength) {
    await writeJsonFile(speciesDbPath, speciesList);
    return true;
  }
  return false;
};

// -- Researcher Data Functions --
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

async function addResearcher(name: string, email: string, orcid: string, idNumber: string, institution?: string, specialization?: string): Promise<Researcher> {
  const newResearcher: Researcher = {
    id: generateId(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    orcid: orcid,
    idNumber: idNumber,
    institution: institution?.trim() || undefined,
    specialization: specialization?.trim() || undefined,
    isVerified: false,
    profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=random`,
  };
  
  const researchers = await readJsonFile<Researcher>(researchersDbPath);
  researchers.push(newResearcher);
  await writeJsonFile(researchersDbPath, researchers);
  return newResearcher;
}

async function getAllResearchers(): Promise<Researcher[]> {
  const researchers = await readJsonFile<Researcher>(researchersDbPath);
  return [...researchers].sort((a, b) => a.name.localeCompare(b.name));
}

async function getResearcherById(id: string): Promise<Researcher | undefined> {
  const researchers = await readJsonFile<Researcher>(researchersDbPath);
  return researchers.find(researcher => researcher.id === id);
}

async function getResearcherByEmail(email: string): Promise<Researcher | undefined> {
  const researchers = await readJsonFile<Researcher>(researchersDbPath);
  return researchers.find(researcher => researcher.email === email.toLowerCase());
}

async function updateResearcher(id: string, updates: Partial<Omit<Researcher, 'id' | 'password'>>): Promise<Researcher | null> {
  const researchers = await readJsonFile<Researcher>(researchersDbPath);
  const index = researchers.findIndex(r => r.id === id);
  if (index === -1) {
    return null;
  }
  
  const currentResearcher = researchers[index];
  if (updates.email && updates.email !== currentResearcher.email) {
    const newEmail = updates.email.toLowerCase();
    if (researchers.some(r => r.email === newEmail && r.id !== id)) {
      throw new Error("Otro investigador ya usa este correo electrónico.");
    }
    updates.email = newEmail;
  }

  researchers[index] = { ...currentResearcher, ...updates };
  await writeJsonFile(researchersDbPath, researchers);
  return researchers[index];
}

async function setResearcherPassword(email: string, passwordToSet: string): Promise<Researcher | null> {
  const researchers = await readJsonFile<Researcher>(researchersDbPath);
  const researcherEmail = email.toLowerCase();
  const index = researchers.findIndex(r => r.email === researcherEmail);
  if (index === -1) {
    return null; 
  }
  
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(passwordToSet, saltRounds);
  researchers[index].password = hashedPassword;
  
  await writeJsonFile(researchersDbPath, researchers);
  return researchers[index];
}

async function deleteResearcherById(id: string): Promise<boolean> {
  let researchers = await readJsonFile<Researcher>(researchersDbPath);
  const initialLength = researchers.length;
  researchers = researchers.filter(researcher => researcher.id !== id);
  if (researchers.length < initialLength) {
    await writeJsonFile(researchersDbPath, researchers);
    return true;
  }
  return false;
}

// --- Server Actions ---

async function handleImageUpload(imageDataUri: string, currentImageUrl: string): Promise<string> {
    if (!imageDataUri || !imageDataUri.startsWith('data:image')) {
        return currentImageUrl; // No new image was selected, return the existing URL
    }
    if (!process.env.IMGBB_API_KEY) {
        console.warn('IMGBB_API_KEY not set. Returning placeholder.');
        return 'https://placehold.co/600x400.png';
    }

    try {
        const base64Data = imageDataUri.split(',')[1];
        const formData = new FormData();
        formData.append('image', base64Data);

        const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            formData,
            { headers: formData.getHeaders() }
        );

        if (response.data.success) {
            return response.data.data.url;
        } else {
            console.error('ImgBB upload failed:', response.data);
            return 'https://placehold.co/600x400.png'; // Fallback
        }
    } catch (error) {
        console.error('Error uploading to ImgBB:', error);
        return 'https://placehold.co/600x400.png'; // Fallback
    }
}

// Placeholder for AI insight generation
async function generateSpeciesInsight(speciesName: string, speciesData: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  if (!speciesName || !speciesData) {
    return "No se pudo generar el resumen debido a datos faltantes.";
  }
  return `Resumen generado para ${speciesName}: Esta especie juega un papel vital en su ecosistema. Datos recientes indican una tendencia notable que requiere mayor observación. Los esfuerzos de conservación son cruciales para su supervivencia a largo plazo. Sus características clave incluyen adaptaciones únicas al entorno de Galápagos. (Resumen de IA simulado)`;
}

export async function getSpeciesListAction(): Promise<Species[]> {
  return getSpeciesList();
}

export async function getAllSpeciesFromFirestoreAction(): Promise<Species[]> {
  try {
    const snapshot = await db.collection('allSpeciesData').orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => doc.data() as Species);
  } catch (error) {
    console.error("Error fetching species from Firestore:", error);
    return [];
  }
}

export async function getSpeciesByIdAction(id: string): Promise<Species | undefined> {
  return getSpeciesById(id);
}


export async function getAISummary(speciesId: string): Promise<{ summary?: string; error?: string }> {
  const species = await getSpeciesById(speciesId); 
  if (!species) {
    return { error: "Especie no encontrada." };
  }

  try {
    const dataForAI = `
      Nombre: ${species.spanishCommonName}
      Nombre Científico: ${species.genus} ${species.specificEpithet}
      Estado de Conservación: ${species.iucnStatus}
      Tendencia Poblacional: ${species.populationTrend}
      Hábitat: ${species.habitat}
      Amenazas Clave: ${species.threats.join(', ')}
      Descripción: ${species.spanishDescription}
    `;
    const summary = await generateSpeciesInsight(species.spanishCommonName, dataForAI);
    return { summary };
  } catch (error) {
    console.error("Error generando resumen con IA:", error);
    return { error: "Error al generar el resumen de IA." };
  }
}

export async function saveSpeciesData(prevState: any, formData: FormData): Promise<{ success: boolean; message: string; speciesId?: string }> {
  const speciesId = formData.get('id') as string;
  const userRole = formData.get('userRole') as string;
  const userEmail = formData.get('userEmail') as string;
  
  if (!speciesId) {
    return { success: false, message: "Falta el ID de la especie." };
  }

  if (userRole === 'researcher') {
    if (!userEmail) {
      return { success: false, message: "No se pudo identificar al investigador." };
    }
    const researcher = await getResearcherByEmail(userEmail);
    if (!researcher || !researcher.isVerified) {
      return { success: false, message: "Acción no permitida." };
    }
  } else if (userRole !== 'admin') {
    return { success: false, message: "Acción no permitida. Rol de usuario no autorizado." };
  }

  const currentSpecies = await getSpeciesById(speciesId); 
  if (!currentSpecies) {
    return { success: false, message: "Especie no encontrada." };
  }

  try {
    const historicalDataJSON = formData.get('historicalData') as string;
    let historicalData: HistoricalDataPoint[] = [];

    if (historicalDataJSON) {
        try {
            const parsedData = JSON.parse(historicalDataJSON);
            if (Array.isArray(parsedData)) {
                historicalData = parsedData.map((p: any) => {
                    const values: Record<string, number> = p.values || {};
                    const totalValue = Object.values(values).reduce((sum, val) => sum + val, 0);

                    return {
                        year: Number(p.year),
                        unit: String(p.unit || '').trim(),
                        description: String(p.description || '').trim(),
                        values: values,
                        value: totalValue,
                    };
                }).filter((p: any) => p.year && p.unit)
                  .sort((a: any, b: any) => a.year - b.year);
            }
        } catch (e) {
            console.error("Error parsing historical data:", e);
            return { success: false, message: "Los datos históricos tienen un formato inválido." };
        }
    }

    const imageDataUri = formData.get('imageUrl') as string;
    const finalImageUrl = await handleImageUpload(imageDataUri, currentSpecies.imageUrl);

    const updatedData: Partial<Species> = {
      spanishCommonName: formData.get('spanishCommonName') as string || currentSpecies.spanishCommonName,
      englishCommonName: formData.get('englishCommonName') as string || currentSpecies.englishCommonName,
      genus: formData.get('genus') as string || currentSpecies.genus,
      specificEpithet: formData.get('specificEpithet') as string || currentSpecies.specificEpithet,
      spanishDescription: formData.get('spanishDescription') as string || currentSpecies.spanishDescription,
      englishDescription: formData.get('englishDescription') as string || currentSpecies.englishDescription,
      imageUrl: finalImageUrl,
      iucnStatus: formData.get('iucnStatus') as Species['iucnStatus'] || currentSpecies.iucnStatus,
      populationTrend: formData.get('populationTrend') as Species['populationTrend'] || currentSpecies.populationTrend,
      habitat: formData.get('habitat') as string || currentSpecies.habitat,
      threats: (formData.get('threats') as string || '').split(',').map(t => t.trim()).filter(Boolean),
      historicalData: historicalData,

      // Update island booleans
      is_darwin: formData.get('is_darwin') === 'on',
      is_espanola: formData.get('is_espanola') === 'on',
      is_fernandina: formData.get('is_fernandina') === 'on',
      is_floreana: formData.get('is_floreana') === 'on',
      is_genovesa: formData.get('is_genovesa') === 'on',
      is_isabela: formData.get('is_isabela') === 'on',
      is_marchena: formData.get('is_marchena') === 'on',
      is_pinta: formData.get('is_pinta') === 'on',
      is_pinzon: formData.get('is_pinzon') === 'on',
      is_san_cristobal: formData.get('is_san_cristobal') === 'on',
      is_santa_cruz: formData.get('is_santa_cruz') === 'on',
      is_santa_fe: formData.get('is_santa_fe') === 'on',
      is_santiago: formData.get('is_santiago') === 'on',
      is_north_seymour: formData.get('is_north_seymour') === 'on',
      is_wolf: formData.get('is_wolf') === 'on',

      showHistoricalDataToPublic: formData.get('showHistoricalDataToPublic') === 'on',
    };

    if (!updatedData.spanishCommonName || updatedData.spanishCommonName.length < 3) {
      return { success: false, message: "El nombre común en español debe tener al menos 3 caracteres." };
    }

    const success = await updateSpeciesData(speciesId, updatedData);

    if (success) {
      revalidatePath('/'); 
      revalidatePath(`/species/${speciesId}`); 
      revalidatePath(`/dashboard/edit/${speciesId}`); 
      revalidatePath('/dashboard');
      revalidatePath(`/dashboard/visualize/${speciesId}`);
      revalidatePath('/dashboard/compare');
      return { success: true, message: `Datos de ${updatedData.spanishCommonName || currentSpecies.spanishCommonName} actualizados correctamente.`, speciesId };
    } else {
      return { success: false, message: `Error al actualizar los datos de ${updatedData.spanishCommonName || currentSpecies.spanishCommonName}.` };
    }
  } catch (error) {
    console.error("Error guardando datos de especie:", error);
    return { success: false, message: "Ocurrió un error inesperado al guardar los datos." };
  }
}

export async function addSpeciesAction(prevState: any, formData: FormData): Promise<{ success: boolean; message: string; speciesId?: string }> {
  const userRole = formData.get('userRole') as string;
  const userEmail = formData.get('userEmail') as string;
  
  if (userRole === 'researcher') {
    if (!userEmail) {
      return { success: false, message: "No se pudo identificar al investigador." };
    }
    const researcher = await getResearcherByEmail(userEmail);
    if (!researcher || !researcher.isVerified) {
      return { success: false, message: "Acción no permitida." };
    }
  } else if (userRole !== 'admin') {
    return { success: false, message: "Acción no permitida. Rol de usuario no autorizado." };
  }
  
  const spanishCommonName = formData.get('spanishCommonName') as string;
  if (!spanishCommonName || spanishCommonName.trim().length < 3) {
      return { success: false, message: "El nombre común en español es obligatorio y debe tener al menos 3 caracteres." };
  }

  try {
    const historicalDataJSON = formData.get('historicalData') as string;
    let historicalData: HistoricalDataPoint[] = [];

    if (historicalDataJSON) {
        try {
            const parsedData = JSON.parse(historicalDataJSON);
            if (Array.isArray(parsedData)) {
                historicalData = parsedData.map((p: any) => {
                    const values: Record<string, number> = p.values || {};
                    const totalValue = Object.values(values).reduce((sum, val) => sum + val, 0);

                    return {
                        year: Number(p.year),
                        unit: String(p.unit || '').trim(),
                        description: String(p.description || '').trim(),
                        values: values,
                        value: totalValue,
                    };
                }).filter((p: any) => p.year && p.unit)
                  .sort((a: any, b: any) => a.year - b.year);
            }
        } catch (e) {
            console.error("Error parsing historical data:", e);
            return { success: false, message: "Los datos históricos tienen un formato inválido." };
        }
    }

    const imageDataUri = formData.get('imageUrl') as string;
    const finalImageUrl = await handleImageUpload(imageDataUri, 'https://placehold.co/600x400.png');

    const newSpeciesData: Partial<Species> = {
      spanishCommonName: spanishCommonName,
      englishCommonName: formData.get('englishCommonName') as string,
      genus: formData.get('genus') as string,
      specificEpithet: formData.get('specificEpithet') as string,
      spanishDescription: formData.get('spanishDescription') as string,
      englishDescription: formData.get('englishDescription') as string,
      imageUrl: finalImageUrl,
      iucnStatus: formData.get('iucnStatus') as Species['iucnStatus'],
      populationTrend: formData.get('populationTrend') as Species['populationTrend'],
      habitat: formData.get('habitat') as string,
      threats: (formData.get('threats') as string || '').split(',').map(t => t.trim()).filter(Boolean),
      historicalData: historicalData,

      is_darwin: formData.get('is_darwin') === 'on',
      is_espanola: formData.get('is_espanola') === 'on',
      is_fernandina: formData.get('is_fernandina') === 'on',
      is_floreana: formData.get('is_floreana') === 'on',
      is_genovesa: formData.get('is_genovesa') === 'on',
      is_isabela: formData.get('is_isabela') === 'on',
      is_marchena: formData.get('is_marchena') === 'on',
      is_pinta: formData.get('is_pinta') === 'on',
      is_pinzon: formData.get('is_pinzon') === 'on',
      is_san_cristobal: formData.get('is_san_cristobal') === 'on',
      is_santa_cruz: formData.get('is_santa_cruz') === 'on',
      is_santa_fe: formData.get('is_santa_fe') === 'on',
      is_santiago: formData.get('is_santiago') === 'on',
      is_north_seymour: formData.get('is_north_seymour') === 'on',
      is_wolf: formData.get('is_wolf') === 'on',

      showHistoricalDataToPublic: formData.get('showHistoricalDataToPublic') === 'on',
    };
    
    // Add defaults for new species that are not on the form
    const hintString = spanishCommonName.split(' ').slice(0, 2).join(' ').toLowerCase();
    newSpeciesData.dataAiHint = hintString;
    newSpeciesData.icon = 'Footprints'; // Default icon
    if (!newSpeciesData.imageUrl) {
        newSpeciesData.imageUrl = 'https://placehold.co/600x400.png';
    }


    const newSpecies = await addSpecies(newSpeciesData);

    revalidatePath('/'); 
    revalidatePath('/dashboard');
    redirect(`/dashboard/edit/${newSpecies.id}`);
    
  } catch (error) {
    console.error("Error creando especie:", error);
    const message = error instanceof Error ? error.message : "Ocurrió un error inesperado al crear la especie.";
    return { success: false, message: message };
  }
}

export async function deleteSpeciesAction(prevState: any, formData: FormData): Promise<{ success: boolean; message: string }> {
  const speciesId = formData.get('speciesId') as string;
  const userRole = formData.get('userRole') as string;

  if (userRole !== 'admin') {
    return { success: false, message: "Acción no permitida. Solo los administradores pueden eliminar especies." };
  }

  if (!speciesId) {
    return { success: false, message: "Falta el ID de la especie." };
  }

  try {
    const species = await getSpeciesById(speciesId);
    if (!species) {
      return { success: false, message: "Especie no encontrada." };
    }
    
    const success = await deleteSpeciesById(speciesId);

    if (success) {
      revalidatePath('/');
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/compare');
      return { success: true, message: `Especie '${species.spanishCommonName}' eliminada correctamente.` };
    } else {
      return { success: false, message: "No se pudo eliminar la especie." };
    }
  } catch (error) {
    console.error("Error deleting species:", error);
    return { success: false, message: "Ocurrió un error inesperado al eliminar la especie." };
  }
}

export async function createResearcherAction(
  prevState: { success: boolean; message: string; researcher?: Researcher },
  formData: FormData
): Promise<{ success: boolean; message: string; researcher?: Researcher }> {
  const researcherName = formData.get('researcherName') as string;
  const email = formData.get('email') as string;
  let orcid = formData.get('orcid') as string;
  const idNumber = formData.get('idNumber') as string;
  const institution = formData.get('institution') as string | undefined;
  const specialization = formData.get('specialization') as string | undefined;

  if (!researcherName || researcherName.trim().length < 3) {
    return { success: false, message: "El nombre del investigador debe tener al menos 3 caracteres." };
  }
  if (!/^[a-zA-Z\u00C0-\u017F\s]+$/.test(researcherName)) {
    return { success: false, message: "El nombre del investigador solo debe contener letras y espacios." };
  }
  if (researcherName.trim().split(' ').filter(word => word.length > 0).length < 2) {
    return { success: false, message: "El nombre del investigador debe contener al menos un nombre y un apellido." };
  }
  if (!email || !email.trim().match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
    return { success: false, message: "Por favor, introduce un correo electrónico válido." };
  }

  // Extract ORCID from URL if provided
  const orcidRegex = /(\d{4}-\d{4}-\d{4}-\d{3}[0-9X])$/;
  const orcidMatch = orcid.match(orcidRegex);
  if (orcidMatch) {
      orcid = orcidMatch[0];
  }

  if (!orcid) {
    return { success: false, message: "El ORCID iD es obligatorio." };
  }
  if (!validateOrcid(orcid)) {
    return { success: false, message: "El ORCID iD proporcionado no es válido (dígito de verificación incorrecto)." };
  }
  
  if (!idNumber) {
    return { success: false, message: "El número de Cédula/Pasaporte es obligatorio." };
  }

  // Validate Ecuadorian ID or Passport
  if (/^\d{10}$/.test(idNumber)) {
    if (!validateEcuadorianId(idNumber)) {
        return { success: false, message: "El número de Cédula Ecuatoriana ingresado no es válido." };
    }
  } else if (!/^[A-Z0-9]{9}$/.test(idNumber.toUpperCase())) {
    return { success: false, message: "Formato de Pasaporte no reconocido. Use 9 caracteres alfanuméricos." };
  }

  const researchers = await readJsonFile<Researcher>(researchersDbPath);
  const lowerCaseEmail = email.trim().toLowerCase();

  if (researchers.some(r => r.email === lowerCaseEmail)) {
    return { success: false, message: "Ya existe un investigador con este correo electrónico." };
  }
  
  if (researchers.some(r => r.orcid === orcid)) {
      return { success: false, message: "Este ORCID ID ya ha sido registrado." };
  }
  if (researchers.some(r => r.idNumber === idNumber)) {
      return { success: false, message: "Este número de Cédula/Pasaporte ya ha sido registrado." };
  }

  try {
    const orcidApiUrl = `https://pub.orcid.org/v3.0/${orcid}`;
    const response = await fetch(orcidApiUrl, { headers: { 'Accept': 'application/json' } });
    
    if (!response.ok) {
        if(response.status === 404) {
             return { success: false, message: "El ORCID ID proporcionado no existe." };
        }
        return { success: false, message: "No se pudo verificar el ORCID ID en este momento. Inténtelo más tarde." };
    }
  } catch (error) {
    console.error("ORCID API validation error:", error);
    return { success: false, message: "Error de red al validar el ORCID ID. Verifique su conexión." };
  }


  try {
    const newResearcher = await addResearcher(researcherName, lowerCaseEmail, orcid, idNumber, institution, specialization);
    revalidatePath('/dashboard/admin/researchers');
    return { 
        success: true, 
        message: `¡Registro exitoso! Un administrador verificará tu cuenta pronto.`, 
        researcher: newResearcher 
    };
  } catch (error) {
    console.error("Error creando investigador:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido al crear investigador.";
    return { success: false, message: errorMessage };
  }
}

export async function getResearchersAction(): Promise<Researcher[]> {
  try {
    const researchers = await getAllResearchers();
    return researchers;
  } catch (error) {
    console.error("Error obteniendo investigadores:", error);
    return []; 
  }
}

export async function deleteResearcherAction(
  prevState: { success: boolean; message: string; deletedResearcherId?: string },
  formData: FormData
): Promise<{ success: boolean; message: string; deletedResearcherId?: string }> {
  const researcherId = formData.get('researcherId') as string;
  const userRole = formData.get('userRole') as string;

  if (userRole !== 'admin') {
    return { success: false, message: "Acción no permitida. Solo los administradores pueden eliminar investigadores." };
  }

  if (!researcherId) {
    return { success: false, message: "Falta el ID del investigador." };
  }

  try {
    const deleted = await deleteResearcherById(researcherId);
    if (deleted) {
      revalidatePath('/dashboard/admin/researchers');
      return { success: true, message: "Investigador eliminado correctamente.", deletedResearcherId: researcherId };
    } else {
      return { success: false, message: "No se pudo encontrar o eliminar al investigador." };
    }
  } catch (error) {
    console.error("Error eliminando investigador:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido al eliminar investigador.";
    return { success: false, message: errorMessage };
  }
}

const verificationEmailTemplate = (name: string, loginUrl: string) => `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #210A2B; color: white; padding: 20px; text-align: center;">
    <img src="https://i.ibb.co/b2bWQC2/logo-png.png" alt="Galápagos DataLens Logo" style="max-width: 150px; margin-bottom: 10px;">
    <h1 style="margin: 0; font-size: 24px;">¡Bienvenido a Galápagos DataLens!</h1>
  </div>
  <div style="padding: 20px;">
    <h2 style="color: #210A2B; font-size: 20px;">Hola, ${name},</h2>
    <p>¡Tu cuenta ha sido verificada por un administrador! Ya tienes acceso completo a la plataforma como investigador.</p>
    <p>Ahora puedes iniciar sesión para gestionar datos, crear visualizaciones y colaborar con la comunidad científica para la conservación de las Islas Galápagos.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" style="background-color: #3B82F6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Iniciar Sesión</a>
    </div>
    <p>Si es tu primera vez, utiliza tu correo electrónico y la contraseña que creaste durante el registro. Si no recuerdas tu contraseña, puedes usar la opción de "Olvidé mi contraseña" en la página de inicio de sesión.</p>
    <p>Gracias por unirte a nuestra misión.</p>
    <p>Atentamente,<br>El equipo de Galápagos DataLens</p>
  </div>
  <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #888;">
    &copy; ${new Date().getFullYear()} Galápagos DataLens. Todos los derechos reservados.
  </div>
</div>
`;


export async function toggleResearcherVerificationAction(
  prevState: { success: boolean; message: string; updatedResearcher?: Researcher },
  formData: FormData
): Promise<{ success: boolean; message: string; updatedResearcher?: Researcher }> {
  const researcherId = formData.get('researcherId') as string;
  const userRole = formData.get('userRole') as string;

  if (userRole !== 'admin') {
    return { success: false, message: "Acción no permitida. Solo los administradores pueden gestionar la verificación." };
  }
  
  if (!researcherId) {
    return { success: false, message: "Falta el ID del investigador." };
  }

  try {
    const researcher = await getResearcherById(researcherId);
    if (!researcher) {
      return { success: false, message: "Investigador no encontrado." };
    }

    const updatedResearcher = await updateResearcher(researcherId, { isVerified: !researcher.isVerified });
    if (!updatedResearcher) {
      return { success: false, message: "Error al actualizar el estado de verificación." };
    }

    let message;
    if (updatedResearcher.isVerified) {
      message = `Verificación de ${updatedResearcher.name} completada.`;
      
      if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL && process.env.NEXT_PUBLIC_BASE_URL) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        try {
          const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/login`;
          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: updatedResearcher.email,
            subject: '¡Tu cuenta en Galápagos DataLens ha sido verificada!',
            html: verificationEmailTemplate(updatedResearcher.name, loginUrl),
          });
          message += ` Se ha enviado un correo de confirmación.`;
        } catch (emailError) {
          console.error("Resend email error:", emailError);
          message += ` No se pudo enviar el correo de confirmación.`;
        }
      } else {
        message += ` El envío de correo no está configurado.`;
      }

    } else {
      message = `Verificación de ${updatedResearcher.name} revocada.`;
    }

    revalidatePath('/dashboard/admin/researchers');
    return { success: true, message, updatedResearcher };

  } catch (error) {
    console.error("Error cambiando estado de verificación:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido.";
    return { success: false, message: errorMessage };
  }
}

const passwordResetEmailTemplate = (name: string, resetUrl: string) => `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #210A2B; color: white; padding: 20px; text-align: center;">
    <img src="https://i.ibb.co/b2bWQC2/logo-png.png" alt="Galápagos DataLens Logo" style="max-width: 150px; margin-bottom: 10px;">
    <h1 style="margin: 0; font-size: 24px;">Restablecer Contraseña</h1>
  </div>
  <div style="padding: 20px;">
    <h2 style="color: #210A2B; font-size: 20px;">Hola, ${name},</h2>
    <p>Recibimos una solicitud para restablecer tu contraseña en Galápagos DataLens. Si no fuiste tú quien realizó esta solicitud, puedes ignorar este correo electrónico de forma segura.</p>
    <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background-color: #3B82F6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Restablecer Contraseña</a>
    </div>
    <p>Este enlace de restablecimiento es válido por un tiempo limitado. Si tienes problemas, copia y pega la siguiente URL en tu navegador:</p>
    <p style="font-size: 12px; word-break: break-all; color: #888;">${resetUrl}</p>
    <p>Atentamente,<br>El equipo de Galápagos DataLens</p>
  </div>
  <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #888;">
    &copy; ${new Date().getFullYear()} Galápagos DataLens. Todos los derechos reservados.
  </div>
</div>
`;

export async function requestPasswordResetAction(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
    const email = formData.get('email') as string;
    if (!email || !email.trim().match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
        return { success: false, message: "Por favor, introduce un correo electrónico válido." };
    }

    const researcher = await getResearcherByEmail(email);

    if (researcher && process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL && process.env.NEXT_PUBLIC_BASE_URL) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?email=${encodeURIComponent(email)}`;

      try {
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: email,
          subject: 'Restablece tu contraseña de Galápagos DataLens',
          html: passwordResetEmailTemplate(researcher.name, resetUrl),
        });
      } catch (emailError) {
        console.error("Password reset email error:", emailError);
        return { success: false, message: "No se pudo enviar el correo de restablecimiento. Por favor, inténtalo más tarde." };
      }
    }
    
    return { 
      success: true, 
      message: "Si existe una cuenta asociada a este correo, recibirás un enlace para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada." 
    };
}


const MIN_PASSWORD_LENGTH = 8;
const passwordSchema = z.string()
    .min(MIN_PASSWORD_LENGTH, { message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` })
    .regex(/[A-Z]/, { message: 'La contraseña debe contener al menos una letra mayúscula.' })
    .regex(/[a-z]/, { message: 'La contraseña debe contener al menos una letra minúscula.' })
    .regex(/[0-9]/, { message: 'La contraseña debe contener al menos un número.' });

const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"], 
});


export async function resetPasswordAction(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    const errorMessage = parsed.error.issues.map(issue => issue.message).join(' ');
    return { success: false, message: errorMessage };
  }

  const { email, password } = parsed.data;

  try {
    const researcher = await getResearcherByEmail(email);
    if (!researcher) {
        return { success: false, message: "No se encontró ningún investigador con ese correo electrónico." };
    }
    
    await setResearcherPassword(email, password);

  } catch(error) {
    console.error("Error reseteando la contraseña:", error);
    return { success: false, message: "Ocurrió un error al actualizar la contraseña." };
  }
  
  redirect('/login?reset=success');
}


export async function importSpeciesDataAction(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const file = formData.get('speciesFile') as File;
  if (!file || file.size === 0) {
    return { success: false, message: "No se ha seleccionado ningún archivo." };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: "" }) as any[];

    let addedCount = 0;
    let updatedCount = 0;
    let failedCount = 0;

    for (const row of data) {
      try {
        const spanishName = String(row['spanishCommonName'] || row['Spanish Common Name'] || '');
        if (!spanishName) {
          failedCount++;
          continue;
        }

        const id = spanishName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const existingSpecies = await getSpeciesById(id);
        
        const speciesData: Partial<Species> = {
          id,
          spanishCommonName: spanishName,
          englishCommonName: row['englishCommonName'] || row['English Common Name'] || '',
          localName: row['localName'] || row['Local Name'] || '',
          domain: row['Domain'] || '',
          kingdom: row['Kingdom'] || '',
          phylum: row['Phylum or Division'] || '',
          class: row['Class'] || '',
          order: row['Order'] || '',
          suborder: row['Suborder'] || '',
          superfamily: row['Superfamily'] || '',
          family: row['Family'] || '',
          subfamily: row['Subfamily'] || '',
          tribe: row['Tribe or Section'] || '',
          genus: row['Genus'] || '',
          specificEpithet: row['Specific Epithtet'] || '',
          infraspecificEpithet: row['infraspecificEpithet'] || row['Infraspecific Epithet'] || '',
          author: row['author'] || row['Author'] || '',
          origin: row['origin'] || row['Origin'] || '',
          suborigin: row['suborigin'] || row['Suborigin'] || '',
          iucnStatus: row['iucnStatus'] as ConservationStatus || row['IUCN Status'] as ConservationStatus || 'Datos Insuficientes',
          taxonStatus: row['taxonStatus'] || row['Taxon Status'] || '',
          taxonomicComments: row['taxonomicComments'] || row['Taxonomic Comments'] || '',
          distributionComments: row['distributionComments'] || row['Distribution Comments'] || '',
          spanishDistributionComments: row['spanishDistributionComments'] || row['Spanish Distribution Comments'] || '',
          englishComments: row['englishComments'] || row['English Comments'] || '',
          spanishComments: row['spanishComments'] || row['Spanish Comments'] || '',
          englishDescription: row['englishDescription'] || row['English Description'] || '',
          spanishDescription: row['spanishDescription'] || row['Spanish Description'] || '',
          is_darwin: String(row['is_darwin'] || row['Darwin']).toLowerCase() === 'x',
          is_espanola: String(row['is_espanola'] || row['Española']).toLowerCase() === 'x',
          is_fernandina: String(row['is_fernandina'] || row['Fernandina']).toLowerCase() === 'x',
          is_floreana: String(row['is_floreana'] || row['Floreana']).toLowerCase() === 'x',
          is_genovesa: String(row['is_genovesa'] || row['Genovesa']).toLowerCase() === 'x',
          is_isabela: String(row['is_isabela'] || row['Isabela']).toLowerCase() === 'x',
          is_marchena: String(row['is_marchena'] || row['Marchena']).toLowerCase() === 'x',
          is_pinta: String(row['is_pinta'] || row['Pinta']).toLowerCase() === 'x',
          is_pinzon: String(row['is_pinzon'] || row['Pinzón']).toLowerCase() === 'x',
          is_san_cristobal: String(row['is_san_cristobal'] || row['San Cristóbal']).toLowerCase() === 'x',
          is_santa_cruz: String(row['is_santa_cruz'] || row['Santa Cruz']).toLowerCase() === 'x',
          is_santa_fe: String(row['is_santa_fe'] || row['Santa Fé']).toLowerCase() === 'x',
          is_santiago: String(row['is_santiago'] || row['Santiago']).toLowerCase() === 'x',
          is_unknown_island: String(row['is_unknown_island'] || row['Unknown Island']).toLowerCase() === 'x',
          is_wolf: String(row['is_wolf'] || row['Wolf']).toLowerCase() === 'x',
          is_elizabeth_bay: String(row['is_elizabeth_bay'] || row['Elizabeth Bay/Bahía Elizabeth']).toLowerCase() === 'x',
          is_far_northern: String(row['is_far_northern'] || row['Far-northern/Lejano Norte']).toLowerCase() === 'x',
          is_northern: String(row['is_northern'] || row['Northern/Norte']).toLowerCase() === 'x',
          is_south_eastern: String(row['is_south_eastern'] || row['South-eastern/Centro Sur']).toLowerCase() === 'x',
          is_unknown_bioregion: String(row['is_unknown_bioregion'] || row['Unknown Bioregion']).toLowerCase() === 'x',
          is_western: String(row['is_western'] || row['Western/Oeste']).toLowerCase() === 'x',
        };

        if (existingSpecies) {
          await updateSpeciesData(id, speciesData);
          updatedCount++;
        } else {
           const hintString = spanishName.split(' ').slice(0, 2).join(' ').toLowerCase();
          const newSpeciesDefaults: Partial<Species> = {
              imageUrl: 'https://placehold.co/600x400.png',
              dataAiHint: hintString,
              icon: 'Footprints',
              keyStats: [],
              historicalData: [],
              populationTrend: 'unknown',
              habitat: '',
              threats: [],
              showHistoricalDataToPublic: false
          };
          await addSpecies({ ...newSpeciesDefaults, ...speciesData });
          addedCount++;
        }
      } catch (e) {
        console.error("Error procesando fila:", row, e);
        failedCount++;
      }
    }

    revalidatePath('/');
    revalidatePath('/dashboard');
    
    let message = `Importación completada. Especies añadidas: ${addedCount}, actualizadas: ${updatedCount}.`;
    if (failedCount > 0) {
      message += ` Filas fallidas: ${failedCount}. Revisa la consola del servidor para más detalles.`;
    }
    return { success: true, message };

  } catch (error) {
    console.error("Error en la importación de datos:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido durante la importación.";
    return { success: false, message: `Error al procesar el archivo: ${errorMessage}` };
  }
}

const ADMIN_CREDENTIALS = { 
  email: 'admin@galapagos.com', 
  pass: 'admin123', 
  role: 'admin' as UserRole 
};

export async function loginAction(email: string, password: string): Promise<{ success: boolean; error?: string; role?: UserRole; userEmail?: string, message?: string }> {
  const lowerEmail = email.toLowerCase();

  if (lowerEmail === ADMIN_CREDENTIALS.email) {
    if (password === ADMIN_CREDENTIALS.pass) {
      return { success: true, role: ADMIN_CREDENTIALS.role, userEmail: lowerEmail, message: 'Inicio de sesión como administrador/a exitoso.' };
    } else {
      return { success: false, error: 'Contraseña de administrador incorrecta.' };
    }
  }

  const researcher = await getResearcherByEmail(lowerEmail);

  if (!researcher) {
    return { success: false, error: 'Investigador no encontrado con este correo electrónico.' };
  }

  if (!researcher.isVerified) {
    return { success: false, error: 'Cuenta de investigador no verificada. Por favor, contacta a un administrador.' };
  }

  if (!researcher.password) {
    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
      return { success: false, error: passwordValidation.error.issues.map(i => i.message).join(' ') };
    }
    
    const updatedResearcher = await setResearcherPassword(lowerEmail, password);
    if (updatedResearcher) {
      return { success: true, role: 'researcher', userEmail: lowerEmail, message: 'Contraseña creada. Has iniciado sesión.' };
    } else {
      return { success: false, error: 'No se pudo configurar la contraseña. Inténtalo de nuevo.' };
    }
  } else {
    const passwordMatch = await bcrypt.compare(password, researcher.password);
    if (passwordMatch) {
      return { success: true, role: 'researcher', userEmail: lowerEmail, message: 'Inicio de sesión como investigador/a exitoso.' };
    } else {
      return { success: false, error: 'Contraseña incorrecta para el investigador.' };
    }
  }
}

export async function generateComparisonAnalysisAction(
  speciesIds: string[]
): Promise<{ analysis?: string; error?: string }> {
  if (!speciesIds || speciesIds.length < 2) {
    return { error: 'Se necesitan al menos dos especies para la comparación.' };
  }

  try {
    const speciesDataPromises = speciesIds.map(id => getSpeciesById(id));
    const speciesList = await Promise.all(speciesDataPromises);

    const validSpecies = speciesList.filter((s): s is Species => !!s);
    if (validSpecies.length !== speciesIds.length) {
      return { error: 'Una o más especies seleccionadas no pudieron ser encontradas.' };
    }
    
    const flowInput: CompareSpeciesInput = validSpecies.map(s => ({
      spanishCommonName: s.spanishCommonName,
      iucnStatus: s.iucnStatus,
      populationTrend: s.populationTrend,
      historicalData: s.historicalData.map(p => ({...p, value: p.value})), // use totalValue
    }));
    
    const analysis = await getComparisonAnalysis(flowInput);
    return { analysis };

  } catch (error) {
    console.error("Error generando análisis comparativo:", error);
    return { error: "Ocurrió un error al contactar al servicio de IA para el análisis." };
  }
}

export async function generatePdfAction(input: GeneratePdfInput): Promise<{pdfBase64?: string, error?: string}> {
    try {
        const { pdfBase64, error } = await generatePdfFlow(input);
        if (error) {
            return { error };
        }
        return { pdfBase64 };
    } catch (e) {
        console.error("Error executing generatePdfFlow:", e);
        return { error: 'Failed to generate PDF due to a server error.' };
    }
}

export async function getMyResearcherDataAction(email: string): Promise<Researcher | null> {
    const researcher = await getResearcherByEmail(email);
    if (!researcher) {
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...researcherData } = researcher; // Don't send password to client
    return researcherData;
}

export async function updateMyProfileAction(prevState: any, formData: FormData): Promise<{ success: boolean; message: string }> {
    const userEmail = formData.get('userEmail') as string;
    const researcherName = formData.get('researcherName') as string;
    const institution = formData.get('institution') as string;
    const specialization = formData.get('specialization') as string;
    const imageDataUri = formData.get('profileImageUrl') as string;

    if (!userEmail) {
        return { success: false, message: 'No se pudo identificar al usuario.' };
    }
    
    if (!researcherName || researcherName.trim().length < 3) {
      return { success: false, message: "El nombre debe tener al menos 3 caracteres." };
    }

    const researcher = await getResearcherByEmail(userEmail);
    if (!researcher) {
        return { success: false, message: 'Investigador no encontrado.' };
    }

    try {
        const finalImageUrl = await handleImageUpload(imageDataUri, researcher.profileImageUrl || '');

        const updatedData: Partial<Researcher> = {
            name: researcherName,
            institution,
            specialization,
            profileImageUrl: finalImageUrl,
        };

        const updatedResearcher = await updateResearcher(researcher.id, updatedData);

        if (updatedResearcher) {
            revalidatePath('/dashboard/profile');
            revalidatePath('/dashboard/admin/researchers');
            revalidatePath('/colaboradores');
            return { success: true, message: 'Perfil actualizado correctamente.' };
        } else {
            return { success: false, message: 'No se pudo actualizar el perfil.' };
        }
    } catch (error) {
        console.error("Error actualizando perfil:", error);
        return { success: false, message: 'Ocurrió un error inesperado.' };
    }
}
