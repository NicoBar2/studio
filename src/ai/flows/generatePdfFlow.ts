
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

const GeneratePdfInputSchema = z.string().describe('The ID of the species.');
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
  async (speciesId) => {
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
        
        // Sections
        doc.fontSize(12).fillColor('#111827').font('Helvetica');

        const addSection = (title: string, content: string | string[]) => {
            if (doc.y > 650) doc.addPage();
            doc.moveDown();
            doc.fontSize(14).fillColor('#1F2937').font('Helvetica-Bold').text(title);
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('#374151').font('Helvetica');
            if (Array.isArray(content)) {
                doc.list(content, { bulletRadius: 1.5 });
            } else {
                doc.text(content, { align: 'justify' });
            }
        };

        addSection('Descripción', species.spanishDescription);
        
        if (doc.y > 500) doc.addPage();
        
        // Stats and Status in two columns
        const columnY = doc.y;
        doc.fontSize(14).fillColor('#1F2937').font('Helvetica-Bold').text('Estado de Conservación');
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#374151').font('Helvetica')
            .text(`Estado UICN: ${species.iucnStatus}`)
            .text(`Tendencia Poblacional: ${species.populationTrend}`);

        doc.y = columnY;
        doc.fontSize(14).fillColor('#1F2937').font('Helvetica-Bold').text('Hábitat', 300, columnY);
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#374151').font('Helvetica').text(species.habitat, 300, doc.y, { width: 200, align: 'justify' });
        
        doc.y = Math.max(doc.y, columnY + 60);

        if (species.threats && species.threats.length > 0) {
            addSection('Amenazas Principales', species.threats);
        }

        // Chart
        if (species.historicalData && species.historicalData.length > 0) {
            if (doc.y > 400) doc.addPage();
            doc.moveDown(2);
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


export async function generatePdfFlow(speciesId: string): Promise<GeneratePdfOutput> {
    return generatePdfFlowFn(speciesId);
}
