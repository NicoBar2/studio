
"use client";

import { useActionState, useState, useEffect, type ChangeEvent, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { GALAPAGOS_ISLANDS_NAMES } from '@/lib/utils';
import type { Species, ConservationStatus, HistoricalDataPoint } from '@/lib/types';
import { addSpeciesAction, getSpeciesListAction } from '@/app/actions';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, PlusCircle, Trash2, Search, Wand2, Copy } from 'lucide-react';
import Image from 'next/image';

const initialState = {
  success: false,
  message: '',
  speciesId: undefined as string | undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
      {pending ? t.creating : t.addSpecies_createButton}
    </Button>
  );
}

const populationTrendOptions: { value: Species['populationTrend']; label: 'increasing' | 'decreasing' | 'stable' | 'unknown' }[] = [
  { value: 'increasing', label: 'increasing' },
  { value: 'decreasing', label: 'decreasing' },
  { value: 'stable', label: 'stable' },
  { value: 'unknown', label: 'unknown' },
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

export default function AddSpeciesPage() {
    const [state, formAction] = useActionState(addSpeciesAction, initialState);
    const { toast } = useToast();
    const router = useRouter();
    const { role, userEmail } = useAuth();
    const { t } = useLanguage();
    
    const formRef = useRef<HTMLFormElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFileValue, setImageFileValue] = useState<string>('');
    const [showPublicDataChecked, setShowPublicDataChecked] = useState<boolean>(false);
    const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
    
    const [allSpecies, setAllSpecies] = useState<Species[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Species[]>([]);
    const [templateSpecies, setTemplateSpecies] = useState<Species | null>(null);

    const prevMessageRef = useRef<string | undefined>();

    useEffect(() => {
        getSpeciesListAction().then(setAllSpecies);
    }, []);
    
    useEffect(() => {
        if (searchTerm.length > 2) {
            const results = allSpecies.filter(s => 
                t.getSpeciesName(s).toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(results.slice(0, 5)); // Limit results
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, allSpecies, t]);

    const applyTemplate = useCallback((species: Species) => {
        setTemplateSpecies(species);
        setSearchTerm('');
        setSearchResults([]);
        toast({
            title: "Plantilla Aplicada",
            description: `Datos de "${t.getSpeciesName(species)}" cargados. Ajusta el nombre y otros detalles para crear una nueva especie.`,
        });
    }, [t, toast]);
    
    useEffect(() => {
        if (templateSpecies && formRef.current) {
            // This is a simplified reset. A more robust solution might use a library like react-hook-form's reset method.
            (formRef.current.elements.namedItem('spanishCommonName') as HTMLInputElement).value = ''; // Clear name to avoid duplicates
            (formRef.current.elements.namedItem('englishCommonName') as HTMLInputElement).value = templateSpecies.englishCommonName || '';
            (formRef.current.elements.namedItem('genus') as HTMLInputElement).value = templateSpecies.genus || '';
            (formRef.current.elements.namedItem('specificEpithet') as HTMLInputElement).value = templateSpecies.specificEpithet || '';
            (formRef.current.elements.namedItem('iucnStatus') as HTMLSelectElement).value = templateSpecies.iucnStatus;
            (formRef.current.elements.namedItem('populationTrend') as HTMLSelectElement).value = templateSpecies.populationTrend;
            (formRef.current.elements.namedItem('habitat') as HTMLInputElement).value = templateSpecies.habitat || '';
            (formRef.current.elements.namedItem('spanishDescription') as HTMLTextAreaElement).value = templateSpecies.spanishDescription || '';
            (formRef.current.elements.namedItem('englishDescription') as HTMLTextAreaElement).value = templateSpecies.englishDescription || '';
            (formRef.current.elements.namedItem('threats') as HTMLInputElement).value = templateSpecies.threats?.join(', ') || '';

            const newIslandPresence: Record<string, boolean> = {};
            islandKeys.forEach(island => {
                (formRef.current!.elements.namedItem(island.id as string) as HTMLInputElement).checked = !!templateSpecies[island.id];
            });
            
            setShowPublicDataChecked(!!templateSpecies.showHistoricalDataToPublic);
            setHistoricalData(templateSpecies.historicalData || []);
            setImagePreview(templateSpecies.imageUrl);
            setImageFileValue(templateSpecies.imageUrl);
        }
    }, [templateSpecies]);


    useEffect(() => {
        if (state.message && state.message !== prevMessageRef.current) {
            toast({
                title: state.success ? t.success : t.error,
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            prevMessageRef.current = state.message;
        }
    }, [state, toast, router, t]);

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
            setImagePreview(null);
            setImageFileValue('');
        }
    };

    const handleHistoricalDataChange = (index: number, field: keyof HistoricalDataPoint, value: string | number) => {
        const newData = [...historicalData];
        const point = { ...newData[index] };
        
        if (field === 'year' || field === 'value') {
            point[field] = Number(value) || 0;
        } else {
            (point as any)[field] = String(value);
        }
        newData[index] = point;
        setHistoricalData(newData);
    };

    const addHistoricalDataPoint = () => {
        const lastUnit = historicalData.length > 0 ? historicalData[historicalData.length - 1].unit : '';
        setHistoricalData([...historicalData, { year: new Date().getFullYear(), value: 0, unit: lastUnit, description: '' }]);
    };

    const removeHistoricalDataPoint = (index: number) => {
        setHistoricalData(historicalData.filter((_, i) => i !== index));
    };

    return (
        <RoleBasedGuard allowedRoles={['admin', 'researcher']}>
            <div className="space-y-6">
                <Button variant="outline" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" /> {t.backToDashboard}
                    </Link>
                </Button>
                
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl font-headline text-primary"><Wand2 className="mr-2 h-6 w-6" />Asistente de Creación</CardTitle>
                        <CardDescription>Busca una especie existente para usar sus datos como plantilla y acelerar el proceso de creación.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                type="text"
                                placeholder="Buscar especie existente para usar como plantilla..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                            {searchResults.length > 0 && (
                                <ul className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg">
                                    {searchResults.map(species => (
                                        <li key={species.id} className="flex items-center justify-between p-2 hover:bg-muted">
                                            <span>{t.getSpeciesName(species)}</span>
                                            <Button size="sm" variant="outline" onClick={() => applyTemplate(species)}>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Usar como Plantilla
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </CardContent>
                </Card>


                <Card className="shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline text-primary">{t.addSpecies_title}</CardTitle>
                        <CardDescription>{t.addSpecies_description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form ref={formRef} action={formAction} className="space-y-6">
                            <input type="hidden" name="userRole" value={role || ''} />
                            <input type="hidden" name="userEmail" value={userEmail || ''} />
                            <input type="hidden" name="historicalData" value={JSON.stringify(historicalData)} />

                            <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="text-xl font-headline">{t.addSpecies_section_names}</AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-4">
                                        <div>
                                            <Label htmlFor="spanishCommonName" className="font-semibold">{t.addSpecies_label_spanishName}</Label>
                                            <Input id="spanishCommonName" name="spanishCommonName" required className="mt-1" />
                                        </div>
                                        <div>
                                            <Label htmlFor="englishCommonName" className="font-semibold">{t.addSpecies_label_englishName}</Label>
                                            <Input id="englishCommonName" name="englishCommonName" className="mt-1" />
                                        </div>
                                        <div>
                                            <Label htmlFor="genus" className="font-semibold">{t.genus}</Label>
                                            <Input id="genus" name="genus" className="mt-1" />
                                        </div>
                                        <div>
                                            <Label htmlFor="specificEpithet" className="font-semibold">{t.specificEpithet}</Label>
                                            <Input id="specificEpithet" name="specificEpithet" className="mt-1" />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                
                                <AccordionItem value="item-2">
                                    <AccordionTrigger className="text-xl font-headline">{t.addSpecies_section_status}</AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="iucnStatus" className="font-semibold">{t.iucnStatus}</Label>
                                            <Select name="iucnStatus" defaultValue="Datos Insuficientes">
                                                <SelectTrigger id="iucnStatus" className="mt-1">
                                                    <SelectValue placeholder={t.selectPlaceholder} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {conservationStatusOptions.map(status => (
                                                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {t.iucnDescription}
                                            </p>
                                        </div>
                                        <div>
                                            <Label htmlFor="populationTrend" className="font-semibold">{t.populationTrend}</Label>
                                            <Select name="populationTrend" defaultValue="unknown">
                                                <SelectTrigger id="populationTrend" className="mt-1">
                                                    <SelectValue placeholder={t.selectPlaceholder} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {populationTrendOptions.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value}>{t[opt.label]}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-3">
                                    <AccordionTrigger className="text-xl font-headline">{t.addSpecies_section_distribution}</AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-4">
                                        <div>
                                            <Label htmlFor="habitat" className="font-semibold">{t.habitat}</Label>
                                            <Input id="habitat" name="habitat" className="mt-1" />
                                        </div>
                                        <div>
                                            <Label className="font-semibold">{t.addSpecies_label_islands}</Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2 p-4 border rounded-md">
                                                {islandKeys.map(island => (
                                                    <div key={island.id as string} className="flex items-center space-x-2">
                                                        <Checkbox id={island.id as string} name={island.id as string} />
                                                        <Label htmlFor={island.id as string} className="text-sm font-normal">{island.label}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-4">
                                    <AccordionTrigger className="text-xl font-headline">{t.addSpecies_section_descriptions}</AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-4">
                                        <div>
                                            <Label htmlFor="spanishDescription" className="font-semibold">{t.addSpecies_label_spanishDesc}</Label>
                                            <Textarea id="spanishDescription" name="spanishDescription" rows={5} className="mt-1" />
                                        </div>
                                        <div>
                                            <Label htmlFor="englishDescription" className="font-semibold">{t.addSpecies_label_englishDesc}</Label>
                                            <Textarea id="englishDescription" name="englishDescription" rows={5} className="mt-1" />
                                        </div>
                                        <div>
                                            <Label htmlFor="threats" className="font-semibold">{t.addSpecies_label_threats}</Label>
                                            <Input id="threats" name="threats" className="mt-1" />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-5">
                                    <AccordionTrigger className="text-xl font-headline">{t.addSpecies_section_image}</AccordionTrigger>
                                    <AccordionContent className="space-y-2 pt-4">
                                        <Label htmlFor="imageUpload" className="font-semibold">{t.addSpecies_label_uploadImage}</Label>
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
                                            {t.addSpecies_image_hint}
                                        </p>
                                    </AccordionContent>
                                </AccordionItem>
                                
                                <AccordionItem value="item-6">
                                    <AccordionTrigger className="text-xl font-headline">{t.addSpecies_section_visibility}</AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="showHistoricalDataToPublic"
                                                name="showHistoricalDataToPublic"
                                                checked={showPublicDataChecked}
                                                onCheckedChange={(checked) => setShowPublicDataChecked(Boolean(checked))}
                                            />
                                            <Label htmlFor="showHistoricalDataToPublic" className="text-sm font-normal">
                                                {t.addSpecies_label_showPublic}
                                            </Label>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-7">
                                    <AccordionTrigger className="text-xl font-headline">{t.historicalData}</AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-4">
                                        <div className="space-y-3">
                                            {historicalData.map((point, index) => (
                                                <div key={index} className="flex flex-col gap-2 p-3 border rounded-md bg-muted/50">
                                                    <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
                                                        <div>
                                                            <Label htmlFor={`year-${index}`} className="text-xs font-semibold">{t.year}</Label>
                                                            <Input
                                                                id={`year-${index}`}
                                                                type="number"
                                                                value={point.year}
                                                                onChange={(e) => handleHistoricalDataChange(index, 'year', e.target.value)}
                                                                placeholder={t.year}
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor={`value-${index}`} className="text-xs font-semibold">{t.value}</Label>
                                                            <Input
                                                                id={`value-${index}`}
                                                                type="number"
                                                                value={point.value}
                                                                onChange={(e) => handleHistoricalDataChange(index, 'value', e.target.value)}
                                                                placeholder={t.value}
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor={`unit-${index}`} className="text-xs font-semibold">{t.unit}</Label>
                                                            <Input
                                                                id={`unit-${index}`}
                                                                value={point.unit}
                                                                onChange={(e) => handleHistoricalDataChange(index, 'unit', e.target.value)}
                                                                placeholder={t.unit}
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => removeHistoricalDataPoint(index)}
                                                            aria-label={t.deleteButton}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">{t.deleteButton}</span>
                                                        </Button>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`description-${index}`} className="text-xs font-semibold">{t.description} ({t.optional})</Label>
                                                        <Input
                                                            id={`description-${index}`}
                                                            value={point.description || ''}
                                                            onChange={(e) => handleHistoricalDataChange(index, 'description', e.target.value)}
                                                            placeholder={t.descriptionPlaceholder}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addHistoricalDataPoint}
                                            className="mt-4"
                                        >
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            {t.addDataPoint}
                                        </Button>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <div className="flex justify-end pt-4">
                                <SubmitButton />
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </RoleBasedGuard>
    );
}

    
