
"use client";

import { type Species } from '@/lib/types';
import { getSpeciesImageUrl, GALAPAGOS_ISLANDS_NAMES } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useTransition, useRef } from 'react';
import { getAISummary } from '@/app/actions';
import { 
  AlertCircle, Brain, Edit, BarChart2, Tag, TrendingUp, ShieldAlert, Home, ListChecks, Download,
  Turtle, Bird, Footprints, ShieldQuestion, Waves, Bug, type LucideIcon, HelpCircle, Sigma, MapPin, LoaderCircle, CalendarClock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import PDFDocument from 'pdfkit';
import blobStream from 'blob-stream';
import html2canvas from 'html2canvas';


const SpeciesDataChart = dynamic(() => import('@/components/charts/SpeciesDataChart'), {
  loading: () => (
    <div className="min-h-[300px] flex items-center justify-center">
      <p>Cargando gráfico...</p>
    </div>
  ),
  ssr: false
});


type SpeciesDetailClientProps = {
  species: Species;
};

const iconMap: Record<string, LucideIcon> = {
  Turtle,
  Bird,
  Footprints,
  ShieldQuestion,
  Waves,
  Bug,
  Default: HelpCircle,
};

const populationTrendTranslations: Record<"es" | "en", Record<Species['populationTrend'], string>> = {
  es: {
    increasing: 'Creciente',
    decreasing: 'Decreciente',
    stable: 'Estable',
    unknown: 'Desconocida',
  },
  en: {
    increasing: 'Increasing',
    decreasing: 'Decreasing',
    stable: 'Stable',
    unknown: 'Unknown',
  }
};

async function fetchImageAsBuffer(url: string): Promise<ArrayBuffer | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const buffer = await response.arrayBuffer();
        return buffer;
    } catch (e) {
        console.error("Error fetching image for PDF:", e);
        return null;
    }
}


export default function SpeciesDetailClient({ species }: SpeciesDetailClientProps) {
  const { role } = useAuth();
  const { language, t } = useLanguage();
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSummaryPending, startSummaryTransition] = useTransition();
  const [isPdfPending, startPdfTransition] = useTransition();
  const chartCardRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  
  const IconComponent = iconMap[species.icon] || iconMap.Default;
  const speciesName = t.getSpeciesName(species, language);
  const speciesDescription = t.getSpeciesDescription(species, language);
  const scientificName = `${species.genus || ''} ${species.specificEpithet || ''}`.trim();


  const handleGenerateSummary = () => {
    startSummaryTransition(async () => {
      setError(null);
      setSummary(null);
      const result = await getAISummary(species.id);
      if (result.summary) {
        setSummary(result.summary);
      } else {
        setError(result.error || "Ocurrió un error desconocido.");
      }
    });
  };

  const handleDownloadPdf = () => {
    startPdfTransition(async () => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 72, right: 72 },
        layout: 'portrait',
        info: {
          Title: `${species.spanishCommonName} Report`,
          Author: 'Galápagos DataLens',
        }
      });
      const stream = doc.pipe(blobStream());

      // --- PDF Content ---
      doc.fontSize(24).font('Helvetica-Bold').text(species.spanishCommonName, { align: 'center' });
      if (scientificName) {
        doc.fontSize(14).font('Helvetica-Oblique').text(scientificName, { align: 'center' });
      }
      doc.moveDown(2);

      // --- Image ---
      const imageUrl = getSpeciesImageUrl(species);
      const imageBuffer = await fetchImageAsBuffer(imageUrl);
      if (imageBuffer) {
        doc.image(imageBuffer, {
          fit: [450, 250],
          align: 'center',
          valign: 'center'
        });
        doc.moveDown(2);
      }

      // --- Description Section ---
      doc.fontSize(16).font('Helvetica-Bold').text('Descripción', { underline: true }).moveDown(0.5);
      doc.fontSize(11).font('Helvetica').text(species.spanishDescription || 'N/A', { align: 'justify' });
      doc.moveDown(1.5);

      // --- Details Section ---
      const addDetail = (label: string, value: string | undefined) => {
          if (!value) return;
          doc.fontSize(11).font('Helvetica-Bold').text(`${label}: `, { continued: true }).font('Helvetica').text(value);
          doc.moveDown(0.5);
      }

      addDetail('Estado UICN', species.iucnStatus);
      addDetail('Tendencia Poblacional', displayPopulationTrend);
      addDetail('Hábitat Principal', species.habitat);
      doc.moveDown(1);
      
      // --- Key Stats ---
      if(species.keyStats && species.keyStats.length > 0) {
        doc.fontSize(16).font('Helvetica-Bold').text('Estadísticas Clave', { underline: true }).moveDown(0.5);
        species.keyStats.forEach(stat => {
            doc.fontSize(11).font('Helvetica').list([`${stat.label}: ${stat.value} ${stat.unit || ''}`], { bulletRadius: 1.5 });
        });
        doc.moveDown(1.5);
      }

      // --- Threats ---
      if(species.threats && species.threats.length > 0) {
        doc.fontSize(16).font('Helvetica-Bold').text('Amenazas Principales', { underline: true }).moveDown(0.5);
        doc.fontSize(11).font('Helvetica').list(species.threats, { bulletRadius: 1.5 });
        doc.moveDown(1.5);
      }

      // --- Distribution ---
       const presentOnIslands = GALAPAGOS_ISLANDS_NAMES
          .map(islandName => ({ name: islandName, present: species[`is_${islandName.toLowerCase().replace(/ /g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}` as keyof Species] }))
          .filter(island => island.present);
          
      if(presentOnIslands.length > 0) {
          doc.fontSize(16).font('Helvetica-Bold').text('Distribución Geográfica', { underline: true }).moveDown(0.5);
          const islandList = presentOnIslands.map(i => i.name).join(', ');
          doc.fontSize(11).font('Helvetica').text(islandList);
          doc.moveDown(1.5);
      }
      
      // --- Historical Data Chart ---
      const chartElement = chartCardRef.current;
      const shouldRenderChart = (role === 'researcher' || role === 'admin' || species.showHistoricalDataToPublic) && species.historicalData && species.historicalData.length > 0;

      if(shouldRenderChart && chartElement) {
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold').text('Visualización de Datos Históricos', { underline: true }).moveDown(1);
        
        try {
            const canvas = await html2canvas(chartElement, { 
                scale: 2,
                backgroundColor: resolvedTheme === 'dark' ? '#222d40' : '#f4f6f8'
            });
            const chartImgData = canvas.toDataURL('image/png');
            const imageBuffer = await fetchImageAsBuffer(chartImgData);

            if (imageBuffer) {
                doc.image(imageBuffer, { fit: [450, 250], align: 'center' });
            }
        } catch(e) {
            console.error("Error generating chart canvas for PDF:", e);
        }
      }

      // --- Finalize PDF ---
      doc.end();

      stream.on('finish', () => {
        const blob = stream.toBlob('application/pdf');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${species.spanishCommonName.toLowerCase().replace(/\s+/g, '_')}_informe.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    });
  };

  const displayPopulationTrend = populationTrendTranslations[language][species.populationTrend] || species.populationTrend;
  
  const presentOnIslands = GALAPAGOS_ISLANDS_NAMES
      .map(islandName => {
        const key = `is_${islandName.toLowerCase().replace(/ /g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}` as keyof Species;
        return { name: islandName, present: species[key] };
      })
      .filter(island => island.present);

  return (
    <div className="space-y-8">
      <div> 
        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="relative p-0">
            <Image
              src={getSpeciesImageUrl(species)}
              alt={speciesName}
              width={1200}
              height={400}
              className="w-full h-64 md:h-96 object-cover"
              priority
              data-ai-hint={species.dataAiHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <div className="flex items-center mb-2">
                <IconComponent className="h-12 w-12 text-accent mr-4" />
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-white">{speciesName}</h1>
              </div>
              <p className="text-xl italic text-gray-200">{scientificName}</p>
            </div>
            {(role === 'admin' || role === 'researcher') && (
              <Button asChild size="sm" className="absolute top-4 right-4 bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href={`/dashboard/edit/${species.id}`}>
                  <Edit className="mr-2 h-4 w-4" /> {language === 'es' ? 'Editar Datos' : 'Edit Data'}
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-headline font-semibold text-primary mb-3 flex items-center">
                <Tag className="mr-2 h-6 w-6" /> {t.speciesDescription}
              </h2>
              <p className="text-foreground leading-relaxed">{speciesDescription}</p>
            </section>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-xl text-primary"><Sigma className="mr-2 h-5 w-5" /> {t.taxonomicClassification}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                    {species.kingdom && <div><strong>{language === 'es' ? 'Reino' : 'Kingdom'}:</strong> {species.kingdom}</div>}
                    {species.phylum && <div><strong>{language === 'es' ? 'Filo' : 'Phylum'}:</strong> {species.phylum}</div>}
                    {species.class && <div><strong>{language === 'es' ? 'Clase' : 'Class'}:</strong> {species.class}</div>}
                    {species.order && <div><strong>{language === 'es' ? 'Orden' : 'Order'}:</strong> {species.order}</div>}
                    {species.family && <div><strong>{language === 'es' ? 'Familia' : 'Family'}:</strong> {species.family}</div>}
                    {species.genus && <div><strong>{language === 'es' ? 'Género' : 'Genus'}:</strong> {species.genus}</div>}
                    {species.specificEpithet && <div><strong>{language === 'es' ? 'Especie' : 'Species'}:</strong> {species.specificEpithet}</div>}
                </CardContent>
            </Card>


            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-primary"><ShieldAlert className="mr-2 h-5 w-5" /> {t.conservationAndPopulation}</CardTitle>
                  <CardDescription>
                    {language === 'es' ? 'Estado según la Unión Internacional para la Conservación de la Naturaleza (UICN).' : 'Status according to the International Union for Conservation of Nature (IUCN).'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>{t.iucnStatus}:</strong> <Badge variant={species.iucnStatus === 'En Peligro' || species.iucnStatus === 'En Peligro Crítico' ? 'destructive' : 'secondary'}>{species.iucnStatus}</Badge></p>
                  <p><strong>{t.populationTrend}:</strong> <span className={`font-medium ${species.populationTrend === 'decreasing' ? 'text-destructive' : species.populationTrend === 'increasing' ? 'text-green-600' : 'text-foreground'}`}>{displayPopulationTrend}</span></p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-primary"><Home className="mr-2 h-5 w-5" /> {t.habitat}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{species.habitat}</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-primary"><ListChecks className="mr-2 h-5 w-5" /> {t.keyStats}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {species.keyStats.map(stat => (
                    <li key={stat.label}><strong>{stat.label}:</strong> {stat.value} {stat.unit || ''}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center text-xl text-primary"><AlertCircle className="mr-2 h-5 w-5" /> {t.mainThreats}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {species.threats.map((threat, index) => (
                    <li key={index}>{threat}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-primary"><MapPin className="mr-2 h-5 w-5" /> {t.geographicDistribution}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {presentOnIslands.length > 0 ? (
                  presentOnIslands.map(island => (
                    <Badge key={island.name} variant="secondary" className="text-base">
                      {island.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">{language === 'es' ? 'No hay datos de distribución en islas específicas.' : 'No distribution data for specific islands.'}</p>
                )}
              </CardContent>
            </Card>
            
            {(role === 'admin' || role === 'researcher') && species.createdAt && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-primary"><CalendarClock className="mr-2 h-5 w-5" /> {t.registrationInfo}</CardTitle>
                  <CardDescription>{language === 'es' ? 'Metadatos de la entrada en la plataforma.' : 'Platform entry metadata.'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p><strong>{t.creationDate}:</strong> {new Date(species.createdAt).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-primary">
                  <Brain className="mr-2 h-5 w-5" /> {t.aiSummary}
                </CardTitle>
                <CardDescription>
                  {t.aiSummaryDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleGenerateSummary} disabled={isSummaryPending} className="bg-primary hover:bg-primary/90">
                  {isSummaryPending ? t.generating : t.generateAISummary}
                </Button>
                {isSummaryPending && (
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                )}
                {summary && !isSummaryPending && <p className="mt-4 p-4 bg-secondary rounded-md text-secondary-foreground">{summary}</p>}
                {error && !isSummaryPending && <p className="mt-4 text-destructive">{error}</p>}
              </CardContent>
            </Card>

            {(role === 'researcher' || role === 'admin' || species.showHistoricalDataToPublic) && (
               <Card ref={chartCardRef}>
                  <CardHeader>
                      <CardTitle className="flex items-center text-xl text-primary"><BarChart2 className="mr-2 h-5 w-5" /> {t.historicalDataVisualization}</CardTitle>
                       <CardDescription>
                         {t.historicalDataGraphDesc}
                       </CardDescription>
                  </CardHeader>
                  <CardContent>
                      {species.historicalData && species.historicalData.length > 0 ? (
                          <SpeciesDataChart 
                            data={species.historicalData} 
                            dataKey="value" 
                            nameKey="year" 
                            unit={species.historicalData[0].unit || 'conteo'} 
                            chartType="bar"
                            lang={language}
                          />
                      ) : (
                          <p className="text-muted-foreground">{language === 'es' ? 'No hay datos históricos disponibles para visualización.' : 'No historical data available for visualization.'}</p>
                      )}
                  </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-center">
        <Button onClick={handleDownloadPdf} disabled={isPdfPending} variant="outline" size="lg">
           {isPdfPending ? (
              <>
                <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                {t.generatingPdf}
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                {t.downloadPdfReport}
              </>
            )}
        </Button>
      </div>
    </div>
  );
}
