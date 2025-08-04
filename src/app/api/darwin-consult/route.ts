
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { parse } from 'csv-parse/sync';
import iconv from 'iconv-lite';
import fetch from 'node-fetch';
import { extractSpeciesInfo } from '@/ai/flows/extractSpeciesInfoFlow';

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
    console.log(`[${taskId}] Found ${task.totalFiles} files. Starting AI-powered processing.`);

    // 2. Process each file using the AI flow
    const processingPromises = csvLinks.map(async (link) => {
        if (!taskStore.has(taskId)) return; // Task was cancelled/removed

        try {
            const csvResponse = await fetch(link);
            if (!csvResponse.ok) {
                console.warn(`[${taskId}] Skipping file ${link} due to non-OK response: ${csvResponse.statusText}`);
                return;
            }
            const buffer = await csvResponse.buffer();
            const csvText = iconv.decode(buffer, "utf-8");
            
            // Call the AI flow to extract information
            const foundRecords = await extractSpeciesInfo({
                searchTerm: task.searchTerm,
                csvText: csvText,
            });
            
            if (foundRecords.length > 0) {
              task.results.push(...foundRecords);
            }
        } catch (fileError: any) {
            console.warn(`[${taskId}] Skipping file ${link} due to error: ${fileError.message}`);
        } finally {
            task.filesProcessed += 1;
        }
    });

    // We can process files in parallel up to a certain limit to speed things up
    const concurrencyLimit = 5;
    for (let i = 0; i < processingPromises.length; i += concurrencyLimit) {
        const batch = processingPromises.slice(i, i + concurrencyLimit);
        await Promise.all(batch);
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
