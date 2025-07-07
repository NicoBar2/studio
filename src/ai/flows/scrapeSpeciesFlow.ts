
'use server';
/**
 * @fileOverview A Genkit flow to scrape and structure data for a new species.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ConservationStatus, Species } from '@/lib/types';

// Define the schema for the data we want the AI to find and structure.
// This is a subset of the full Species type, containing fields that AI can reasonably find.
const ScrapedSpeciesDataSchema = z.object({
  spanishCommonName: z.string().describe("El nombre común en español de la especie."),
  englishCommonName: z.string().describe("El nombre común en inglés de la especie."),
  genus: z.string().describe("El género taxonómico de la especie."),
  specificEpithet: z.string().describe("El epíteto específico taxonómico de la especie."),
  spanishDescription: z.string().describe("Una descripción detallada de la especie en español (2-3 frases)."),
  habitat: z.string().describe("El hábitat primario de la especie."),
  iucnStatus: z.enum([
    'En Peligro Crítico',
    'En Peligro',
    'Vulnerable',
    'Casi Amenazada',
    'Preocupación Menor',
    'Datos Insuficientes'
  ]).describe("El estado de conservación oficial de la UICN. Usa 'Datos Insuficientes' si es desconocido."),
  populationTrend: z.enum([
      'increasing', 'decreasing', 'stable', 'unknown'
  ]).describe("La tendencia poblacional actual (creciente, decreciente, estable o desconocida)."),
  threats: z.array(z.string()).describe("Una lista de las 3-4 principales amenazas para la especie."),
  keyStats: z.array(z.object({
    label: z.string().describe("La etiqueta para una estadística clave (ej., 'Peso Promedio', 'Envergadura')."),
    value: z.union([z.string(), z.number()]).describe("El valor de la estadística."),
    unit: z.string().optional().describe("La unidad para la estadística (ej., 'kg', 'm').")
  })).describe("Una lista de 2-3 estadísticas clave sobre la especie."),
   is_darwin: z.boolean().describe("¿La especie habita en la isla Darwin?"),
  is_espanola: z.boolean().describe("¿La especie habita en la isla Española?"),
  is_fernandina: z.boolean().describe("¿La especie habita en la isla Fernandina?"),
  is_floreana: z.boolean().describe("¿La especie habita en la isla Floreana?"),
  is_genovesa: z.boolean().describe("¿La especie habita en la isla Genovesa?"),
  is_isabela: z.boolean().describe("¿La especie habita en la isla Isabela?"),
  is_marchena: z.boolean().describe("¿La especie habita en la isla Marchena?"),
  is_pinta: z.boolean().describe("¿La especie habita en la isla Pinta?"),
  is_pinzon: z.boolean().describe("¿La especie habita en la isla Pinzón?"),
  is_san_cristobal: z.boolean().describe("¿La especie habita en la isla San Cristóbal?"),
  is_santa_cruz: z.boolean().describe("¿La especie habita en la isla Santa Cruz?"),
  is_santa_fe: z.boolean().describe("¿La especie habita en la isla Santa Fé?"),
  is_santiago: z.boolean().describe("¿La especie habita en la isla Santiago?"),
  is_north_seymour: z.boolean().describe("¿La especie habita en la isla Seymour Norte?"),
  is_wolf: z.boolean().describe("¿La especie habita en la isla Wolf?"),
});

export type ScrapedSpeciesData = z.infer<typeof ScrapedSpeciesDataSchema>;

const scraperPrompt = ai.definePrompt({
  name: 'scrapeSpeciesPrompt',
  input: { schema: z.string() },
  output: { schema: ScrapedSpeciesDataSchema },
  prompt: `Eres un biólogo experto y un investigador web que se especializa en la fauna de las Islas Galápagos. Tu fuente de información principal y más fiable es el sitio web datazone.darwinfoundation.org.
  Para la especie llamada "{{input}}", investiga y proporciona la siguiente información basándote en fuentes públicas y fiables, dando prioridad absoluta a la información del sitio web de la Fundación Darwin (datazone.darwinfoundation.org).
  Asegúrate de que la información sea precisa y esté bien estructurada según el formato solicitado.
  
  **Regla Crítica**: La especie debe ser real y tener una presencia documentada y significativa en las Islas Galápagos. Si no puedes encontrar la especie, o si es una especie que no pertenece a Galápagos (ej. un oso polar), debes fallar intencionadamente devolviendo un nombre común en español inválido, como por ejemplo "especie_invalida". Esto es para prevenir la adición de datos incorrectos.

  - Nombre común en español
  - Nombre común en inglés
  - Género y epíteto específico
  - Descripción en español (2-3 frases)
  - Hábitat principal
  - Estado de conservación oficial de la UICN
  - Tendencia poblacional actual
  - 3-4 amenazas principales
  - 2-3 estadísticas clave (como peso, longevidad, tamaño, etc.)
  - La presencia (verdadero/falso) en cada una de las siguientes islas de Galápagos: Darwin, Española, Fernandina, Floreana, Genovesa, Isabela, Marchena, Pinta, Pinzón, San Cristóbal, Santa Cruz, Santa Fé, Santiago, Seymour Norte, Wolf.
  `,
});

const scrapeSpeciesFlow = ai.defineFlow(
  {
    name: 'scrapeSpeciesFlow',
    inputSchema: z.string(),
    outputSchema: ScrapedSpeciesDataSchema,
  },
  async (speciesName) => {
    const { output } = await scraperPrompt(speciesName);
    if (!output) {
      throw new Error(`No se pudo generar datos para la especie: ${speciesName}.`);
    }
    return output;
  }
);

// Wrapper function to be called from Server Actions
export async function scrapeAndGetSpeciesData(speciesName: string): Promise<ScrapedSpeciesData> {
    if (!speciesName || speciesName.trim().length < 3) {
        throw new Error("El nombre de la especie es demasiado corto.");
    }
    return scrapeSpeciesFlow(speciesName.trim());
}
