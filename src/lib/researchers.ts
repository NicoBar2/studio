
// Using a simple in-memory array to store researchers for now.
// In a real application, this would be a database.

export type Researcher = {
  id: string;
  name: string;
};

let researcherList: Researcher[] = [];

// Function to generate a unique ID (simple version)
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export async function addResearcher(name: string): Promise<Researcher> {
  if (!name || name.trim() === "") {
    throw new Error("El nombre del investigador no puede estar vacío.");
  }
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 300)); 
  
  const newResearcher: Researcher = {
    id: generateId(),
    name: name.trim(),
  };
  researcherList.push(newResearcher);
  return newResearcher;
}

export async function getAllResearchers(): Promise<Researcher[]> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  return [...researcherList]; // Return a copy
}

// Helper to clear list for testing if needed, not for production
export function _clearResearchers() {
  researcherList = [];
}
