
"use client";

import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseZap, Search, Download, ArrowLeft, Loader2, CheckCircle, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
    id: number;
    name: string;
    category: string;
    description: string;
}

interface DownloadStatus {
    [key: string]: {
        loading: boolean;
        success: boolean;
        error: string | null;
        fileInfo?: {
            name: string;
            size: number;
            lastModified: string;
            records: number;
            columns: number;
        };
    };
}

export default function DarwinServicePage() {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({});

    const categories = [
        { value: 'Plantas', label: 'Plantas', icon: '', description: 'Flora de Galápagos' },
        { value: 'Animales', label: 'Animales', icon: '', description: 'Fauna de Galápagos' },
        { value: 'Hongos', label: 'Hongos', icon: '🍄', description: 'Hongos de Galápagos' },
        { value: 'Grupos_Ecologicos', label: 'Grupos Ecológicos', icon: '🌍', description: 'Grupos ecológicos' }
    ];

    const csvCategories = [
        { value: 'Plantas', label: 'Plantas', description: 'Archivos CSV de flora de Galápagos', icon: '🌿' },
        { value: 'Animales', label: 'Animales', description: 'Archivos CSV de fauna de Galápagos', icon: '🦁' },
        { value: 'Hongos', label: 'Hongos', description: 'Archivos CSV de hongos de Galápagos', icon: '🍄' },
        { value: 'Grupos_Ecologicos', label: 'Grupos Ecológicos', description: 'Archivos CSV de grupos ecológicos', icon: '🌍' }
    ];

    // URLs de tus APIs de FastAPI según la documentación
    const apiEndpoints = {
        Plantas: 'http://localhost:8001/api/v1/download/Plantas/latest',
        Animales: 'http://localhost:8001/api/v1/download/Animales/latest',
        Hongos: 'http://localhost:8001/api/v1/download/Hongos/latest',
        Grupos_Ecologicos: 'http://localhost:8001/api/v1/download/Grupos_Ecologicos/latest'
    };

    const handleSearch = async () => {
        if (!selectedCategory || !searchQuery.trim()) return;
        
        setIsSearching(true);
        // Aquí implementarías la lógica de búsqueda real
        // Por ahora simulamos resultados
        setTimeout(() => {
            setSearchResults([
                { id: 1, name: 'Especie Ejemplo 1', category: selectedCategory, description: 'Descripción de la especie encontrada' },
                { id: 2, name: 'Especie Ejemplo 2', category: selectedCategory, description: 'Otra especie en la categoría seleccionada' }
            ]);
            setIsSearching(false);
        }, 1000);
    };

    const handleDownloadCSV = async (category: string) => {
        const apiUrl = apiEndpoints[category as keyof typeof apiEndpoints];
        if (!apiUrl) return;

        // Inicializar estado de descarga
        setDownloadStatus(prev => ({
            ...prev,
            [category]: { loading: true, success: false, error: null }
        }));

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('No hay archivos disponibles para esta categoría');
                }
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            // Obtener el blob del archivo
            const blob = await response.blob();
            
            // Obtener información del archivo desde los headers
            const contentDisposition = response.headers.get('content-disposition');
            const fileName = contentDisposition 
                ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
                : `darwin_${category}_${new Date().toISOString().split('T')[0]}.csv`;

            // Crear URL del blob y descargar
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Marcar como exitoso con información del archivo
            setDownloadStatus(prev => ({
                ...prev,
                [category]: { 
                    loading: false, 
                    success: true, 
                    error: null,
                    fileInfo: {
                        name: fileName,
                        size: blob.size,
                        lastModified: new Date().toISOString(),
                        records: 0, // Esto se podría obtener del contenido del CSV si es necesario
                        columns: 0   // Esto se podría obtener del contenido del CSV si es necesario
                    }
                }
            }));

            // Limpiar el estado de éxito después de 5 segundos
            setTimeout(() => {
                setDownloadStatus(prev => ({
                    ...prev,
                    [category]: { loading: false, success: false, error: null }
                }));
            }, 5000);

        } catch (error) {
            console.error(`Error descargando ${category}:`, error);
            setDownloadStatus(prev => ({
                ...prev,
                [category]: { 
                    loading: false, 
                    success: false, 
                    error: error instanceof Error ? error.message : 'Error desconocido' 
                }
            }));

            // Limpiar el estado de error después de 7 segundos
            setTimeout(() => {
                setDownloadStatus(prev => ({
                    ...prev,
                    [category]: { loading: false, success: false, error: null }
                }));
            }, 7000);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <RoleBasedGuard allowedRoles={['admin', 'researcher']}>
            <div className="space-y-6 flex flex-col h-full">
                <div className="flex-shrink-0">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel
                        </Link>
                    </Button>
                </div>

                {/* Sección de Búsqueda de Especies */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center text-2xl font-headline text-primary">
                            <Search className="mr-3 h-7 w-7" />
                            Búsqueda de Especies
                        </CardTitle>
                        <CardDescription>
                            Busca especies específicas seleccionando una categoría y utilizando términos de búsqueda.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Categoría</label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Término de Búsqueda</label>
                                <Input
                                    placeholder="Ingresa el nombre de la especie..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">&nbsp;</label>
                                <Button 
                                    onClick={handleSearch} 
                                    disabled={!selectedCategory || !searchQuery.trim() || isSearching}
                                    className="w-full"
                                >
                                    {isSearching ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Buscando...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="mr-2 h-4 w-4" />
                                            Buscar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Resultados de búsqueda */}
                        {searchResults.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-3">Resultados de la búsqueda:</h3>
                                <div className="space-y-3">
                                    {searchResults.map((result) => (
                                        <div key={result.id} className="p-4 border rounded-lg bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium">{result.name}</h4>
                                                    <p className="text-sm text-gray-600">{result.description}</p>
                                                    <Badge variant="secondary" className="mt-1">
                                                        {categories.find(c => c.value === result.category)?.label}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sección de Descarga de CSV */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center text-2xl font-headline text-primary">
                            <Download className="mr-3 h-7 w-7" />
                            Descarga de Datos CSV - Instituto Darwin
                        </CardTitle>
                        <CardDescription>
                            Descarga automáticamente el archivo CSV más actualizado para cada categoría desde las APIs de FastAPI.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {csvCategories.map((category) => (
                                <div key={category.value} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="text-center space-y-3">
                                        <div className="text-4xl">{category.icon}</div>
                                        <h3 className="font-semibold text-lg">{category.label}</h3>
                                        <p className="text-sm text-gray-600">{category.description}</p>
                                        
                                        {/* Estado de descarga */}
                                        {downloadStatus[category.value] && (
                                            <div className="p-3 rounded-lg border bg-gray-50">
                                                {downloadStatus[category.value].loading && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-center text-blue-600">
                                                            <Loader2 className="animate-spin mr-2 h-3 w-3" />
                                                            Descargando...
                                                        </div>
                                                        <p className="text-xs text-gray-500">Obteniendo archivo más reciente</p>
                                                    </div>
                                                )}
                                                {downloadStatus[category.value].success && downloadStatus[category.value].fileInfo && (
                                                    <div className="space-y-2 text-left">
                                                        <div className="flex items-center text-green-600 font-medium">
                                                            <CheckCircle className="mr-2 h-3 w-3" />
                                                            ¡Descargado exitosamente!
                                                        </div>
                                                        <div className="text-xs space-y-1">
                                                            <p><strong>Archivo:</strong> {downloadStatus[category.value].fileInfo?.name}</p>
                                                            <p><strong>Tamaño:</strong> {formatFileSize(downloadStatus[category.value].fileInfo?.size || 0)}</p>
                                                            <p><strong>Descargado:</strong> {new Date(downloadStatus[category.value].fileInfo?.lastModified || '').toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {downloadStatus[category.value].error && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center text-red-600 font-medium">
                                                            <XCircle className="mr-2 h-3 w-3" />
                                                            Error en la descarga
                                                        </div>
                                                        <p className="text-xs text-red-600">{downloadStatus[category.value].error}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <Button 
                                            onClick={() => handleDownloadCSV(category.value)}
                                            disabled={downloadStatus[category.value]?.loading}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            {downloadStatus[category.value]?.loading ? (
                                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                            ) : (
                                                <Download className="mr-2 h-4 w-4" />
                                            )}
                                            Descargar CSV
                                        </Button>

                                        {/* Información de la API */}
                                        <div className="text-xs text-gray-500 flex items-center justify-center">
                                            <Info className="mr-1 h-3 w-3" />
                                            API: {apiEndpoints[category.value as keyof typeof apiEndpoints]?.split('/').pop()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </RoleBasedGuard>
    );
}
