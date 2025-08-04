
import { NextResponse } from 'next/server';
import { processCsvWithAI } from '@/ai/flows/processCsvWithAIFlow';
import admin from 'firebase-admin';
import type { Species } from '@/lib/types';

// Initialize Firebase Admin SDK if not already done
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}
const db = admin.firestore();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
    }

    const fileContent = await file.text();

    // Call the Genkit flow to process the CSV content with AI
    const processedData = await processCsvWithAI(fileContent);

    if (!processedData || processedData.length === 0) {
      return NextResponse.json({ success: false, message: 'AI could not process the file or the file is empty.' }, { status: 400 });
    }

    // Save the processed data to Firestore
    const batch = db.batch();
    let processedCount = 0;

    for (const speciesData of processedData) {
      if (!speciesData.spanishCommonName) {
        continue; // Skip records without a spanish common name
      }
      
      const id = speciesData.spanishCommonName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const docRef = db.collection('allSpeciesData').doc(id);

      // Create a complete species object with defaults
      const fullSpeciesData: Species = {
        id: id,
        spanishCommonName: speciesData.spanishCommonName,
        englishCommonName: speciesData.englishCommonName || '',
        family: speciesData.family || '',
        genus: speciesData.genus || '',
        specificEpithet: speciesData.specificEpithet || '',
        iucnStatus: (speciesData.iucnStatus as any) || 'Datos Insuficientes',
        
        // Island data
        is_darwin: speciesData.is_darwin ?? false,
        is_espanola: speciesData.is_espanola ?? false,
        is_fernandina: speciesData.is_fernandina ?? false,
        is_floreana: speciesData.is_floreana ?? false,
        is_genovesa: speciesData.is_genovesa ?? false,
        is_isabela: speciesData.is_isabela ?? false,
        is_marchena: speciesData.is_marchena ?? false,
        is_pinta: speciesData.is_pinta ?? false,
        is_pinzon: speciesData.is_pinzon ?? false,
        is_san_cristobal: speciesData.is_san_cristobal ?? false,
        is_santa_cruz: speciesData.is_santa_cruz ?? false,
        is_santa_fe: speciesData.is_santa_fe ?? false,
        is_santiago: speciesData.is_santiago ?? false,
        is_wolf: speciesData.is_wolf ?? false,

        // Default values for fields not extracted by AI
        populationTrend: 'unknown',
        spanishDescription: `Datos importados para ${speciesData.spanishCommonName}.`,
        habitat: '',
        threats: [],
        imageUrl: 'https://placehold.co/600x400.png',
        dataAiHint: speciesData.spanishCommonName.split(' ').slice(0, 2).join(' ').toLowerCase(),
        icon: 'Footprints',
        keyStats: [],
        historicalData: [],
        createdAt: new Date().toISOString(),
      };
      
      batch.set(docRef, fullSpeciesData, { merge: true }); // Use set with merge to create or update
      processedCount++;
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Successfully processed and saved ${processedCount} species to Firestore.`,
      data: {
        totalRecords: processedData.length,
        savedRecords: processedCount,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error in import-csv API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ success: false, message: `An internal server error occurred: ${errorMessage}` }, { status: 500 });
  }
}
