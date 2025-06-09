
"use server";

import { revalidatePath } from 'next/cache';
import { speciesList, updateSpeciesData as mockUpdateSpeciesData, type Species, type HistoricalDataPoint, type SpeciesStat } from '@/lib/species';
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
    return "Could not generate insights due to missing data.";
  }
  return `Generated insight for ${speciesName}: This species plays a vital role in its ecosystem. Recent data indicates a notable trend that requires further observation. Conservation efforts are crucial for its long-term survival. Key characteristics include its unique adaptations to the Galapagos environment. (Mock AI Summary)`;
}


export async function getAISummary(speciesId: string): Promise<{ summary?: string; error?: string }> {
  const species = speciesList.find(s => s.id === speciesId);
  if (!species) {
    return { error: "Species not found." };
  }

  try {
    // Prepare a simplified data string for the AI
    const dataForAI = `
      Name: ${species.name}
      Scientific Name: ${species.scientificName}
      Conservation Status: ${species.conservationStatus}
      Population Trend: ${species.populationTrend}
      Habitat: ${species.habitat}
      Key Threats: ${species.threats.join(', ')}
      Description: ${species.description}
    `;
    const summary = await generateSpeciesInsight(species.name, dataForAI);
    return { summary };
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return { error: "Failed to generate AI summary." };
  }
}

export async function saveSpeciesData(formData: FormData): Promise<{ success: boolean; message: string; speciesId?: string }> {
  const speciesId = formData.get('id') as string;
  
  if (!speciesId) {
    return { success: false, message: "Species ID is missing." };
  }

  const species = speciesList.find(s => s.id === speciesId);
  if (!species) {
    return { success: false, message: "Species not found." };
  }

  try {
    const updatedData: Partial<Species> = {
      name: formData.get('name') as string || species.name,
      scientificName: formData.get('scientificName') as string || species.scientificName,
      description: formData.get('description') as string || species.description,
      longDescription: formData.get('longDescription') as string || species.longDescription,
      conservationStatus: formData.get('conservationStatus') as Species['conservationStatus'] || species.conservationStatus,
      populationTrend: formData.get('populationTrend') as Species['populationTrend'] || species.populationTrend,
      habitat: formData.get('habitat') as string || species.habitat,
      threats: (formData.get('threats') as string || '').split(',').map(t => t.trim()).filter(t => t) || species.threats,
    };

    // Basic validation examples
    if (updatedData.name && updatedData.name.length < 3) {
      return { success: false, message: "Species name must be at least 3 characters long." };
    }

    // Update keyStats (example for one stat)
    // This part needs to be more robust in a real app, handling multiple stats
    const keyStatLabel = formData.get('keyStat0_label') as string;
    const keyStatValue = formData.get('keyStat0_value') as string;
    const keyStatUnit = formData.get('keyStat0_unit') as string;
    
    if (keyStatLabel && keyStatValue) {
        const existingStatIndex = species.keyStats.findIndex(stat => stat.label === keyStatLabel);
        if (existingStatIndex !== -1) {
            updatedData.keyStats = [...species.keyStats];
            updatedData.keyStats[existingStatIndex] = {
                label: keyStatLabel,
                value: isNaN(Number(keyStatValue)) ? keyStatValue : Number(keyStatValue),
                unit: keyStatUnit || undefined
            };
        } else {
             updatedData.keyStats = [...species.keyStats, {
                label: keyStatLabel,
                value: isNaN(Number(keyStatValue)) ? keyStatValue : Number(keyStatValue),
                unit: keyStatUnit || undefined
            }];
        }
    }


    // Update historicalData (example for one point)
    // This part also needs robust handling for multiple points
    const historicalYear = formData.get('historicalData0_year') as string;
    const historicalValue = formData.get('historicalData0_value') as string;
    const historicalUnit = formData.get('historicalData0_unit') as string;

    if (historicalYear && historicalValue && historicalUnit) {
        const yearNum = parseInt(historicalYear);
        const valueNum = parseFloat(historicalValue);
        if (!isNaN(yearNum) && !isNaN(valueNum)) {
            const existingDataIndex = species.historicalData.findIndex(data => data.year === yearNum);
            if (existingDataIndex !== -1) {
                updatedData.historicalData = [...species.historicalData];
                updatedData.historicalData[existingDataIndex] = { year: yearNum, value: valueNum, unit: historicalUnit };
            } else {
                 updatedData.historicalData = [...species.historicalData, { year: yearNum, value: valueNum, unit: historicalUnit }];
            }
        }
    }


    const success = mockUpdateSpeciesData(speciesId, updatedData);

    if (success) {
      revalidatePath('/'); // Revalidate home page (species list)
      revalidatePath(`/species/${speciesId}`); // Revalidate specific species page
      revalidatePath(`/dashboard/edit/${speciesId}`); // Revalidate edit page
      return { success: true, message: `${species.name} data updated successfully.`, speciesId };
    } else {
      return { success: false, message: `Failed to update ${species.name} data.` };
    }
  } catch (error) {
    console.error("Error saving species data:", error);
    return { success: false, message: "An unexpected error occurred while saving data." };
  }
}

