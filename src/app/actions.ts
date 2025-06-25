
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
  type ConservationStatus,
  type UserRole
} from '@/lib/species';
import { 
  addResearcher as addResearcherToStore, 
  getAllResearchers as getAllResearchersFromStore, 
  deleteResearcherById as deleteResearcherByIdFromStore, 
  updateResearcher as updateResearcherInStore,
  getResearcherById as getResearcherByIdFromStore,
  getResearcherByEmail,
  setResearcherPassword,
  type Researcher 
} from '@/lib/researchers';
import { enrichSpeciesData, type EnrichedData } from '@/ai/flows/enrichSpeciesData';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

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

export async function requestPasswordResetAction(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
    const email = formData.get('email') as string;
    if (!email || !email.trim().match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
        return { success: false, message: "Por favor, introduce un correo electrónico válido." };
    }

    const researcher = await getResearcherByEmail(email);

    // For security, we don't reveal if the email exists.
    // In a real app, you would generate a token and send an email only if the user exists.
    if (researcher) {
      console.log(`Password reset requested for ${email}. In a real app, an email would be sent.`);
    }

    return { 
      success: true, 
      message: "Si existe una cuenta con ese correo, se ha enviado un enlace de recuperación (simulado)." 
    };
}


const MIN_PASSWORD_LENGTH = 6;

const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().min(MIN_PASSWORD_LENGTH, { message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"], // path of error
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
    // Flatten errors to a simple message string
    const errorMessage = parsed.error.issues.map(issue => issue.message).join(' ');
    return { success: false, message: errorMessage };
  }

  const { email, password } = parsed.data;

  try {
    const researcher = await getResearcherByEmail(email);
    if (!researcher) {
        // We check again here just in case, but the primary check is in AuthContext/request
        return { success: false, message: "No se encontró ningún investigador con ese correo electrónico." };
    }
    
    await setResearcherPassword(email, password);

  } catch(error) {
    console.error("Error reseteando la contraseña:", error);
    return { success: false, message: "Ocurrió un error al actualizar la contraseña." };
  }
  
  // On success, redirect to login page. The page itself will show the toast.
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
        const spanishName = String(row['Spanish Common Name'] || '');
        if (!spanishName) {
          failedCount++;
          continue;
        }

        const id = spanishName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const existingSpecies = await getSpeciesById(id);
        
        const speciesData: Partial<Species> = {
          id,
          spanishCommonName: spanishName,
          englishCommonName: row['English Common Name'] || '',
          localName: row['Local Name'] || '',
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
          infraspecificEpithet: row['Infraspecific Epithet'] || '',
          author: row['Author'] || '',
          origin: row['Origin'] || '',
          suborigin: row['Suborigin'] || '',
          iucnStatus: row['IUCN Status'] as ConservationStatus || 'Datos Insuficientes',
          taxonStatus: row['Taxon Status'] || '',
          taxonomicComments: row['Taxonomic Comments'] || '',
          distributionComments: row['Distribution Comments'] || '',
          spanishDistributionComments: row['Spanish Distribution Comments'] || '',
          englishComments: row['English Comments'] || '',
          spanishComments: row['Spanish Comments'] || '',
          englishDescription: row['English Description'] || '',
          spanishDescription: row['Spanish Description'] || '',
          is_darwin: String(row['Darwin']).toLowerCase() === 'x',
          is_española: String(row['Española']).toLowerCase() === 'x',
          is_fernandina: String(row['Fernandina']).toLowerCase() === 'x',
          is_floreana: String(row['Floreana']).toLowerCase() === 'x',
          is_genovesa: String(row['Genovesa']).toLowerCase() === 'x',
          is_isabela: String(row['Isabela']).toLowerCase() === 'x',
          is_marchena: String(row['Marchena']).toLowerCase() === 'x',
          is_pinta: String(row['Pinta']).toLowerCase() === 'x',
          is_pinzón: String(row['Pinzón']).toLowerCase() === 'x',
          is_sanCristóbal: String(row['San Cristóbal']).toLowerCase() === 'x',
          is_santaCruz: String(row['Santa Cruz']).toLowerCase() === 'x',
          is_santaFé: String(row['Santa Fé']).toLowerCase() === 'x',
          is_santiago: String(row['Santiago']).toLowerCase() === 'x',
          is_unknownIsland: String(row['Unknown Island']).toLowerCase() === 'x',
          is_wolf: String(row['Wolf']).toLowerCase() === 'x',
          is_elizabethBay: String(row['Elizabeth Bay/Bahía Elizabeth']).toLowerCase() === 'x',
          is_farNorthern: String(row['Far-northern/Lejano Norte']).toLowerCase() === 'x',
          is_northern: String(row['Northern/Norte']).toLowerCase() === 'x',
          is_southEastern: String(row['South-eastern/Centro Sur']).toLowerCase() === 'x',
          is_unknownBioregion: String(row['Unknown Bioregion']).toLowerCase() === 'x',
          is_western: String(row['Western/Oeste']).toLowerCase() === 'x',
        };

        if (existingSpecies) {
          await updateSpeciesData(id, speciesData);
          updatedCount++;
        } else {
          // Set defaults for new species only
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

const ADMIN_CREDENTIALS = { 
  email: 'admin@galapagos.com', 
  pass: 'admin123', 
  role: 'admin' as UserRole 
};

export async function loginAction(email: string, password: string): Promise<{ success: boolean; error?: string; role?: UserRole; userEmail?: string, message?: string }> {
  const lowerEmail = email.toLowerCase();

  // Admin Login
  if (lowerEmail === ADMIN_CREDENTIALS.email) {
    if (password === ADMIN_CREDENTIALS.pass) {
      return { success: true, role: ADMIN_CREDENTIALS.role, userEmail: lowerEmail, message: 'Inicio de sesión como administrador/a exitoso.' };
    } else {
      return { success: false, error: 'Contraseña de administrador incorrecta.' };
    }
  }

  // Researcher Login / Password Setup
  const researcher = await getResearcherByEmail(lowerEmail);

  if (!researcher) {
    return { success: false, error: 'Investigador no encontrado con este correo electrónico.' };
  }

  if (!researcher.isVerified) {
    return { success: false, error: 'Cuenta de investigador no verificada. Por favor, contacta a un administrador.' };
  }

  // Researcher is verified
  if (!researcher.password) {
    // First-time password setup for a verified researcher
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      return { success: false, error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres para la configuración inicial.` };
    }
    
    const updatedResearcher = await setResearcherPassword(lowerEmail, password);
    if (updatedResearcher) {
      return { success: true, role: 'researcher', userEmail: lowerEmail, message: 'Contraseña creada. Has iniciado sesión.' };
    } else {
      return { success: false, error: 'No se pudo configurar la contraseña. Inténtalo de nuevo.' };
    }
  } else {
    // Researcher has an existing password, normal login
    const passwordMatch = await bcrypt.compare(password, researcher.password);
    if (passwordMatch) {
      return { success: true, role: 'researcher', userEmail: lowerEmail, message: 'Inicio de sesión como investigador/a exitoso.' };
    } else {
      return { success: false, error: 'Contraseña incorrecta para el investigador.' };
    }
  }
}
