
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
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

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

const populationTrendTranslations: Record<Species['populationTrend'], string> = {
  increasing: 'Creciente',
  decreasing: 'Decreciente',
  stable: 'Estable',
  unknown: 'Desconocida',
};

export default function SpeciesDetailClient({ species }: SpeciesDetailClientProps) {
  const { role } = useAuth();
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSummaryPending, startSummaryTransition] = useTransition();
  const [isPdfPending, startPdfTransition] = useTransition();
  const chartCardRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  
  const IconComponent = iconMap[species.icon] || iconMap.Default;
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
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = margin; // Posición Y actual en el documento

      // Función para añadir una página si es necesario
      const addPageIfNeeded = () => {
          if (y > pageHeight - 20) { // Comprobar si se necesita una nueva página, con margen para el pie de página
              doc.addPage();
              y = margin;
          }
      }

      // Función para añadir un título principal
      const addTitle = (text: string) => {
        addPageIfNeeded();
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(text, pageWidth / 2, y, { align: 'center' });
        y += 10;
      };

      // Función para añadir un subtítulo
      const addSubtitle = (text: string) => {
        addPageIfNeeded();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'italic');
        doc.text(text, pageWidth / 2, y, { align: 'center' });
        y += 15;
      };

      // Función para encabezados de sección
      const addSectionHeader = (text: string) => {
        y += 5; // Espacio antes del encabezado
        addPageIfNeeded();
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(text, margin, y);
        y += 7;
        doc.setLineWidth(0.5);
        doc.line(margin, y - 4, pageWidth - margin, y - 4); // Subrayado
      };
      
      // Función para el texto del cuerpo, maneja el ajuste de línea y saltos de página
      const addBodyText = (text: string | null | undefined, options: { isListItem?: boolean } = {}) => {
          if (!text) return;
          addPageIfNeeded();
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          const prefix = options.isListItem ? '- ' : '';
          const lines = doc.splitTextToSize(prefix + text, pageWidth - margin * 2 - (options.isListItem ? 3 : 0));
          
          for(const line of lines) {
              if (y > pageHeight - 15) { // Comprobar por cada línea
                  doc.addPage();
                  y = margin;
              }
              doc.text(line, margin + (options.isListItem ? 3 : 0), y);
              y += 6;
          }
      }
      
      // Función para una línea de clave-valor
      const addKeyValueLine = (key: string, value: string | null | undefined) => {
          if (!value) return;
          const fullText = `${key}: ${value}`;
          addBodyText(fullText);
      }


      // --- Contenido del PDF ---

      // 1. Título y Subtítulo
      addTitle(species.spanishCommonName);
      if (scientificName) {
        addSubtitle(scientificName);
      }

      // 2. Imagen
      try {
        const imageUrl = getSpeciesImageUrl(species);
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        
        const imgProps = doc.getImageProperties(dataUrl);
        const imgWidth = pageWidth - margin * 2;
        let imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        const maxImgHeight = pageHeight * 0.4; // Limitar la altura de la imagen al 40% de la página
        if(imgHeight > maxImgHeight) {
            imgHeight = maxImgHeight;
        }

        if (y + imgHeight > pageHeight - 15) {
            doc.addPage();
            y = margin;
        }
        doc.addImage(dataUrl, 'PNG', margin, y, imgWidth, imgHeight, undefined, 'FAST');
        y += imgHeight + 10;
      } catch (e) {
          console.error("No se pudo añadir la imagen al PDF:", e);
      }

      // 3. Descripción
      addSectionHeader('Descripción');
      addBodyText(species.spanishDescription);
      y+= 5;

      // 4. Detalles Principales
      addSectionHeader('Datos Principales');
      addKeyValueLine('Estado UICN', species.iucnStatus);
      addKeyValueLine('Tendencia Poblacional', displayPopulationTrend);
      addKeyValueLine('Hábitat Principal', species.habitat);
      y+= 5;

      // 5. Estadísticas Clave
      if (species.keyStats && species.keyStats.length > 0) {
        addSectionHeader('Estadísticas Clave');
        species.keyStats.forEach(stat => {
            addBodyText(`${stat.label}: ${stat.value} ${stat.unit || ''}`, {isListItem: true});
        });
        y+=5;
      }

      // 6. Amenazas
      if (species.threats && species.threats.length > 0) {
        addSectionHeader('Amenazas Principales');
        species.threats.forEach(threat => {
            addBodyText(threat, {isListItem: true});
        });
        y+=5;
      }
      
      // 7. Distribución
      const presentOnIslands = GALAPAGOS_ISLANDS_NAMES
          .map(islandName => ({ name: islandName, present: species[`is_${islandName.toLowerCase().replace(/ /g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}` as keyof Species] }))
          .filter(island => island.present);
          
      if(presentOnIslands.length > 0) {
          addSectionHeader('Distribución Geográfica');
          const islandList = presentOnIslands.map(i => i.name).join(', ');
          addBodyText(islandList);
      }

      // 8. Gráfico de Datos Históricos
      const chartElement = chartCardRef.current;
      const shouldRenderChart = (role === 'researcher' || role === 'admin' || species.showHistoricalDataToPublic) && species.historicalData && species.historicalData.length > 0;

      if (shouldRenderChart && chartElement) {
        addSectionHeader('Visualización de Datos Históricos');
        y += 5;

        if (y > pageHeight - 80) { // Rough estimate for chart height
            doc.addPage();
            y = margin;
        }
        
        const canvas = await html2canvas(chartElement, { 
            scale: 2,
            backgroundColor: resolvedTheme === 'dark' ? '#222d40' : '#f4f6f8'
        });
        const chartImgData = canvas.toDataURL('image/png');
        const chartImgWidth = pageWidth - margin * 2;
        const chartImgHeight = (canvas.height * chartImgWidth) / canvas.width;

        if (y + chartImgHeight > pageHeight - 15) {
            doc.addPage();
            y = margin;
        }

        doc.addImage(chartImgData, 'PNG', margin, y, chartImgWidth, chartImgHeight);
        y += chartImgHeight + 10;
      }


      // --- Fin del Contenido ---

      // Añadir pie de página con números de página a todas las páginas
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text(
          `Informe generado por Galapagos DataLens`,
          margin,
          pageHeight - 8
        );
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth - margin,
          pageHeight - 8,
          { align: 'right' }
        );
      }

      doc.save(`${species.spanishCommonName.toLowerCase().replace(/\s+/g, '_')}_informe.pdf`);
    });
  };

  const displayPopulationTrend = populationTrendTranslations[species.populationTrend] || species.populationTrend;
  
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
              alt={species.spanishCommonName}
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
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-white">{species.spanishCommonName}</h1>
              </div>
              <p className="text-xl italic text-gray-200">{scientificName}</p>
            </div>
            {(role === 'admin' || role === 'researcher') && (
              <Button asChild size="sm" className="absolute top-4 right-4 bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href={`/dashboard/edit/${species.id}`}>
                  <Edit className="mr-2 h-4 w-4" /> Editar Datos
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-headline font-semibold text-primary mb-3 flex items-center">
                <Tag className="mr-2 h-6 w-6" /> Descripción
              </h2>
              <p className="text-foreground leading-relaxed">{species.spanishDescription}</p>
            </section>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-xl text-primary"><Sigma className="mr-2 h-5 w-5" /> Clasificación Taxonómica</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                    {species.kingdom && <div><strong>Reino:</strong> {species.kingdom}</div>}
                    {species.phylum && <div><strong>Filo:</strong> {species.phylum}</div>}
                    {species.class && <div><strong>Clase:</strong> {species.class}</div>}
                    {species.order && <div><strong>Orden:</strong> {species.order}</div>}
                    {species.family && <div><strong>Familia:</strong> {species.family}</div>}
                    {species.genus && <div><strong>Género:</strong> {species.genus}</div>}
                    {species.specificEpithet && <div><strong>Especie:</strong> {species.specificEpithet}</div>}
                </CardContent>
            </Card>


            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-primary"><ShieldAlert className="mr-2 h-5 w-5" /> Conservación y Población</CardTitle>
                  <CardDescription>
                    Estado según la Unión Internacional para la Conservación de la Naturaleza (UICN).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Estado UICN:</strong> <Badge variant={species.iucnStatus === 'En Peligro' || species.iucnStatus === 'En Peligro Crítico' ? 'destructive' : 'secondary'}>{species.iucnStatus}</Badge></p>
                  <p><strong>Tendencia Poblacional:</strong> <span className={`font-medium ${species.populationTrend === 'decreasing' ? 'text-destructive' : species.populationTrend === 'increasing' ? 'text-green-600' : 'text-foreground'}`}>{displayPopulationTrend}</span></p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-primary"><Home className="mr-2 h-5 w-5" /> Hábitat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{species.habitat}</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-primary"><ListChecks className="mr-2 h-5 w-5" /> Estadísticas Clave</CardTitle>
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
                  <CardTitle className="flex items-center text-xl text-primary"><AlertCircle className="mr-2 h-5 w-5" /> Amenazas Principales</CardTitle>
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
                <CardTitle className="flex items-center text-xl text-primary"><MapPin className="mr-2 h-5 w-5" /> Distribución Geográfica</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {presentOnIslands.length > 0 ? (
                  presentOnIslands.map(island => (
                    <Badge key={island.name} variant="secondary" className="text-base">
                      {island.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No hay datos de distribución en islas específicas.</p>
                )}
              </CardContent>
            </Card>
            
            {species.createdAt && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-primary"><CalendarClock className="mr-2 h-5 w-5" /> Información de Registro</CardTitle>
                  <CardDescription>Metadatos de la entrada en la plataforma.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p><strong>Fecha de Creación:</strong> {new Date(species.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-primary">
                  <Brain className="mr-2 h-5 w-5" /> Resumen Generado por IA
                </CardTitle>
                <CardDescription>
                  Obtén un resumen rápido del estado actual e importancia de esta especie.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleGenerateSummary} disabled={isSummaryPending} className="bg-primary hover:bg-primary/90">
                  {isSummaryPending ? 'Generando...' : 'Generar Resumen con IA'}
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
                      <CardTitle className="flex items-center text-xl text-primary"><BarChart2 className="mr-2 h-5 w-5" /> Visualización de Datos Históricos</CardTitle>
                       <CardDescription>
                         Gráficos de barras que muestran datos históricos de la población u otras métricas relevantes.
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
                          />
                      ) : (
                          <p className="text-muted-foreground">No hay datos históricos disponibles para visualización.</p>
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
                Generando PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Descargar Informe en PDF
              </>
            )}
        </Button>
      </div>
    </div>
  );
}
