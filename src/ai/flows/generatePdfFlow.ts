
'use server';
/**
 * @fileOverview A Genkit flow to generate a PDF report for a species using Puppeteer.
 * This approach renders an HTML page in a headless browser and prints it to PDF,
 * ensuring high fidelity and avoiding server-side canvas/font rendering issues.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getSpeciesByIdAction } from '@/app/actions';
import type { Species, HistoricalDataPoint } from '@/lib/types';
import puppeteer from 'puppeteer';
import { getTranslations } from '@/lib/translations';

const PdfOptionsSchema = z.object({
  includeDescription: z.boolean().default(true),
  includeConservation: z.boolean().default(true),
  includeHabitat: z.boolean().default(true),
  includeThreats: z.boolean().default(true),
  includeChart: z.boolean().default(true),
  includeDistribution: z.boolean().default(true),
});
export type PdfOptions = z.infer<typeof PdfOptionsSchema>;


const GeneratePdfInputSchema = z.object({
  speciesId: z.string().describe('The ID of the species.'),
  options: PdfOptionsSchema,
});
export type GeneratePdfInput = z.infer<typeof GeneratePdfInputSchema>;

const GeneratePdfOutputSchema = z.object({
  pdfBase64: z.string().optional().describe('The generated PDF as a Base64 string.'),
  error: z.string().optional().describe('An error message if generation failed.'),
});
export type GeneratePdfOutput = z.infer<typeof GeneratePdfOutputSchema>;


const generateHtmlForPdf = (species: Species, options: PdfOptions): string => {
    const t = getTranslations('es');
    const presentOnIslands = Object.keys(species)
      .filter(key => key.startsWith('is_') && species[key as keyof Species])
      .map(key => key.substring(3).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

    const chartData = (species.historicalData || [])
        .map(d => `[${d.year}, ${d.value}]`)
        .join(',');
        
    const chartUnit = species.historicalData?.[0]?.unit || '';

    // A self-contained HTML document with inline styles and a simple chart script
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Informe de Especie: ${species.spanishCommonName}</title>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 40px; color: #333; }
                .container { max-width: 800px; margin: auto; }
                h1, h2 { color: #2563EB; font-weight: bold; border-bottom: 2px solid #E5E7EB; padding-bottom: 5px; }
                h1 { font-size: 28px; text-align: center; }
                h2 { font-size: 20px; margin-top: 30px; }
                p, ul { line-height: 1.6; }
                ul { padding-left: 20px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; }
                .badge { display: inline-block; padding: 3px 10px; font-size: 12px; font-weight: 600; border-radius: 12px; background-color: #E5E7EB; color: #374151; }
                .badge.destructive { background-color: #FEE2E2; color: #991B1B; }
                .page-break { page-break-after: always; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>${species.spanishCommonName}</h1>
                <p style="text-align:center; font-style:italic; font-size: 18px; margin-top: -10px;">${species.genus} ${species.specificEpithet}</p>

                ${options.includeDescription ? `
                <section>
                    <h2>${t.speciesDescription}</h2>
                    <p>${species.spanishDescription}</p>
                </section>
                ` : ''}
                
                <div class="grid">
                    ${options.includeConservation ? `
                    <div class="card">
                        <h3><strong>${t.conservationAndPopulation}</strong></h3>
                        <p><strong>${t.iucnStatus}:</strong> <span class="badge ${species.iucnStatus.includes('Peligro') ? 'destructive' : ''}">${species.iucnStatus}</span></p>
                        <p><strong>${t.populationTrend}:</strong> ${species.populationTrend}</p>
                    </div>
                    ` : ''}

                    ${options.includeHabitat ? `
                    <div class="card">
                        <h3><strong>${t.habitat}</strong></h3>
                        <p>${species.habitat}</p>
                    </div>
                    ` : ''}
                </div>

                ${options.includeThreats ? `
                <section>
                    <h2>${t.mainThreats}</h2>
                    <ul>
                        ${species.threats.map(threat => `<li>${threat}</li>`).join('')}
                    </ul>
                </section>
                ` : ''}

                ${options.includeDistribution ? `
                <section>
                    <h2>${t.geographicDistribution}</h2>
                    <p>${presentOnIslands.join(', ')}</p>
                </section>
                ` : ''}

                ${(options.includeChart && species.historicalData && species.historicalData.length > 0) ? `
                <section style="margin-top: 30px;" class="page-break-before">
                    <h2>${t.historicalDataVisualization}</h2>
                    <canvas id="historicalChart" width="800" height="400"></canvas>
                    <script>
                        const ctx = document.getElementById('historicalChart').getContext('2d');
                        const data = [${chartData}];
                        new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: data.map(row => row[0]),
                                datasets: [{
                                    label: '${chartUnit}',
                                    data: data.map(row => row[1]),
                                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                    borderColor: 'rgba(54, 162, 235, 1)',
                                    borderWidth: 1
                                }]
                            },
                            options: {
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                },
                                responsive: true,
                                maintainAspectRatio: false
                            }
                        });
                    </script>
                </section>
                ` : ''}
            </div>
        </body>
        </html>
    `;
};


const generatePdfFlowFn = ai.defineFlow(
  {
    name: 'generatePdfFlow',
    inputSchema: GeneratePdfInputSchema,
    outputSchema: GeneratePdfOutputSchema,
  },
  async ({ speciesId, options }) => {
    const species = await getSpeciesByIdAction(speciesId);

    if (!species) {
      return { error: 'Species not found' };
    }

    let browser = null;
    try {
        console.log("Launching Puppeteer...");
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        
        console.log("Puppeteer launched. Opening new page.");
        const page = await browser.newPage();
        
        const htmlContent = generateHtmlForPdf(species, options);
        
        console.log("Setting content and generating PDF...");
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm',
            },
        });
        
        console.log("PDF generated successfully.");
        return { pdfBase64: pdfBuffer.toString('base64') };

    } catch (e: any) {
      console.error("Puppeteer/PDF Generation Error:", e);
      return { error: `An unexpected error occurred while generating the PDF: ${e.message}` };
    } finally {
        if (browser) {
            console.log("Closing Puppeteer browser.");
            await browser.close();
        }
    }
  }
);


export async function generatePdfFlow(input: GeneratePdfInput): Promise<GeneratePdfOutput> {
    return generatePdfFlowFn(input);
}
