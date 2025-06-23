
"use client";
import { getSpeciesImageUrl, GALAPAGOS_ISLANDS_NAMES } from '@/lib/utils'; 
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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

const islandKeys: { id: keyof Species; label: string }[] = GALAPAGOS_ISLANDS_NAMES.map(name => ({
    id: `is_${name.toLowerCase().replace(/ /g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}` as keyof Species,
    label: name,
}));

export default function SpeciesEditForm({ species }: SpeciesEditFormProps) {
  const [state, formAction] = useActionState(saveSpeciesData, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const { role, userEmail } = useAuth();

  const [imagePreview, setImagePreview] = useState<string | null>(getSpeciesImageUrl(species));
  const [imageFileValue, setImageFileValue] = useState<string>(getSpeciesImageUrl(species));

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
    // This effect ensures that if the species prop changes from the outside
    // (e.g., after a save and re-fetch), the image preview and hidden input value are updated.
    // It will NOT run when the user selects a new image, which fixes the bug.
    const currentImageUrl = getSpeciesImageUrl(species);
    setImagePreview(currentImageUrl);
    setImageFileValue(currentImageUrl);
  }, [species.imageUrl]);


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
      // User cancelled the file dialog, reset to the original image for this species
      const originalImageUrl = getSpeciesImageUrl(species);
      setImagePreview(originalImageUrl);
      setImageFileValue(originalImageUrl);
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-primary">Editar: {species.spanishCommonName}</CardTitle>
        <CardDescription>Modifica los detalles de esta especie. Asegúrate de que toda la información sea precisa.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="id" defaultValue={species.id} />
          <input type="hidden" name="userRole" value={role || ''} />
          <input type="hidden" name="userEmail" value={userEmail || ''} />

          <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
            
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-xl font-headline">Nombres e Identificación</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="spanishCommonName" className="font-semibold">Nombre Común en Español</Label>
                  <Input id="spanishCommonName" name="spanishCommonName" defaultValue={species.spanishCommonName} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="englishCommonName" className="font-semibold">Nombre Común en Inglés</Label>
                  <Input id="englishCommonName" name="englishCommonName" defaultValue={species.englishCommonName || ''} className="mt-1" />
                </div>
                 <div>
                    <Label htmlFor="genus" className="font-semibold">Género</Label>
                    <Input id="genus" name="genus" defaultValue={species.genus || ''} className="mt-1" />
                </div>
                <div>
                    <Label htmlFor="specificEpithet" className="font-semibold">Epíteto Específico</Label>
                    <Input id="specificEpithet" name="specificEpithet" defaultValue={species.specificEpithet || ''} className="mt-1" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-xl font-headline">Estado y Tendencia</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <Label htmlFor="iucnStatus" className="font-semibold">Estado de Conservación (UICN)</Label>
                    <Select name="iucnStatus" defaultValue={species.iucnStatus}>
                        <SelectTrigger id="iucnStatus" className="mt-1">
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
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-xl font-headline">Distribución</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                 <div>
                    <Label htmlFor="habitat" className="font-semibold">Hábitat</Label>
                    <Input id="habitat" name="habitat" defaultValue={species.habitat} className="mt-1" />
                  </div>
                 <div>
                  <Label className="font-semibold">Islas de Presencia</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2 p-4 border rounded-md">
                    {islandKeys.map(island => (
                      <div key={island.id as string} className="flex items-center space-x-2">
                        <Checkbox 
                          id={island.id as string} 
                          name={island.id as string} 
                          defaultChecked={!!species[island.id]}
                        />
                        <Label htmlFor={island.id as string} className="text-sm font-normal">{island.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
                <AccordionTrigger className="text-xl font-headline">Descripciones y Amenazas</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                     <div>
                        <Label htmlFor="spanishDescription" className="font-semibold">Descripción (Español)</Label>
                        <Textarea id="spanishDescription" name="spanishDescription" defaultValue={species.spanishDescription} rows={5} className="mt-1" />
                    </div>
                     <div>
                        <Label htmlFor="englishDescription" className="font-semibold">Descripción (Inglés)</Label>
                        <Textarea id="englishDescription" name="englishDescription" defaultValue={species.englishDescription || ''} rows={5} className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="threats" className="font-semibold">Amenazas (separadas por coma)</Label>
                        <Input id="threats" name="threats" defaultValue={species.threats.join(', ')} className="mt-1" />
                    </div>
                </AccordionContent>
            </AccordionItem>


             <AccordionItem value="item-5">
                <AccordionTrigger className="text-xl font-headline">Imagen de la Especie</AccordionTrigger>
                <AccordionContent className="space-y-2 pt-4">
                     <Label htmlFor="imageUpload" className="font-semibold">Subir Nueva Imagen</Label>
                    <div className="mt-1 flex items-center gap-4">
                    {imagePreview && (
                        <Image 
                        src={imagePreview} 
                        alt="Previsualización" 
                        width={100} 
                        height={100} 
                        className="rounded-md object-cover aspect-square"
                        key={imagePreview} 
                        />
                    )}
                    <Input 
                        id="imageUpload" 
                        name="imageUpload" 
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
                    <input type="hidden" name="imageUrl" value={imageFileValue} />
                    <p className="mt-1 text-xs text-muted-foreground">
                    Sube una nueva imagen para reemplazar la actual. Si no seleccionas una nueva, se mantendrá la imagen existente.
                    </p>
                </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex justify-end pt-4">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
