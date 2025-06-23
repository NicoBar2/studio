
"use server";

import { revalidatePath } from 'next/cache';
import * as xlsx from 'xlsx';
import { 
  updateSpeciesData, 
  addSpecies as addSpeciesToStore,
  type Species, 
  type HistoricalDataPoint, 
  type SpeciesStat, 
  getSpeciesById,
  getSpeciesList,
  type ConservationStatus
} from '@/lib/species';
import { 
  addResearcher as addResearcherToStore, 
  getAllResearchers as getAllResearchersFromStore, 
  deleteResearcherById as deleteResearcherByIdFromStore, 
  updateResearcher as updateResearcherInStore,
  getResearcherById as getResearcherByIdFromStore,
  getResearcherByEmail as getResearcherByEmailFromStoreInternal,
  setResearcherPassword as setResearcherPasswordInternal,
  type Researcher 
} from '@/lib/researchers';
import { enrichSpeciesData, type EnrichedData } from '@/ai/flows/enrichSpeciesData';

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
    const researcher = await getResearcherByEmailFromStoreInternal(userEmail);
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
    const updatedData: Partial<Species> = {
      spanishCommonName: formData.get('spanishCommonName') as string || currentSpecies.spanishCommonName,
      englishCommonName: formData.get('englishCommonName') as string || currentSpecies.englishCommonName,
      genus: formData.get('genus') as string || currentSpecies.genus,
      specificEpithet: formData.get('specificEpithet') as string || currentSpecies.specificEpithet,
      spanishDescription: formData.get('spanishDescription') as string || currentSpecies.spanishDescription,
      englishDescription: formData.get('englishDescription') as string || currentSpecies.englishDescription,
      imageUrl: formData.get('imageUrl') as string || currentSpecies.imageUrl,
      iucnStatus: formData.get('iucnStatus') as Species['iucnStatus'] || currentSpecies.iucnStatus,
      populationTrend: formData.get('populationTrend') as Species['populationTrend'] || currentSpecies.populationTrend,
      habitat: formData.get('habitat') as string || currentSpecies.habitat,
      threats: (formData.get('threats') as string || '').split(',').map(t => t.trim()).filter(Boolean),
      
      // Update island booleans
      is_darwin: formData.get('is_darwin') === 'on',
      is_española: formData.get('is_española') === 'on',
      is_fernandina: formData.get('is_fernandina') === 'on',
      is_floreana: formData.get('is_floreana') === 'on',
      is_genovesa: formData.get('is_genovesa') === 'on',
      is_isabela: formData.get('is_isabela') === 'on',
      is_marchena: formData.get('is_marchena') === 'on',
      is_pinta: formData.get('is_pinta') === 'on',
      is_pinzón: formData.get('is_pinzón') === 'on',
      is_sanCristóbal: formData.get('is_sanCristóbal') === 'on',
      is_santaCruz: formData.get('is_santaCruz') === 'on',
      is_santaFé: formData.get('is_santaFé') === 'on',
      is_santiago: formData.get('is_santiago') === 'on',
      is_wolf: formData.get('is_wolf') === 'on',
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
      return { success: true, message: `Datos de ${updatedData.spanishCommonName || currentSpecies.spanishCommonName} actualizados correctamente.`, speciesId };
    } else {
      return { success: false, message: `Error al actualizar los datos de ${updatedData.spanishCommonName || currentSpecies.spanishCommonName}.` };
    }
  } catch (error) {
    console.error("Error guardando datos de especie:", error);
    return { success: false, message: "Ocurrió un error inesperado al guardar los datos." };
  }
}


export async function createResearcherAction(
  prevState: { success: boolean; message: string; researcher?: Researcher },
  formData: FormData
): Promise<{ success: boolean; message: string; researcher?: Researcher }> {
  const researcherName = formData.get('researcherName') as string;
  const email = formData.get('email') as string;
  const institution = formData.get('institution') as string | undefined;
  const specialization = formData.get('specialization') as string | undefined;

  if (!researcherName || researcherName.trim().length < 3) {
    return { success: false, message: "El nombre del investigador debe tener al menos 3 caracteres." };
  }
  if (researcherName.trim().split(' ').filter(word => word.length > 0).length < 2) {
    return { success: false, message: "El nombre del investigador debe contener al menos un nombre y un apellido." };
  }
  if (!email || !email.trim().match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
    return { success: false, message: "Por favor, introduce un correo electrónico válido." };
  }

  try {
    const newResearcher = await addResearcherToStore(researcherName, email.toLowerCase(), institution, specialization);
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
    const researchers = await getAllResearchersFromStore();
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

  if (!researcherId) {
    return { success: false, message: "Falta el ID del investigador." };
  }

  try {
    const deleted = await deleteResearcherByIdFromStore(researcherId);
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

export async function toggleResearcherVerificationAction(
  prevState: { success: boolean; message: string; updatedResearcher?: Researcher },
  formData: FormData
): Promise<{ success: boolean; message: string; updatedResearcher?: Researcher }> {
  const researcherId = formData.get('researcherId') as string;
  if (!researcherId) {
    return { success: false, message: "Falta el ID del investigador." };
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 500)); 

    const researcher = await getResearcherByIdFromStore(researcherId);
    if (!researcher) {
      return { success: false, message: "Investigador no encontrado." };
    }

    const updatedResearcher = await updateResearcherInStore(researcherId, { isVerified: !researcher.isVerified });
    if (updatedResearcher) {
      revalidatePath('/dashboard/admin/researchers');
      const verificationStatusMessage = updatedResearcher.isVerified
        ? `Verificación de ${updatedResearcher.name} completada. Se ha enviado un correo de confirmación (simulado).`
        : `Verificación de ${updatedResearcher.name} revocada.`;
      return { 
        success: true, 
        message: verificationStatusMessage,
        updatedResearcher 
      };
    } else {
      return { success: false, message: "Error al actualizar el estado de verificación." };
    }
  } catch (error) {
    console.error("Error cambiando estado de verificación:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido.";
    return { success: false, message: errorMessage };
  }
}

export async function getResearcherByEmailFromStore(email: string): Promise<Researcher | undefined> {
  return getResearcherByEmailFromStoreInternal(email);
}

export async function setResearcherPasswordAction(email: string, passwordToSet: string): Promise<Researcher | null> {
  return setResearcherPasswordInternal(email, passwordToSet);
}


export async function importSpeciesDataAction(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const file = formData.get('speciesFile') as File;
  if (!file || file.size === 0) {
    return { success: false, message: "No se ha seleccionado ningún archivo." };
  }

  const toBoolean = (value: any): boolean => {
    if (typeof value === 'string') {
      const lowerVal = value.toLowerCase().trim();
      return lowerVal === 'true' || lowerVal === 'x' || lowerVal === '1';
    }
    return !!value;
  };

  const mapPopulationTrend = (trend: any): Species['populationTrend'] => {
    const lowerTrend = String(trend || '').toLowerCase().trim();
    switch (lowerTrend) {
      case 'increasing': case 'creciente': return 'increasing';
      case 'decreasing': case 'decreciente': return 'decreasing';
      case 'stable': case 'estable': return 'stable';
      default: return 'unknown';
    }
  };

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
        const spanishName = String(row['nombre'] || '');
        if (!spanishName) {
          failedCount++;
          continue;
        }

        const id = spanishName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const existingSpecies = await getSpeciesById(id);

        const hintString = spanishName.split(' ').slice(0, 2).join(' ').toLowerCase();
        const scientificName = String(row['cientifico'] || '');
        const scientificParts = scientificName.split(' ');
        
        const speciesData: Partial<Species> = {
          id: id,
          spanishCommonName: spanishName,
          genus: scientificParts[0] || '',
          specificEpithet: scientificParts.slice(1).join(' ') || '',
          iucnStatus: (String(row['conservacion'] || (existingSpecies ? existingSpecies.iucnStatus : 'Datos Insuficientes'))) as ConservationStatus,
          populationTrend: mapPopulationTrend(row['poblacion'] || (existingSpecies ? existingSpecies.populationTrend : 'unknown')),
          habitat: String(row['habitat'] || (existingSpecies ? existingSpecies.habitat : '')),
          threats: (row.amenazas || (existingSpecies ? existingSpecies.threats.join(',') : '')).toString().split(',').map((t: string) => t.trim()).filter((t: string) => t),
        };

        if (existingSpecies) {
          await updateSpeciesData(id, speciesData);
          updatedCount++;
        } else {
          // Set defaults for new species only
          const newSpeciesDefaults: Partial<Species> = {
              spanishDescription: `Descripción breve para ${spanishName}.`,
              englishDescription: `A short description for ${spanishName}.`,
              imageUrl: 'https://placehold.co/600x400.png',
              dataAiHint: hintString,
              icon: 'Footprints',
              keyStats: [],
              historicalData: [],
          };
          await addSpeciesToStore({ ...newSpeciesDefaults, ...speciesData });
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

export async function enrichSpeciesDataAction(prevState: any, formData: FormData): Promise<{ success: boolean; message: string; speciesId?: string }> {
  const speciesId = formData.get('speciesId') as string;
  if (!speciesId) {
    return { success: false, message: "Falta el ID de la especie." };
  }

  const species = await getSpeciesById(speciesId);
  if (!species) {
    return { success: false, message: "Especie no encontrada." };
  }

  try {
    const enrichedData: EnrichedData = await enrichSpeciesData(species.spanishCommonName);

    const updatedData: Partial<Species> = {
      habitat: enrichedData.habitat,
      iucnStatus: enrichedData.conservationStatus,
      populationTrend: enrichedData.populationTrend,
      threats: enrichedData.threats,
      keyStats: enrichedData.keyStats,
    };

    const success = await updateSpeciesData(speciesId, updatedData);

    if (success) {
      revalidatePath('/dashboard');
      revalidatePath(`/species/${speciesId}`);
      return { success: true, message: `¡Datos de ${species.spanishCommonName} enriquecidos con IA!`, speciesId };
    } else {
      return { success: false, message: "Error al guardar los datos enriquecidos." };
    }

  } catch (error) {
    console.error("Error enriqueciendo datos de especie con IA:", error);
    return { success: false, message: "Ocurrió un error al contactar al servicio de IA." };
  }
}
