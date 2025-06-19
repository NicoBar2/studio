
// Using a simple in-memory array to store researchers for now.
// In a real application, this would be a database.

export type Researcher = {
  id: string;
  name: string;
  email: string;
  institution?: string;
  specialization?: string;
  isVerified: boolean;
  password?: string; // Added password field
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
    email: email.trim().toLowerCase(), // Store email in lowercase for consistent lookup
    institution: institution?.trim() || undefined,
    specialization: specialization?.trim() || undefined,
    isVerified: false, // Researchers start as not verified
    // Password is not set on creation
  };
  // Check if email already exists
  if (researcherList.some(r => r.email === newResearcher.email)) {
    throw new Error("Ya existe un investigador con este correo electrónico.");
  }
  researcherList.push(newResearcher);
  return newResearcher;
}

export async function getAllResearchers(): Promise<Researcher[]> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  return [...researcherList].sort((a, b) => a.name.localeCompare(b.name)); // Return sorted copy
}

export async function getResearcherById(id: string): Promise<Researcher | undefined> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 50));
  return researcherList.find(researcher => researcher.id === id);
}

export async function getResearcherByEmail(email: string): Promise<Researcher | undefined> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 50));
  return researcherList.find(researcher => researcher.email === email.toLowerCase());
}

export async function updateResearcher(id: string, updates: Partial<Omit<Researcher, 'id' | 'password'>>): Promise<Researcher | null> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const index = researcherList.findIndex(r => r.id === id);
  if (index === -1) {
    return null;
  }
  
  const currentResearcher = researcherList[index];
  // Ensure email is handled correctly if updated
  if (updates.email && updates.email !== currentResearcher.email) {
    const newEmail = updates.email.toLowerCase();
    if (researcherList.some(r => r.email === newEmail && r.id !== id)) {
      throw new Error("Otro investigador ya usa este correo electrónico.");
    }
    updates.email = newEmail;
  }

  researcherList[index] = { ...currentResearcher, ...updates };
  return researcherList[index];
}

export async function setResearcherPassword(email: string, passwordToSet: string): Promise<Researcher | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const researcherEmail = email.toLowerCase();
  const index = researcherList.findIndex(r => r.email === researcherEmail);
  if (index === -1) {
    return null; // Researcher not found
  }
  // In a real app, hash the password here before saving
  researcherList[index].password = passwordToSet;
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
// Initialize with a verified researcher for testing
// _clearResearchers();
// addResearcher('Dr. Verified Researcher', 'researcher@galapagos.com', 'Galapagos Institute', 'Marine Biology')
//   .then(researcher => updateResearcher(researcher.id, { isVerified: true }))
//   .catch(console.error);
// addResearcher('Dr. Unverified Researcher', 'unverified@galapagos.com', 'Local University', 'Ornithology')
//   .catch(console.error);

