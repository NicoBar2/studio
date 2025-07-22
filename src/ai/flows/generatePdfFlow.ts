
'use server';
/**
 * @fileOverview A Genkit flow to generate a PDF report for a species.
 * This flow runs on the server and uses PDFKit to create a native PDF document.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getSpeciesByIdAction } from '@/app/actions';
import type { Species } from '@/lib/types';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import fetch from 'node-fetch';

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


async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

async function drawChart(doc: PDFKit.PDFDocument, species: Species) {
    if (!species.historicalData || species.historicalData.length === 0) {
        return; // No data to draw
    }
    
    // Check if there's enough space for the chart, add a new page if not
    if (doc.y > 450) doc.addPage();

    doc.moveDown(2);
    const chartX = 72;
    const chartY = doc.y + 270;
    
    const chartWidth = 450;
    const chartHeight = 200;
    const barGap = 10;

    const data = species.historicalData;
    const maxValue = Math.max(...data.map(d => d.value));
    const numBars = data.length;
    const barWidth = (chartWidth - (numBars - 1) * barGap) / numBars;

    doc.save();

    // Draw axis
    doc.lineWidth(0.5).moveTo(chartX, chartY).lineTo(chartX, chartY - chartHeight).stroke(); // Y-axis
    doc.lineWidth(0.5).moveTo(chartX, chartY).lineTo(chartX + chartWidth, chartY).stroke(); // X-axis

    // Draw bars and labels
    data.forEach((point, index) => {
        const barHeight = (point.value / maxValue) * chartHeight;
        const x = chartX + index * (barWidth + barGap);
        const y = chartY - barHeight;

        doc.fillColor('#3B82F6').rect(x, y, barWidth, barHeight).fill();
        
        // Year label
        doc.fillColor('#374151').fontSize(8).text(point.year.toString(), x, chartY + 5, { width: barWidth, align: 'center' });
    });

    // Y-axis labels
    doc.fillColor('#374151').fontSize(8);
    for (let i = 0; i <= 4; i++) {
        const value = (maxValue / 4) * i;
        const yPos = chartY - (value / maxValue) * chartHeight;
        doc.text(value.toLocaleString(), chartX - 45, yPos - 4, { width: 40, align: 'right' });
        doc.lineWidth(0.25).moveTo(chartX - 2, yPos).lineTo(chartX, yPos).stroke();
    }
    
    doc.fontSize(10).text(`Datos Históricos (${data[0]?.unit || ''})`, chartX, chartY - chartHeight - 20, { align: 'center', width: chartWidth });

    doc.restore();
    doc.y = chartY + 30; // Move cursor below the chart
}

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

    try {
        const doc = new PDFDocument({ margin: 72, size: 'A4' });
        const stream = new PassThrough();
        doc.pipe(stream);
        
        // Title
        doc.fontSize(24).fillColor('#2563EB').font('Helvetica-Bold').text(species.spanishCommonName, { align: 'center' });
        if (species.englishCommonName) {
            doc.fontSize(16).fillColor('#4B5563').font('Helvetica').text(species.englishCommonName, { align: 'center' });
        }
        doc.moveDown(2);

        // Image
        if (!species.imageUrl.includes('placehold.co')) {
            try {
                const imageResponse = await fetch(species.imageUrl);
                if (imageResponse.ok) {
                    const imageBuffer = await imageResponse.buffer();
                    doc.image(imageBuffer, {
                        fit: [468, 250], // width of page minus margins
                        align: 'center',
                        valign: 'center'
                    });
                    doc.moveDown(2);
                }
            } catch (imgError) {
                console.error("Could not fetch or embed image:", imgError);
            }
        }
        
        doc.fontSize(12).fillColor('#111827').font('Helvetica');

        const addSection = (title: string, content: string | string[]) => {
            if (!content || (Array.isArray(content) && content.length === 0)) return;
            // Check if there's enough space, add a new page if not
            const contentHeight = Array.isArray(content) ? content.length * 15 + 40 : doc.heightOfString(content, { width: 468 }) + 40;
            if (doc.y + contentHeight > doc.page.height - doc.page.margins.bottom) {
                doc.addPage();
            }

            doc.moveDown();
            doc.fontSize(14).fillColor('#1F2937').font('Helvetica-Bold').text(title);
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('#374151').font('Helvetica');
            if (Array.isArray(content)) {
                doc.list(content, { bulletRadius: 1.5, textIndent: 10, bulletIndent: 10 });
            } else {
                doc.text(content, { align: 'justify', width: 468 });
            }
        };

        if (options.includeDescription) {
            addSection('Descripción', species.spanishDescription);
        }
        
        // Column layout for Conservation and Habitat
        if (options.includeConservation || options.includeHabitat) {
            if (doc.y > 600) doc.addPage();
            doc.moveDown(2);
            const columnY = doc.y;
            let leftColumnHeight = 0;
            let rightColumnHeight = 0;

            if (options.includeConservation) {
                doc.fontSize(14).fillColor('#1F2937').font('Helvetica-Bold').text('Estado de Conservación', 72, columnY);
                doc.moveDown(0.5);
                const conservationText = `Estado UICN: ${species.iucnStatus}\n` +
                                       `Tendencia Poblacional: ${species.populationTrend}`;
                doc.fontSize(10).fillColor('#374151').font('Helvetica').text(conservationText, {width: 200});
                leftColumnHeight = doc.y - columnY;
            }

            if (options.includeHabitat) {
                doc.y = columnY; // Reset Y for the right column
                doc.fontSize(14).fillColor('#1F2937').font('Helvetica-Bold').text('Hábitat', 320, columnY);
                doc.moveDown(0.5);
                doc.fontSize(10).fillColor('#374151').font('Helvetica').text(species.habitat, 320, doc.y, { width: 200, align: 'justify' });
                rightColumnHeight = doc.y - columnY;
            }
            // Position cursor below the tallest column
            doc.y = columnY + Math.max(leftColumnHeight, rightColumnHeight) + 20;
        }

        if (options.includeThreats) {
            addSection('Amenazas Principales', species.threats);
        }

        // Chart
        if (options.includeChart && species.historicalData && species.historicalData.length > 0) {
            await drawChart(doc, species);
        }

        doc.end();

        const pdfBuffer = await streamToBuffer(stream);
        return { pdfBase64: pdfBuffer.toString('base64') };

    } catch (e) {
      console.error("PDF Generation Error:", e);
      return { error: 'An unexpected error occurred while generating the PDF.' };
    }
  }
);


export async function generatePdfFlow(input: GeneratePdfInput): Promise<GeneratePdfOutput> {
    return generatePdfFlowFn(input);
}
