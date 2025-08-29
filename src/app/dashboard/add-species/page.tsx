"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Save, CheckCircle, XCircle, Info, FileText } from 'lucide-react';
import Link from 'next/link';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';

interface SpeciesFormData {
    name: string;
    scientific_name: string;
    common_name: string;
    family: string;
    category: string;
    description: string;
    habitat: string;
    distribution: string;
    ecology: string;
    conservation_status: string;
    threats: string;
    protection: string;
    image_url: string;
    source: string;
    added_from: string;
    timestamp: string;
    original_search_query: string;
    original_category: string;
}

export default function AddSpeciesPage() {
    const searchParams = useSearchParams();
    
    // Estado del formulario
    const [formData, setFormData] = useState<SpeciesFormData>({
        name: '',
        scientific_name: '',
        common_name: '',
        family: '',
        category: '',
        description: '',
        habitat: '',
        distribution: '',
        ecology: '',
        conservation_status: '',
        threats: '',
        protection: '',
        image_url: '',
        source: '',
        added_from: '',
        timestamp: '',
        original_search_query: '',
        original_category: ''
    });

    // Estados de la UI
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [submitMessage, setSubmitMessage] = useState('');
    const [hasPreFilledData, setHasPreFilledData] = useState(false);

    // Categorías disponibles
    const categories = [
        { value: 'Plantas', label: 'Plantas', icon: '' },
        { value: 'Animales', label: 'Animales', icon: '' },
        { value: 'Hongos', label: 'Hongos', icon: '🍄' },
        { value: 'Grupos_Ecologicos', label: 'Grupos Ecológicos', icon: '🌍' }
    ];

    // Estados de conservación
    const conservationStatuses = [
        'No evaluado',
        'Datos insuficientes',
        'Preocupación menor',
        'Casi amenazado',
        'Vulnerable',
        'En peligro',
        'En peligro crítico',
        'Extinto en estado silvestre',
        'Extinto'
    ];

    // Efecto para pre-llenar campos cuando se reciben parámetros de URL
    useEffect(() => {
        const preFillData: Partial<SpeciesFormData> = {};
        let hasData = false;

        // Mapear parámetros de URL a campos del formulario
        if (searchParams.get('name')) {
            preFillData.name = searchParams.get('name') || '';
            hasData = true;
        }
        if (searchParams.get('scientific_name')) {
            preFillData.scientific_name = searchParams.get('scientific_name') || '';
            hasData = true;
        }
        if (searchParams.get('common_name')) {
            preFillData.common_name = searchParams.get('common_name') || '';
            hasData = true;
        }
        if (searchParams.get('family')) {
            preFillData.family = searchParams.get('family') || '';
            hasData = true;
        }
        if (searchParams.get('category')) {
            preFillData.category = searchParams.get('category') || '';
            hasData = true;
        }
        if (searchParams.get('description')) {
            preFillData.description = searchParams.get('description') || '';
            hasData = true;
        }
        if (searchParams.get('habitat')) {
            preFillData.habitat = searchParams.get('habitat') || '';
            hasData = true;
        }
        if (searchParams.get('distribution')) {
            preFillData.distribution = searchParams.get('distribution') || '';
            hasData = true;
        }
        if (searchParams.get('ecology')) {
            preFillData.ecology = searchParams.get('ecology') || '';
            hasData = true;
        }
        if (searchParams.get('conservation_status')) {
            preFillData.conservation_status = searchParams.get('conservation_status') || '';
            hasData = true;
        }
        if (searchParams.get('threats')) {
            preFillData.threats = searchParams.get('threats') || '';
            hasData = true;
        }
        if (searchParams.get('protection')) {
            preFillData.protection = searchParams.get('protection') || '';
            hasData = true;
        }
        if (searchParams.get('image_url')) {
            preFillData.image_url = searchParams.get('image_url') || '';
            hasData = true;
        }
        if (searchParams.get('source')) {
            preFillData.source = searchParams.get('source') || '';
            hasData = true;
        }
        if (searchParams.get('added_from')) {
            preFillData.added_from = searchParams.get('added_from') || '';
            hasData = true;
        }
        if (searchParams.get('timestamp')) {
            preFillData.timestamp = searchParams.get('timestamp') || '';
            hasData = true;
        }
        if (searchParams.get('original_search_query')) {
            preFillData.original_search_query = searchParams.get('original_search_query') || '';
            hasData = true;
        }
        if (searchParams.get('original_category')) {
            preFillData.original_category = searchParams.get('original_category') || '';
            hasData = true;
        }

        // Actualizar el formulario con los datos pre-llenados
        if (hasData) {
            setFormData(prev => ({
                ...prev,
                ...preFillData
            }));
            setHasPreFilledData(true);
            
            // Mostrar notificación de datos pre-llenados
            console.log('✅ Datos pre-llenados desde búsqueda:', preFillData);
        }
    }, [searchParams]);

    // Función para manejar cambios en los campos del formulario
    const handleInputChange = (field: keyof SpeciesFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Función para limpiar el formulario
    const clearForm = () => {
        setFormData({
            name: '',
            scientific_name: '',
            common_name: '',
            family: '',
            category: '',
            description: '',
            habitat: '',
            distribution: '',
            ecology: '',
            conservation_status: '',
            threats: '',
            protection: '',
            image_url: '',
            source: '',
            added_from: '',
            timestamp: '',
            original_search_query: '',
            original_category: ''
        });
        setHasPreFilledData(false);
        setSubmitStatus('idle');
        setSubmitMessage('');
    };

    // Función para validar el formulario
    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            setSubmitMessage('El nombre de la especie es obligatorio');
            return false;
        }
        if (!formData.category) {
            setSubmitMessage('Debes seleccionar una categoría');
            return false;
        }
        if (!formData.description.trim()) {
            setSubmitMessage('La descripción es obligatoria');
            return false;
        }
        return true;
    };

    // Función para enviar el formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setSubmitStatus('error');
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('idle');
        setSubmitMessage('');

        try {
            // Aquí implementarías la llamada a tu API para guardar la especie
            // Por ahora simulamos el envío
            console.log('📤 Enviando datos de especie:', formData);
            
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simular respuesta exitosa
            setSubmitStatus('success');
            setSubmitMessage('Especie agregada exitosamente al sistema');
            
            // Limpiar formulario después de éxito
            setTimeout(() => {
                clearForm();
            }, 3000);

        } catch (error) {
            console.error('❌ Error al agregar especie:', error);
            setSubmitStatus('error');
            setSubmitMessage('Error al agregar la especie. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <RoleBasedGuard allowedRoles={['admin', 'researcher']}>
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-primary">Agregar Nueva Especie</h1>
                            <p className="text-gray-600">Completa el formulario para agregar una nueva especie al sistema</p>
                        </div>
                    </div>
                    
                    {/* Indicador de datos pre-llenados */}
                    {hasPreFilledData && (
                        <Badge variant="default" className="bg-green-600">
                            <FileText className="mr-2 h-4 w-4" />
                            Datos pre-llenados desde búsqueda
                        </Badge>
                    )}
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-xl">
                                <Plus className="mr-2 h-5 w-5" />
                                Información Básica de la Especie
                            </CardTitle>
                            <CardDescription>
                                Datos fundamentales para identificar y clasificar la especie
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nombre común */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre común *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Ej: León de Galápagos"
                                        required
                                    />
                                </div>

                                {/* Nombre científico */}
                                <div className="space-y-2">
                                    <Label htmlFor="scientific_name">Nombre científico</Label>
                                    <Input
                                        id="scientific_name"
                                        value={formData.scientific_name}
                                        onChange={(e) => handleInputChange('scientific_name', e.target.value)}
                                        placeholder="Ej: Panthera leo galapagoensis"
                                    />
                                </div>

                                {/* Nombre alternativo */}
                                <div className="space-y-2">
                                    <Label htmlFor="common_name">Nombre alternativo</Label>
                                    <Input
                                        id="common_name"
                                        value={formData.common_name}
                                        onChange={(e) => handleInputChange('common_name', e.target.value)}
                                        placeholder="Otros nombres conocidos"
                                    />
                                </div>

                                {/* Familia */}
                                <div className="space-y-2">
                                    <Label htmlFor="family">Familia</Label>
                                    <Input
                                        id="family"
                                        value={formData.family}
                                        onChange={(e) => handleInputChange('family', e.target.value)}
                                        placeholder="Ej: Felidae"
                                    />
                                </div>

                                {/* Categoría */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Categoría *</Label>
                                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.value} value={category.value}>
                                                    <span className="mr-2">{category.icon}</span>
                                                    {category.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Estado de conservación */}
                                <div className="space-y-2">
                                    <Label htmlFor="conservation_status">Estado de conservación</Label>
                                    <Select value={formData.conservation_status} onValueChange={(value) => handleInputChange('conservation_status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona el estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {conservationStatuses.map((status) => (
                                                <SelectItem key={status} value={status}>
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Describe las características principales de la especie..."
                                    rows={4}
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información Ecológica */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-xl">
                                <Info className="mr-2 h-5 w-5" />
                                Información Ecológica
                            </CardTitle>
                            <CardDescription>
                                Datos sobre el hábitat, distribución y ecología de la especie
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Hábitat */}
                                <div className="space-y-2">
                                    <Label htmlFor="habitat">Hábitat</Label>
                                    <Input
                                        id="habitat"
                                        value={formData.habitat}
                                        onChange={(e) => handleInputChange('habitat', e.target.value)}
                                        placeholder="Ej: Bosques húmedos, zonas costeras"
                                    />
                                </div>

                                {/* Distribución */}
                                <div className="space-y-2">
                                    <Label htmlFor="distribution">Distribución geográfica</Label>
                                    <Input
                                        id="distribution"
                                        value={formData.distribution}
                                        onChange={(e) => handleInputChange('distribution', e.target.value)}
                                        placeholder="Ej: Isla Isabela, Galápagos"
                                    />
                                </div>
                            </div>

                            {/* Ecología */}
                            <div className="space-y-2">
                                <Label htmlFor="ecology">Ecología</Label>
                                <Textarea
                                    id="ecology"
                                    value={formData.ecology}
                                    onChange={(e) => handleInputChange('ecology', e.target.value)}
                                    placeholder="Describe el comportamiento, alimentación, reproducción..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Amenazas y Protección */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-xl">
                                <XCircle className="mr-2 h-5 w-5" />
                                Amenazas y Protección
                            </CardTitle>
                            <CardDescription>
                                Información sobre las amenazas que enfrenta la especie y medidas de protección
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Amenazas */}
                                <div className="space-y-2">
                                    <Label htmlFor="threats">Amenazas principales</Label>
                                    <Textarea
                                        id="threats"
                                        value={formData.threats}
                                        onChange={(e) => handleInputChange('threats', e.target.value)}
                                        placeholder="Principales amenazas para la supervivencia..."
                                        rows={3}
                                    />
                                </div>

                                {/* Medidas de protección */}
                                <div className="space-y-2">
                                    <Label htmlFor="protection">Medidas de protección</Label>
                                    <Textarea
                                        id="protection"
                                        value={formData.protection}
                                        onChange={(e) => handleInputChange('protection', e.target.value)}
                                        placeholder="Medidas implementadas para proteger la especie..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Imagen y Metadatos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-xl">
                                <FileText className="mr-2 h-5 w-5" />
                                Imagen y Metadatos
                            </CardTitle>
                            <CardDescription>
                                Imagen de la especie e información adicional del sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* URL de imagen */}
                            <div className="space-y-2">
                                <Label htmlFor="image_url">URL de imagen</Label>
                                <Input
                                    id="image_url"
                                    value={formData.image_url}
                                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    type="url"
                                />
                            </div>

                            {/* Metadatos del sistema (solo lectura si vienen pre-llenados) */}
                            {(formData.source || formData.added_from || formData.original_search_query) && (
                                <div className="p-4 bg-gray-50 rounded-lg border">
                                    <h4 className="font-medium mb-2">Metadatos del sistema:</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                        {formData.source && (
                                            <div><strong>Fuente:</strong> {formData.source}</div>
                                        )}
                                        {formData.added_from && (
                                            <div><strong>Agregado desde:</strong> {formData.added_from}</div>
                                        )}
                                        {formData.original_search_query && (
                                            <div><strong>Búsqueda original:</strong> {formData.original_search_query}</div>
                                        )}
                                        {formData.original_category && (
                                            <div><strong>Categoría original:</strong> {formData.original_category}</div>
                                        )}
                                        {formData.timestamp && (
                                            <div><strong>Timestamp:</strong> {new Date(formData.timestamp).toLocaleString()}</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Botones de acción */}
                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={clearForm}
                            disabled={isSubmitting}
                        >
                            Limpiar Formulario
                        </Button>

                        <div className="flex items-center space-x-4">
                            {/* Estado del envío */}
                            {submitStatus === 'success' && (
                                <div className="flex items-center text-green-600">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {submitMessage}
                                </div>
                            )}
                            
                            {submitStatus === 'error' && (
                                <div className="flex items-center text-red-600">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    {submitMessage}
                                </div>
                            )}

                            {/* Botón de envío */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Agregando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Agregar Especie
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>

                {/* Información adicional */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-start space-x-3">
                            <Info className="text-blue-600 mt-1 h-5 w-5 flex-shrink-0" />
                            <div className="text-blue-800">
                                <h4 className="font-medium mb-2">💡 Información importante:</h4>
                                <ul className="text-sm space-y-1">
                                    <li>• Los campos marcados con * son obligatorios</li>
                                    <li>• Puedes agregar especies manualmente o desde resultados de búsqueda</li>
                                    <li>• Los datos se guardan en el sistema central de especies</li>
                                    <li>• Las imágenes deben ser URLs válidas y accesibles</li>
                                    <li>• Los metadatos del sistema se generan automáticamente</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </RoleBasedGuard>
    );
}