
"use client";

import type { Species, ConservationStatus } from '@/lib/species';
import { useActionState, useState, useEffect, type ChangeEvent, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { saveSpeciesData } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const initialState = {
  success: false,
  message: '',
  speciesId: undefined as string | undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
      {pending ? 'Guardando...' : 'Guardar Cambios'}
    </Button>
  );
}

type SpeciesEditFormProps = {
  species: Species;
};

const populationTrendOptions: { value: Species['populationTrend']; label: string }[] = [
  { value: 'increasing', label: 'Creciente' },
  { value: 'decreasing', label: 'Decreciente' },
  { value: 'stable', label: 'Estable' },
  { value: 'unknown', label: 'Desconocida' },
];

const conservationStatusOptions: { value: ConservationStatus; label: string }[] = [
    { value: 'En Peligro Crítico', label: 'En Peligro Crítico' },
    { value: 'En Peligro', label: 'En Peligro' },
    { value: 'Vulnerable', label: 'Vulnerable' },
    { value: 'Casi Amenazada', label: 'Casi Amenazada' },
    { value: 'Preocupación Menor', label: 'Preocupación Menor' },
    { value: 'Datos Insuficientes', label: 'Datos Insuficientes' },
];


export default function SpeciesEditForm({ species }: SpeciesEditFormProps) {
  const [state, formAction] = useActionState(saveSpeciesData, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(species.imageUrl);
  const [imageFileValue, setImageFileValue] = useState<string>(species.imageUrl); 

  const prevMessageRef = useRef<string | undefined>();

  useEffect(() => {
    if (state.message && state.message !== prevMessageRef.current) {
      toast({
        title: state.success ? '¡Éxito!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        router.refresh(); 
      }
      prevMessageRef.current = state.message;
    }
  }, [state, toast, router]);

  useEffect(() => {
    // This effect updates the preview if the underlying species.imageUrl prop changes
    // (e.g., after a successful save and router.refresh())
    if (species.imageUrl !== imagePreview) {
      setImagePreview(species.imageUrl);
      setImageFileValue(species.imageUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [species.imageUrl]); // Only depend on species.imageUrl

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        setImageFileValue(dataUri); 
      };
      reader.readAsDataURL(file);
    } else {
      // If no file is selected (e.g., user cancels file dialog), revert to original or last saved image
      setImagePreview(species.imageUrl); 
      setImageFileValue(species.imageUrl);
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-primary">Editar: {species.name}</CardTitle>
        <CardDescription>Modifica los detalles de esta especie. Asegúrate de que toda la información sea precisa.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="id" defaultValue={species.id} />

          <div>
            <Label htmlFor="name" className="font-semibold">Nombre de la Especie</Label>
            <Input id="name" name="name" defaultValue={species.name} className="mt-1" />
          </div>

          <div>
            <Label htmlFor="scientificName" className="font-semibold">Nombre Científico</Label>
            <Input id="scientificName" name="scientificName" defaultValue={species.scientificName} className="mt-1" />
          </div>

          <div>
            <Label htmlFor="description" className="font-semibold">Descripción Corta</Label>
            <Textarea id="description" name="description" defaultValue={species.description} rows={3} className="mt-1" />
          </div>

          <div>
            <Label htmlFor="longDescription" className="font-semibold">Descripción Larga</Label>
            <Textarea id="longDescription" name="longDescription" defaultValue={species.longDescription} rows={6} className="mt-1" />
          </div>

          <div>
            <Label htmlFor="imageUpload" className="font-semibold">Imagen de la Especie</Label>
            <div className="mt-1 flex items-center gap-4">
              {imagePreview && (
                <Image 
                  src={imagePreview} 
                  alt="Previsualización" 
                  width={100} 
                  height={100} 
                  className="rounded-md object-cover aspect-square"
                  key={imagePreview} // Add key to force re-render on src change
                />
              )}
              <Input 
                id="imageUpload" 
                name="imageUpload" // This name is for the file input, not directly submitted
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="block w-full text-sm text-slate-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-primary/10 file:text-primary
                           hover:file:bg-primary/20"
              />
            </div>
            {/* Hidden input to send the Data URI or original URL to the server action */}
            <input type="hidden" name="imageUrl" value={imageFileValue} />
            <p className="mt-1 text-xs text-muted-foreground">
              Sube una nueva imagen para reemplazar la actual. Si no seleccionas una nueva, se mantendrá la imagen existente.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="conservationStatus" className="font-semibold">Estado de Conservación</Label>
              <Select name="conservationStatus" defaultValue={species.conservationStatus}>
                <SelectTrigger id="conservationStatus" className="mt-1">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {conservationStatusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="populationTrend" className="font-semibold">Tendencia Poblacional</Label>
              <Select name="populationTrend" defaultValue={species.populationTrend}>
                <SelectTrigger id="populationTrend" className="mt-1">
                  <SelectValue placeholder="Seleccionar tendencia" />
                </Trigger>
                <SelectContent>
                  {populationTrendOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="habitat" className="font-semibold">Hábitat</Label>
            <Input id="habitat" name="habitat" defaultValue={species.habitat} className="mt-1" />
          </div>

          <div>
            <Label htmlFor="threats" className="font-semibold">Amenazas (separadas por coma)</Label>
            <Input id="threats" name="threats" defaultValue={species.threats.join(', ')} className="mt-1" />
          </div>

          {/* Editing only the first key stat */}
          {species.keyStats.length > 0 && (
            <Card className="bg-muted/50 p-4">
              <h4 className="font-semibold text-lg mb-2">Estadísticas Clave (Primer Elemento)</h4>
              {/* Hidden input to preserve the label of the first key stat */}
              <input type="hidden" name="keyStat0_label" defaultValue={species.keyStats[0].label} />
              <div className="space-y-2">
                <div>
                  <Label htmlFor="keyStat0_value">{species.keyStats[0].label} - Valor</Label>
                  <Input id="keyStat0_value" name="keyStat0_value" defaultValue={String(species.keyStats[0].value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="keyStat0_unit">{species.keyStats[0].label} - Unidad (opcional)</Label>
                  <Input id="keyStat0_unit" name="keyStat0_unit" defaultValue={species.keyStats[0].unit || ''} className="mt-1" />
                </div>
              </div>
            </Card>
          )}

           {/* Editing only the first historical data point */}
           {species.historicalData.length > 0 && (
            <Card className="bg-muted/50 p-4">
              <h4 className="font-semibold text-lg mb-2">Datos Históricos (Primer Punto)</h4>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                    <Label htmlFor="historicalData0_year">Año</Label>
                    <Input id="historicalData0_year" name="historicalData0_year" type="number" defaultValue={String(species.historicalData[0].year)} className="mt-1"/>
                </div>
                <div>
                    <Label htmlFor="historicalData0_value">Valor</Label>
                    <Input id="historicalData0_value" name="historicalData0_value" type="number" step="any" defaultValue={String(species.historicalData[0].value)} className="mt-1"/>
                </div>
                <div>
                    <Label htmlFor="historicalData0_unit">Unidad</Label>
                    <Input id="historicalData0_unit" name="historicalData0_unit" defaultValue={species.historicalData[0].unit} className="mt-1"/>
                </div>
               </div>
            </Card>
          )}

          <div className="flex justify-end pt-4">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
    
