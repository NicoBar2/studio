
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { parse } from 'csv-parse/sync';
import iconv from 'iconv-lite';
import fetch from 'node-fetch';

// Simple in-memory store for task progress. In a real production scenario,
// this should be replaced with a more robust solution like Redis, a database, or Firestore.
type TaskStatus = 'pending' | 'processing' | 'completed' | 'error';
interface Task {
  id: string;
  status: TaskStatus;
  searchTerm: string;
  startTime: number;
  endTime?: number;
  filesProcessed: number;
  totalFiles: number;
  results: any[];
  error?: string;
}
const taskStore: Map<string, Task> = new Map();


// --- Helper Functions ---

/**
 * Processes a CSV text to find records matching a search term.
 * This version is more robust and intelligently finds relevant columns.
 * @param csvText The raw text content of the CSV file.
 * @param searchTerm The term to search for.
 * @returns An array of found records.
 */
function processCsv(csvText: string, searchTerm: string): any[] {
    const lowercasedTerm = searchTerm.toLowerCase();
    try {
        const records: any[] = parse(csvText, {
            columns: true,
            skip_empty_lines: true,
            relax_column_count: true,
        });

        if (records.length === 0) return [];
        
        // Intelligently find column names
        const header = Object.keys(records[0]);
        const findColumn = (keywords: string[]) => 
            header.find(h => keywords.some(k => h.toLowerCase().includes(k)));

        const scientificNameCol = findColumn(['scientificname', 'scientific_name', 'taxon']);
        const genusCol = findColumn(['genus']);
        const epithetCol = findColumn(['specificepithet', 'epithet']);
        const commonNameCol = findColumn(['common', 'vernacular']);
        const familyCol = findColumn(['family']);
        const iucnCol = findColumn(['iucn']);

        return records.filter(record => {
             // Search in all available values for a match
            return Object.values(record).some(value => 
                String(value).toLowerCase().includes(lowercasedTerm)
            );
        }).map(record => {
            // Construct a structured result from what we found
            let scientificName = (scientificNameCol ? record[scientificNameCol] : '') || '';
            if (!scientificName && genusCol && epithetCol) {
                scientificName = `${record[genusCol] || ''} ${record[epithetCol] || ''}`.trim();
            }

            return {
                scientificName: scientificName || 'N/A',
                commonName: (commonNameCol ? record[commonNameCol] : '') || 'N/A',
                family: (familyCol ? record[familyCol] : '') || 'N/A',
                iucnStatus: (iucnCol ? record[iucnCol] : '') || 'N/A',
            };
        });

    } catch(e) {
        console.warn('Skipping CSV due to parsing error:', e);
        return [];
    }
}


// Function to run the search task asynchronously
async function runSearchTask(taskId: string) {
  const task = taskStore.get(taskId);
  if (!task) return;

  try {
    // 1. Get the list of all CSV files
    console.log(`[${taskId}] Fetching CSV links...`);
    const htmlResponse = await fetch("https://datazone.darwinfoundation.org/es/checklist/checklists-archive", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!htmlResponse.ok) {
        throw new Error(`Failed to fetch checklist page: ${htmlResponse.statusText}`);
    }
    const html = await htmlResponse.text();
    
    const $ = cheerio.load(html);
    const csvLinks: string[] = [];
    $("a[href$='.csv']").each((_, element) => {
      const href = $(element).attr("href");
      if (href) csvLinks.push(new URL(href, "https://datazone.darwinfoundation.org/").href);
    });

    task.status = 'processing';
    task.totalFiles = csvLinks.length;
    console.log(`[${taskId}] Found ${task.totalFiles} files. Starting processing.`);

    // 2. Process each file
    for (const link of csvLinks) {
      if (!taskStore.has(taskId)) break; // Task was cancelled/removed

      try {
        const csvResponse = await fetch(link);
        if (!csvResponse.ok) {
            console.warn(`[${taskId}] Skipping file ${link} due to non-OK response: ${csvResponse.statusText}`);
            continue;
        }
        const buffer = await csvResponse.buffer();
        const csvText = iconv.decode(buffer, "utf-8"); // Assume UTF-8, if fails it's handled by catch
        const foundRecords = processCsv(csvText, task.searchTerm);
        
        if (foundRecords.length > 0) {
          task.results.push(...foundRecords);
        }
      } catch (fileError: any) {
        console.warn(`[${taskId}] Skipping file ${link} due to error: ${fileError.message}`);
      } finally {
          task.filesProcessed += 1;
      }
    }

    // 3. Complete the task
    task.status = 'completed';
    task.endTime = Date.now();
    console.log(`[${taskId}] Task completed. Found ${task.results.length} total results.`);

  } catch (error: any) {
    console.error(`[${taskId}] Task failed:`, error);
    task.status = 'error';
    task.error = error.message;
    task.endTime = Date.now();
  }
}


// --- Route Handlers ---

/**
 * POST /api/darwin-consult
 * Starts a new search task.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { searchTerm } = body;

    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 3) {
      return NextResponse.json({ error: 'searchTerm is required and must be at least 3 characters long' }, { status: 400 });
    }

    const taskId = `task_${Date.now()}`;
    const newTask: Task = {
      id: taskId,
      status: 'pending',
      searchTerm: searchTerm.trim(),
      startTime: Date.now(),
      filesProcessed: 0,
      totalFiles: 0,
      results: [],
    };
    taskStore.set(taskId, newTask);

    // Start the task asynchronously without awaiting it
    runSearchTask(taskId);

    // Immediately respond to the client
    const statusUrl = new URL(request.url);
    statusUrl.pathname = '/api/darwin-consult'; // Ensure correct path
    statusUrl.searchParams.set('taskId', taskId);

    return NextResponse.json({
      message: 'Search task started.',
      taskId: taskId,
      statusUrl: statusUrl.toString(),
    }, { status: 202 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Invalid request body', details: error.message }, { status: 400 });
  }
}

/**
 * GET /api/darwin-consult
 * Retrieves the status and results of a search task.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({ error: 'taskId parameter is required' }, { status: 400 });
  }

  const task = taskStore.get(taskId);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const response = {
    taskId: task.id,
    status: task.status,
    progress: task.totalFiles > 0 ? (task.filesProcessed / task.totalFiles) : 0,
    filesProcessed: task.filesProcessed,
    totalFiles: task.totalFiles,
    runtimeSeconds: ((task.endTime || Date.now()) - task.startTime) / 1000,
    results: task.status === 'completed' || task.status === 'error' ? task.results : undefined,
    error: task.error,
  };
  
  // Clean up completed or errored tasks after some time to free memory
  if (task.status === 'completed' || task.status === 'error') {
      setTimeout(() => taskStore.delete(taskId), 300000); // 5 minutes
  }

  return NextResponse.json(response);
}
