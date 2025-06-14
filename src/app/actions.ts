
"use server";

import { revalidatePath } from 'next/cache';
import { speciesList, updateSpeciesData as mockUpdateSpeciesData, type Species, type HistoricalDataPoint, type SpeciesStat, getSpeciesById } from '@/lib/species';
import { 
  addResearcher as addResearcherToStore, 
  getAllResearchers as getAllResearchersFromStore, 
  deleteResearcherById as deleteResearcherByIdFromStore, 
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


export async function getAISummary(speciesId: string): Promise<{ summary?: string; error?: string }> {
  const species = getSpeciesById(speciesId); // Using the refactored getSpeciesById
  if (!species) {
    return { error: "Especie no encontrada." };
  }

  try {
    // Prepare a simplified data string for the AI
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
  
  if (!speciesId) {
    return { success: false, message: "Falta el ID de la especie." };
  }

  const currentSpecies = getSpeciesById(speciesId); // Fetch fresh data
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
    
    if (keyStatLabel && keyStatValue) { // Only update if new data is provided
        const existingStatIndex = currentSpecies.keyStats.findIndex(stat => stat.label === keyStatLabel);
        updatedData.keyStats = [...currentSpecies.keyStats]; // Start with a copy
        if (existingStatIndex !== -1) {
            updatedData.keyStats[existingStatIndex] = {
                label: keyStatLabel,
                value: isNaN(Number(keyStatValue)) ? keyStatValue : Number(keyStatValue),
                unit: keyStatUnit || undefined
            };
        } else if (currentSpecies.keyStats.length > 0 && currentSpecies.keyStats[0].label === keyStatLabel) {
             // This condition might be redundant if keyStat0_label hidden input ensures it's always the first stat
             updatedData.keyStats[0] = {
                label: keyStatLabel,
                value: isNaN(Number(keyStatValue)) ? keyStatValue : Number(keyStatValue),
                unit: keyStatUnit || undefined
            };
        }
        // Not adding new stats here as form only allows editing the first one
    }


    const historicalYear = formData.get('historicalData0_year') as string;
    const historicalValue = formData.get('historicalData0_value') as string;
    const historicalUnit = formData.get('historicalData0_unit') as string;

    if (historicalYear && historicalValue && historicalUnit) { // Only update if new data is provided
        const yearNum = parseInt(historicalYear);
        const valueNum = parseFloat(historicalValue);
        if (!isNaN(yearNum) && !isNaN(valueNum)) {
            updatedData.historicalData = [...currentSpecies.historicalData]; // Start with a copy
            // Assuming the form edits the first historical data point based on name="historicalData0_..."
            if (updatedData.historicalData.length > 0 && updatedData.historicalData[0].year === yearNum ) { // Check if it's the one being edited
                 updatedData.historicalData[0] = { year: yearNum, value: valueNum, unit: historicalUnit };
            } else { // Fallback or if structure changes - find by year
                const existingDataIndex = updatedData.historicalData.findIndex(data => data.year === yearNum);
                if (existingDataIndex !== -1) {
                     updatedData.historicalData[existingDataIndex] = { year: yearNum, value: valueNum, unit: historicalUnit };
                }
                // Not adding new historical data here as form only allows editing the first one
            }
        }
    }

    const success = mockUpdateSpeciesData(speciesId, updatedData);

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

  if (!researcherName || researcherName.trim().length < 3) {
    return { success: false, message: "El nombre del investigador debe tener al menos 3 caracteres." };
  }

  try {
    const newResearcher = await addResearcherToStore(researcherName);
    revalidatePath('/dashboard/admin/researchers'); 
    return { success: true, message: `Investigador "${newResearcher.name}" creado correctamente.`, researcher: newResearcher };
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

    