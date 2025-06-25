
import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export type Researcher = {
  id: string;
  name: string;
  email: string;
  institution?: string;
  specialization?: string;
  isVerified: boolean;
  password?: string; // Can be a hashed password
};

// Path to the JSON file database
const researchersDbPath = path.join(process.cwd(), 'src', 'lib', 'data', 'researchers.json');

// Helper to read data from the JSON file
async function readResearchers(): Promise<Researcher[]> {
    try {
        // Check if the file exists
        await fs.access(researchersDbPath);
        const data = await fs.readFile(researchersDbPath, 'utf-8');
        // Handle case where file is empty
        return data ? JSON.parse(data) : [];
    } catch (error) {
        // If file doesn't exist, it's the first run. Create it with an empty array.
        await writeResearchers([]);
        return [];
    }
}

// Helper to write data to the JSON file
async function writeResearchers(data: Researcher[]): Promise<void> {
    try {
        await fs.writeFile(researchersDbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Failed to write researchers data:', error);
    }
}

// Function to generate a unique ID (simple version)
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export async function addResearcher(
  name: string,
  email: string,
  institution?: string,
  specialization?: string
): Promise<Researcher> {
  if (!name || name.trim() === "") {
    throw new Error("El nombre del investigador no puede estar vacío.");
  }
  if (!email || !email.trim().match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
    throw new Error("Por favor, introduce un correo electrónico válido.");
  }
  
  const researchers = await readResearchers();
  const lowerCaseEmail = email.trim().toLowerCase();

  // Check if email already exists
  if (researchers.some(r => r.email === lowerCaseEmail)) {
    throw new Error("Ya existe un investigador con este correo electrónico.");
  }

  const newResearcher: Researcher = {
    id: generateId(),
    name: name.trim(),
    email: lowerCaseEmail,
    institution: institution?.trim() || undefined,
    specialization: specialization?.trim() || undefined,
    isVerified: false,
  };
  
  researchers.push(newResearcher);
  await writeResearchers(researchers);
  return newResearcher;
}

export async function getAllResearchers(): Promise<Researcher[]> {
  const researchers = await readResearchers();
  return [...researchers].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getResearcherById(id: string): Promise<Researcher | undefined> {
  const researchers = await readResearchers();
  return researchers.find(researcher => researcher.id === id);
}

export async function getResearcherByEmail(email: string): Promise<Researcher | undefined> {
  const researchers = await readResearchers();
  return researchers.find(researcher => researcher.email === email.toLowerCase());
}

export async function updateResearcher(id: string, updates: Partial<Omit<Researcher, 'id' | 'password'>>): Promise<Researcher | null> {
  const researchers = await readResearchers();
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
  await writeResearchers(researchers);
  return researchers[index];
}

export async function setResearcherPassword(email: string, passwordToSet: string): Promise<Researcher | null> {
  const researchers = await readResearchers();
  const researcherEmail = email.toLowerCase();
  const index = researchers.findIndex(r => r.email === researcherEmail);
  if (index === -1) {
    return null; // Researcher not found
  }
  
  // Hash the password before saving
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(passwordToSet, saltRounds);
  researchers[index].password = hashedPassword;
  
  await writeResearchers(researchers);
  return researchers[index];
}

export async function deleteResearcherById(id: string): Promise<boolean> {
  let researchers = await readResearchers();
  const initialLength = researchers.length;
  researchers = researchers.filter(researcher => researcher.id !== id);
  if (researchers.length < initialLength) {
    await writeResearchers(researchers);
    return true;
  }
  return false;
}
