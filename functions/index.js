const admin = require("firebase-admin");
const axios = require("axios");
const cheerio = require("cheerio");
const {parse} = require("csv-parse");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const iconv = require("iconv-lite");

admin.initializeApp();
const db = admin.firestore();

// Configuración optimizada para tiempo límite
const CONFIG = {
  MAX_EXECUTION_TIME: 480, // 8 minutos (deja 1 min de buffer)
  FILES_PER_BATCH: 3, // Archivos por lote (optimizado para tiempo)
  MAX_RECORDS_PER_FILE: 1000, // Límite de registros por archivo
  BATCH_SIZE: 200, // Documentos por batch Firestore (optimizado)
  PAUSE_BETWEEN_FILES: 500, // Pausa entre archivos (ms)
  PAUSE_BETWEEN_BATCHES: 200, // Pausa entre batches (ms)
};

const SPECIFIC_ANIMALS = [
  "Geospiza fortis", "Phoebastria irrorata", "Sula nebouxii",
  "Falco femoralis binotatus", "Spheniscus mendiculus", "Chelonoidis nigra",
  "Amblyrhynchus cristatus", "Conolophus subcristatus", 
  "Zalophus wollebaeki", "Grapsus grapsus",
];

const ISLAND_COLUMNS = [
  "Darwin", "Española", "Fernandina", "Floreana", "Genovesa", 
  "Isabela", "Marchena", "Pinta", "Pinzón", "San Cristóbal", 
  "Santa Cruz", "Santa Fé", "Santiago", "Unknown_Island", "Wolf",
];

const BIOREGION_COLUMNS = [
  "Elizabeth Bay/Bahía Elizabeth", "Far-northern/Lejano Norte",
  "Northern/Norte", "South-eastern/Centro Sur", "Western/Oeste",
  "Unknown_Bioregion",
];

// Función para guardar/recuperar progreso
async function saveProgress(sessionId, data) {
  await db.collection("scrapingProgress").doc(sessionId).set({
    ...data,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
  }, {merge: true});
}

async function getProgress(sessionId) {
  const doc = await db.collection("scrapingProgress").doc(sessionId).get();
  return doc.exists ? doc.data() : null;
}

// Función optimizada para procesar CSV rápidamente
function processCSVDataFast(records, filename) {
  console.log(`🚀 Procesamiento rápido: ${records.length} registros de ${filename}`);
  
  const processed = records.slice(0, CONFIG.MAX_RECORDS_PER_FILE).map((record, i) => {
    try {
      // Procesamiento mínimo para velocidad
      const genus = String(record.Genus || "").trim();
      const species = String(record.SpecificEpithet || "").trim();
      const scientificName = `${genus} ${species}`.trim();
      
      // Solo extraer campos esenciales
      return {
        id: scientificName.toLowerCase().replace(/\s+/g, '-'),
        ScientificName: scientificName,
        CommonNameEnglish: String(record.CommonNameEnglish || "").trim(),
        family: String(record.Family || "").trim(),
        iucnStatus: String(record.IUCNStatus || "Datos Insuficientes").trim(),
        Islands: extractIslands(record),
        Bioregions: extractBioregions(record),
        sourceFile: filename,
        recordIndex: i,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn(`⚠️ Error en registro ${i}:`, err.message);
      return null;
    }
  }).filter(Boolean);

  console.log(`✅ ${filename}: ${processed.length} registros procesados`);
  return processed;
}

// Funciones optimizadas para extraer islas y bioregiones
function extractIslands(record) {
  try {
    const active = ISLAND_COLUMNS.filter(col => {
      const val = record[col];
      return val && String(val).trim() !== "" && String(val).trim() !== "0";
    });
    return active.join(", ");
  } catch {
    return "";
  }
}

function extractBioregions(record) {
  try {
    const active = BIOREGION_COLUMNS.filter(col => {
      const val = record[col];
      return val && String(val).trim() !== "" && String(val).trim() !== "0";
    });
    return active.join(", ");
  } catch {
    return "";
  }
}

// Función optimizada para guardar en Firestore
async function saveToFirestoreFast(records, collectionName, filename) {
  if (records.length === 0) return 0;
  
  console.log(`💾 Guardado rápido: ${records.length} docs en ${collectionName} y allSpeciesData`);
  
  let saved = 0;
  
  for (let i = 0; i < records.length; i += CONFIG.BATCH_SIZE) {
    const batch = db.batch();
    const chunk = records.slice(i, i + CONFIG.BATCH_SIZE);
    
    chunk.forEach(record => {
      // Guardar en la colección específica del archivo
      const docRef = db.collection("webScrapedData")
        .doc(collectionName)
        .collection("entries")
        .doc(); // ID aleatorio
      batch.set(docRef, {
        ...record,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Guardar/Actualizar en la colección centralizada 'allSpeciesData'
      const allSpeciesRef = db.collection("allSpeciesData").doc(record.id);
      batch.set(allSpeciesRef, record, { merge: true });
    });
    
    await batch.commit();
    saved += chunk.length;
    
    if (i + CONFIG.BATCH_SIZE < records.length) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.PAUSE_BETWEEN_BATCHES));
    }
  }
  
  console.log(`✅ Guardados/Actualizados ${saved} documentos en ${collectionName} y allSpeciesData`);
  return saved;
}

// Función para procesar encoding optimizada
function quickDecode(buffer) {
  try {
    // Intentar UTF-8 primero (más común)
    const utf8 = iconv.decode(buffer, "utf8");
    if (utf8.includes(",") || utf8.includes(";")) return utf8;
    
    // Intentar UTF-16 si UTF-8 falla
    return iconv.decode(buffer, "utf16le");
  } catch {
    return iconv.decode(buffer, "latin1");
  }
}

// Función principal optimizada para tiempo
exports.scrapeDarwinData = onCall({
  timeoutSeconds: 540,
  memory: "2GiB",
}, async (request) => {
  const startTime = Date.now();
  console.log("🚀 Iniciando scraping optimizado con límite de tiempo...");
  
  const data = request.data || {};
  const sessionId = data.sessionId || `session_${Date.now()}`;
  const forceRestart = data.forceRestart || false;
  
  try {
    // Recuperar o inicializar progreso
    let progress = forceRestart ? null : await getProgress(sessionId);
    
    if (!progress) {
      console.log("📄 Obteniendo lista completa de archivos CSV...");
      
      const htmlResponse = await axios.get(
        "https://datazone.darwinfoundation.org/es/checklist/checklists-archive",
        {
          headers: {"User-Agent": "Mozilla/5.0 (compatible; Darwin-Scraper/1.0)"},
          timeout: 15000,
        }
      );
      
      const $ = cheerio.load(htmlResponse.data);
      const csvLinks = [];
      
      $("a[href$='.csv']").each((i, element) => {
        const href = $(element).attr("href");
        if (href) {
          csvLinks.push(new URL(href, htmlResponse.config.url).href);
        }
      });
      
      progress = {
        sessionId,
        totalFiles: csvLinks.length,
        csvLinks,
        processedFiles: 0,
        totalRecords: 0,
        filteredAnimals: 0,
        startedAt: new Date().toISOString(),
        status: "in_progress",
      };
      
      await saveProgress(sessionId, progress);
      console.log(`📋 Sesión iniciada: ${csvLinks.length} archivos a procesar`);
    } else {
      console.log(`🔄 Continuando sesión: ${progress.processedFiles}/${progress.totalFiles} completados`);
    }
    
    const allProcessedRecords = [];
    let filesProcessedThisBatch = 0;
    
    // Procesar archivos en lote actual
    for (let i = progress.processedFiles; i < progress.csvLinks.length; i++) {
      // Verificar tiempo límite
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed > CONFIG.MAX_EXECUTION_TIME || 
          filesProcessedThisBatch >= CONFIG.FILES_PER_BATCH) {
        console.log(`⏰ Límite alcanzado: ${elapsed}s elapsed, ${filesProcessedThisBatch} archivos en este lote`);
        break;
      }
      
      const csvUrl = progress.csvLinks[i];
      const filename = csvUrl.split("/").pop();
      
      console.log(`\n📥 [${i + 1}/${progress.totalFiles}] Procesando: ${filename}`);
      
      try {
        // Descarga optimizada
        const csvResponse = await axios.get(csvUrl, {
          responseType: "arraybuffer",
          timeout: 20000,
          maxContentLength: 25 * 1024 * 1024, // 25MB límite
        });
        
        // Procesamiento rápido
        const csvText = quickDecode(Buffer.from(csvResponse.data));
        
        // Parse rápido con límite de registros
        const records = [];
        let recordCount = 0;
        
        await new Promise((resolve, reject) => {
          const parser = parse(csvText, {
            columns: true,
            skip_empty_lines: true,
            relax_column_count: true,
            delimiter: [",", ";", "\t"],
          });
          
          parser.on("data", (record) => {
            if (recordCount < CONFIG.MAX_RECORDS_PER_FILE) {
              records.push(record);
              recordCount++;
            }
          });
          
          parser.on("error", reject);
          parser.on("end", resolve);
          
          // Timeout para parsing
          setTimeout(() => reject(new Error("Parse timeout")), 30000);
        });
        
        console.log(`📊 ${filename}: ${records.length} registros extraídos`);
        
        if (records.length > 0) {
          // Procesamiento rápido
          const processedRecords = processCSVDataFast(records, filename);
          allProcessedRecords.push(...processedRecords);
          
          // Guardado rápido
          const collectionName = `darwinData_${filename.replace(".csv", "")}`;
          await saveToFirestoreFast(processedRecords, collectionName, filename);
          
          progress.totalRecords += processedRecords.length;
        }
        
        progress.processedFiles = i + 1;
        filesProcessedThisBatch++;
        
        // Guardar progreso cada archivo
        await saveProgress(sessionId, progress);
        
        // Pausa entre archivos
        await new Promise(resolve => setTimeout(resolve, CONFIG.PAUSE_BETWEEN_FILES));
        
      } catch (fileError) {
        console.error(`❌ Error en ${filename}:`, fileError.message);
        // Continuar con siguiente archivo
        progress.processedFiles = i + 1;
        await saveProgress(sessionId, progress);
      }
    }
    
    // Filtrar animales específicos de este lote
    if (allProcessedRecords.length > 0) {
      const filtered = allProcessedRecords.filter(r => 
        SPECIFIC_ANIMALS.includes(r.ScientificName)
      );
      
      if (filtered.length > 0) {
        const batch = db.batch();
        filtered.forEach(animal => {
          const docRef = db.collection("filteredAnimals").doc();
          batch.set(docRef, {
            ...animal,
            sessionId,
            filteredAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
        await batch.commit();
        
        progress.filteredAnimals += filtered.length;
        console.log(`🐾 ${filtered.length} animales específicos guardados`);
      }
    }
    
    // Determinar si está completo o necesita continuar
    const isComplete = progress.processedFiles >= progress.totalFiles;
    
    if (isComplete) {
      progress.status = "completed";
      progress.completedAt = new Date().toISOString();
      await saveProgress(sessionId, progress);
      
      console.log("🎉 SCRAPING COMPLETADO!");
      return {
        success: true,
        status: "completed",
        sessionId,
        totalFiles: progress.totalFiles,
        totalRecords: progress.totalRecords,
        filteredAnimals: progress.filteredAnimals,
        message: "Scraping completado exitosamente",
      };
    } else {
      // Auto-continuar llamando a la función nuevamente
      console.log(`🔄 Continuando automáticamente: ${progress.processedFiles}/${progress.totalFiles}`);
      
      // Llamar a la función nuevamente de forma asíncrona
      setTimeout(async () => {
        try {
          const https = require("https");
          const postData = JSON.stringify({data: {sessionId}});
          
          const options = {
            hostname: "us-central1-galapagos-datalens.cloudfunctions.net",
            path: "/scrapeDarwinData",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(postData),
            },
          };
          
          const req = https.request(options);
          req.write(postData);
          req.end();
          
        } catch (continueError) {
          console.error("❌ Error continuando:", continueError.message);
        }
      }, 5000); // Continuar en 5 segundos
      
      return {
        success: true,
        status: "continuing",
        sessionId,
        progress: `${progress.processedFiles}/${progress.totalFiles} archivos`,
        totalRecords: progress.totalRecords,
        filteredAnimals: progress.filteredAnimals,
        nextBatch: true,
        message: `Lote completado. Procesados ${filesProcessedThisBatch} archivos en este lote.`,
      };
    }
    
  } catch (error) {
    console.error("💥 Error general:", error);
    
    // Guardar error en progreso
    if (sessionId) {
      await saveProgress(sessionId, {
        status: "error",
        error: error.message,
        errorAt: new Date().toISOString(),
      });
    }
    
    throw new HttpsError("internal", "Error en scraping", error.message);
  }
});

// Función para verificar progreso de una sesión
exports.checkScrapingProgress = onCall(async (request) => {
  const sessionId = request.data.sessionId;
  
  if (!sessionId) {
    // Si no se proporciona sessionId, busca la última sesión.
    const snapshot = await db.collection("scrapingProgress")
                            .orderBy("startedAt", "desc")
                            .limit(1)
                            .get();
    if (snapshot.empty) {
      throw new HttpsError("not-found", "No se encontraron sesiones de scraping.");
    }
    const latestProgress = snapshot.docs[0].data();
    return {
      success: true,
      ...latestProgress,
      progressPercentage: Math.round((latestProgress.processedFiles / latestProgress.totalFiles) * 100),
    };
  }
  
  const progress = await getProgress(sessionId);
  if (!progress) {
    throw new HttpsError("not-found", "Sesión no encontrada");
  }
  
  return {
    success: true,
    ...progress,
    progressPercentage: Math.round((progress.processedFiles / progress.totalFiles) * 100),
  };
});

// Función para reiniciar scraping
exports.restartScraping = onCall(async (request) => {
  const sessionId = request.data.sessionId || `session_${Date.now()}`;
  
  // Eliminar progreso anterior si existe
  try {
    await db.collection("scrapingProgress").doc(sessionId).delete();
  } catch {}
  
  console.log(`🔄 Reiniciando scraping con sesión: ${sessionId}`);
  
  return {
    success: true,
    sessionId,
    message: "Scraping reiniciado. Ejecuta scrapeDarwinData con este sessionId.",
  };
});
