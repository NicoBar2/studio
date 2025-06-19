
// Using a simple in-memory array to store researchers for now.
// In a real application, this would be a database.

export type Researcher = {
  id: string;
  name: string;
  email: string;
  institution?: string;
  specialization?: string;
  isVerified: boolean;
};

let researcherList: Researcher[] = [];

// Function to generate a unique ID (simple version)
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
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
  if (!email || !email.trim().match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) { // Basic email validation
    throw new Error("Por favor, introduce un correo electrónico válido.");
  }
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 300)); 
  
  const newResearcher: Researcher = {
    id: generateId(),
    name: name.trim(),
    email: email.trim(),
    institution: institution?.trim() || undefined,
    specialization: specialization?.trim() || undefined,
    isVerified: false, // Researchers start as not verified
  };
  researcherList.push(newResearcher);
  return newResearcher;
}

export async function getAllResearchers(): Promise<Researcher[]> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  return [...researcherList]; // Return a copy
}

export async function getResearcherById(id: string): Promise<Researcher | undefined> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 50));
  return researcherList.find(researcher => researcher.id === id);
}

export async function updateResearcher(id: string, updates: Partial<Omit<Researcher, 'id'>>): Promise<Researcher | null> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const index = researcherList.findIndex(r => r.id === id);
  if (index === -1) {
    return null;
  }
  researcherList[index] = { ...researcherList[index], ...updates };
  return researcherList[index];
}

export async function deleteResearcherById(id: string): Promise<boolean> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 300));
  const initialLength = researcherList.length;
  researcherList = researcherList.filter(researcher => researcher.id !== id);
  return researcherList.length < initialLength;
}

// Helper to clear list for testing if needed, not for production
export function _clearResearchers() {
  researcherList = [];
}
