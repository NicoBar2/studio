
"use server";

import { revalidatePath } from 'next/cache';
import { 
  updateSpeciesData, 
  type Species, 
  type HistoricalDataPoint, 
  type SpeciesStat, 
  getSpeciesById,
  getSpeciesList
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
// Assuming a Genkit flow for insights exists at this path
// import { generateSpeciesInsight } from '@/ai/flows/generateInsights'; 

// Placeholder for AI insight generation
async function generateSpeciesInsight(speciesName: string, speciesData: string): Promise<string> {
  // In a real scenario, this would call the Genkit flow:
  // const insight = await runFlow(generateSpeciesInsight, { speciesName, speciesData });
  // return insight.result;
  
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing time
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
      Nombre: ${species.name}
      Nombre Científico: ${species.scientificName}
      Estado de Conservación: ${species.conservationStatus}
      Tendencia Poblacional: ${species.populationTrend}
      Hábitat: ${species.habitat}
      Amenazas Clave: ${species.threats.join(', ')}
      Descripción: ${species.description}
    `;
    const summary = await generateSpeciesInsight(species.name, dataForAI);
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

  // Authorization check
  if (userRole === 'researcher') {
    if (!userEmail) {
      return { success: false, message: "No se pudo identificar al investigador." };
    }
    const researcher = await getResearcherByEmailFromStoreInternal(userEmail);
    if (!researcher) {
      return { success: false, message: "Investigador no encontrado." };
    }
    if (!researcher.isVerified) {
      return { success: false, message: "Acción no permitida. El investigador debe estar verificado para guardar cambios." };
    }
  } else if (userRole !== 'admin') {
    return { success: false, message: "Acción no permitida. Rol de usuario no autorizado." };
  }
  // Admin role can proceed

  const currentSpecies = await getSpeciesById(speciesId); 
  if (!currentSpecies) {
    return { success: false, message: "Especie no encontrada." };
  }

  try {
    const newImageUrl = formData.get('imageUrl') as string;

    const updatedData: Partial<Species> = {
      name: formData.get('name') as string || currentSpecies.name,
      scientificName: formData.get('scientificName') as string || currentSpecies.scientificName,
      description: formData.get('description') as string || currentSpecies.description,
      longDescription: formData.get('longDescription') as string || currentSpecies.longDescription,
      imageUrl: newImageUrl || currentSpecies.imageUrl, 
      conservationStatus: formData.get('conservationStatus') as Species['conservationStatus'] || currentSpecies.conservationStatus,
      populationTrend: formData.get('populationTrend') as Species['populationTrend'] || currentSpecies.populationTrend,
      habitat: formData.get('habitat') as string || currentSpecies.habitat,
      threats: (formData.get('threats') as string || '').split(',').map(t => t.trim()).filter(t => t).length > 0 
                 ? (formData.get('threats') as string).split(',').map(t => t.trim()).filter(t => t) 
                 : currentSpecies.threats,
    };

    if (updatedData.name && updatedData.name.length < 3) {
      return { success: false, message: "El nombre de la especie debe tener al menos 3 caracteres." };
    }

    const keyStatLabel = formData.get('keyStat0_label') as string;
    const keyStatValue = formData.get('keyStat0_value') as string;
    const keyStatUnit = formData.get('keyStat0_unit') as string;
    
    if (keyStatLabel && keyStatValue) { 
        const existingStatIndex = currentSpecies.keyStats.findIndex(stat => stat.label === keyStatLabel);
        updatedData.keyStats = [...currentSpecies.keyStats]; 
        if (existingStatIndex !== -1) {
            updatedData.keyStats[existingStatIndex] = {
                label: keyStatLabel,
                value: isNaN(Number(keyStatValue)) ? keyStatValue : Number(keyStatValue),
                unit: keyStatUnit || undefined
            };
        } else if (currentSpecies.keyStats.length > 0 && currentSpecies.keyStats[0].label === keyStatLabel) {
             updatedData.keyStats[0] = {
                label: keyStatLabel,
                value: isNaN(Number(keyStatValue)) ? keyStatValue : Number(keyStatValue),
                unit: keyStatUnit || undefined
            };
        }
    }


    const historicalYear = formData.get('historicalData0_year') as string;
    const historicalValue = formData.get('historicalData0_value') as string;
    const historicalUnit = formData.get('historicalData0_unit') as string;

    if (historicalYear && historicalValue && historicalUnit) { 
        const yearNum = parseInt(historicalYear);
        const valueNum = parseFloat(historicalValue);
        if (!isNaN(yearNum) && !isNaN(valueNum)) {
            updatedData.historicalData = [...currentSpecies.historicalData]; 
            if (updatedData.historicalData.length > 0 && updatedData.historicalData[0].year === yearNum ) { 
                 updatedData.historicalData[0] = { year: yearNum, value: valueNum, unit: historicalUnit };
            } else { 
                const existingDataIndex = updatedData.historicalData.findIndex(data => data.year === yearNum);
                if (existingDataIndex !== -1) {
                     updatedData.historicalData[existingDataIndex] = { year: yearNum, value: valueNum, unit: historicalUnit };
                }
            }
        }
    }

    const success = await updateSpeciesData(speciesId, updatedData);

    if (success) {
      revalidatePath('/'); 
      revalidatePath(`/species/${speciesId}`); 
      revalidatePath(`/dashboard/edit/${speciesId}`); 
      return { success: true, message: `Datos de ${updatedData.name || currentSpecies.name} actualizados correctamente.`, speciesId };
    } else {
      return { success: false, message: `Error al actualizar los datos de ${updatedData.name || currentSpecies.name}.` };
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
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay for API call

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
