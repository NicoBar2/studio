
"use client";

import type { Species, ConservationStatus, SpeciesStat, HistoricalDataPoint } from '@/lib/species';
import { useFormState, useFormStatus } from 'react-dom';
import { saveSpeciesData } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Trash2, PlusCircle } from 'lucide-react'; 

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
  const [state, formAction] = useFormState(saveSpeciesData, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? '¡Éxito!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);

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
                </SelectTrigger>
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

          {species.keyStats.length > 0 && (
            <Card className="bg-muted/50 p-4">
              <h4 className="font-semibold text-lg mb-2">Estadísticas Clave (Primer Elemento)</h4>
              <input type="hidden" name="keyStat0_label" defaultValue={species.keyStats[0].label} />
              <Label htmlFor="keyStat0_value">{species.keyStats[0].label}</Label>
              <Input id="keyStat0_value" name="keyStat0_value" defaultValue={String(species.keyStats[0].value)} className="mt-1 mb-1" />
              <Label htmlFor="keyStat0_unit">Unidad (opcional)</Label>
              <Input id="keyStat0_unit" name="keyStat0_unit" defaultValue={species.keyStats[0].unit || ''} className="mt-1" />
            </Card>
          )}

           {species.historicalData.length > 0 && (
            <Card className="bg-muted/50 p-4">
              <h4 className="font-semibold text-lg mb-2">Datos Históricos (Primer Punto)</h4>
               <div className="grid grid-cols-3 gap-2">
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

    