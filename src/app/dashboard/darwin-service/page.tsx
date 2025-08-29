
"use client";

import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseZap, Search, Download, ArrowLeft, Loader2, CheckCircle, XCircle, Info, Plus, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
    id: number;
    name: string;
    category: string;
    description: string;
    scientific_name?: string;
    family?: string;
    habitat?: string;
    conservation_status?: string;
    image_url?: string;
    common_name?: string;
    distribution?: string;
    ecology?: string;
    threats?: string;
    protection?: string;
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
    
    // Estados para paginación y filtrado
    const [currentPage, setCurrentPage] = useState(1);
    const [resultsPerPage] = useState(10);
    const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'scientific_name' | 'family'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

    // URLs de tus APIs de FastAPI
    const apiEndpoints = {
        Plantas: 'http://localhost:8001/api/v1/download/Plantas/latest',
        Animales: 'http://localhost:8001/api/v1/download/Animales/latest',
        Hongos: 'http://localhost:8001/api/v1/download/Hongos/latest',
        Grupos_Ecologicos: 'http://localhost:8001/api/v1/download/Grupos_Ecologicos/latest'
    };

    // URLs de las APIs de scraping
    const scrapingEndpoints = {
        Plantas: 'http://localhost:8001/api/v1/scrape/plantas',
        Animales: 'http://localhost:8001/api/v1/scrape/animales',
        Hongos: 'http://localhost:8001/api/v1/scrape/hongos',
        Grupos_Ecologicos: 'http://localhost:8001/api/v1/scrape/grupos'
    };

    // Función para filtrar y ordenar resultados
    const filterAndSortResults = useCallback(() => {
        let filtered = searchResults.filter(result => 
            result.name !== 'No se encontraron resultados' && 
            result.name !== 'Error en la búsqueda'
        );

        // Filtro interno por texto
        if (internalSearchQuery.trim()) {
            const query = internalSearchQuery.toLowerCase();
            filtered = filtered.filter(result =>
                result.name.toLowerCase().includes(query) ||
                (result.scientific_name && result.scientific_name.toLowerCase().includes(query)) ||
                (result.family && result.family.toLowerCase().includes(query)) ||
                (result.description && result.description.toLowerCase().includes(query)) ||
                (result.habitat && result.habitat.toLowerCase().includes(query))
            );
        }

        // Ordenamiento
        filtered.sort((a, b) => {
            let aValue = '';
            let bValue = '';

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'scientific_name':
                    aValue = (a.scientific_name || '').toLowerCase();
                    bValue = (b.scientific_name || '').toLowerCase();
                    break;
                case 'family':
                    aValue = (a.family || '').toLowerCase();
                    bValue = (b.family || '').toLowerCase();
                    break;
            }

            if (sortOrder === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });

        setFilteredResults(filtered);
        setCurrentPage(1);
    }, [searchResults, internalSearchQuery, sortBy, sortOrder]);

    // Efecto para aplicar filtros cuando cambien los resultados o filtros
    useEffect(() => {
        filterAndSortResults();
    }, [filterAndSortResults]);

    // Calcular paginación
    const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const currentResults = filteredResults.slice(startIndex, endIndex);

    // Función para generar números de página inteligentes
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 7; // Máximo de páginas visibles

        if (totalPages <= maxVisiblePages) {
            // Si hay pocas páginas, mostrar todas
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Lógica para páginas con elipsis
            if (currentPage <= 4) {
                // Páginas iniciales
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                // Páginas finales
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Páginas intermedias
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    // Función para cambiar de página
    const goToPage = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Función para ir a la página anterior
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };

    // Función para ir a la página siguiente
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    };

    // Función para ir a la primera página
    const goToFirstPage = () => {
        goToPage(1);
    };

    // Función para ir a la última página
    const goToLastPage = () => {
        goToPage(totalPages);
    };

    // Función para limpiar filtros internos
    const clearInternalFilters = () => {
        setInternalSearchQuery('');
        setSortBy('name');
        setSortOrder('asc');
        setCurrentPage(1);
    };

    const handleSearch = async () => {
        if (!selectedCategory || !searchQuery.trim()) return;
        
        setIsSearching(true);
        setSearchResults([]);
        setCurrentPage(1);
        setInternalSearchQuery('');

        try {
            const searchUrl = `http://localhost:8001/api/v1/search/${selectedCategory}?query=${encodeURIComponent(searchQuery.trim())}`;
            
            console.log(` Iniciando búsqueda en: ${searchUrl}`);
            console.log(`📋 Categoría: ${selectedCategory}, Query: ${searchQuery}`);

            const response = await fetch(searchUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: searchQuery.trim(),
                    category: selectedCategory,
                    timestamp: new Date().toISOString()
                })
            });

            console.log(`📡 Respuesta de búsqueda:`, response.status, response.statusText);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('No se encontraron resultados para tu búsqueda. Intenta con términos más generales.');
                } else if (response.status === 400) {
                    throw new Error('Consulta de búsqueda inválida. Verifica el término ingresado.');
                } else if (response.status === 500) {
                    throw new Error('Error interno del servidor de búsqueda. Intenta nuevamente en unos minutos.');
                } else {
                    throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
                }
            }

            const searchData = await response.json();
            console.log(`📊 Datos de búsqueda recibidos:`, searchData);

            let processedResults: SearchResult[] = [];

            if (searchData.status === 'success' && searchData.found && searchData.resultados && Array.isArray(searchData.resultados)) {
                
                processedResults = searchData.resultados.map((item: any, index: number) => ({
                    id: item.id || index + 1,
                    name: item.nombre || item.nombre_especie || item.especie || 'Nombre no disponible',
                    category: selectedCategory,
                    description: item.descripcion || item.habitat || item.ecologia || item.caracteristicas || 'Descripción no disponible',
                    scientific_name: item.nombre_cientifico,
                    family: item.familia,
                    habitat: item.habitat,
                    conservation_status: item.estado_conservacion || item.conservacion,
                    image_url: item.imagen_url || item.foto_url,
                    common_name: item.nombre_comun,
                    distribution: item.distribucion,
                    ecology: item.ecologia,
                    threats: item.amenazas,
                    protection: item.proteccion
                }));

                console.log(`✅ Resultados procesados:`, processedResults);
                console.log(` Total encontrados: ${searchData.total_encontrados}`);
                console.log(` Archivo analizado: ${searchData.archivo_analizado}`);

            } else if (searchData.status === 'success' && !searchData.found) {
                processedResults = [{
                    id: 0,
                    name: 'No se encontraron resultados',
                    category: selectedCategory,
                    description: `No se encontraron especies que coincidan con "${searchQuery}" en la categoría ${categories.find(c => c.value === selectedCategory)?.label}. Intenta con términos más generales o verifica la ortografía.`
                }];
            } else {
                throw new Error('Formato de respuesta inesperado del servidor de búsqueda.');
            }

            if (processedResults.length === 0) {
                setSearchResults([{
                    id: 0,
                    name: 'No se encontraron resultados',
                    category: selectedCategory,
                    description: `No se encontraron especies que coincidan con "${searchQuery}" en la categoría ${categories.find(c => c.value === selectedCategory)?.label}. Intenta con términos más generales o verifica la ortografía.`
                }]);
            } else {
                setSearchResults(processedResults);
            }

            console.log(`🔍 Búsqueda completada: ${processedResults.length} resultados encontrados`);

        } catch (error) {
            console.error(`❌ Error en la búsqueda:`, error);
            
            let errorMessage = 'Error desconocido durante la búsqueda';
            
            if (error instanceof Error) {
                if (error.message.includes('Failed to fetch')) {
                    errorMessage = 'Error de conexión. El servidor de búsqueda puede estar caído o no accesible.';
                } else if (error.message.includes('timeout')) {
                    errorMessage = 'La búsqueda tardó demasiado tiempo. El servidor puede estar lento.';
                } else {
                    errorMessage = error.message;
                }
            }

            setSearchResults([{
                id: 0,
                name: 'Error en la búsqueda',
                category: selectedCategory,
                description: errorMessage
            }]);

        } finally {
            setIsSearching(false);
        }
    };

    const handleDownloadCSV = async (category: string) => {
        const apiUrl = apiEndpoints[category as keyof typeof apiEndpoints];
        if (!apiUrl) return;

        console.log(`Iniciando descarga para ${category} desde: ${apiUrl}`);

        setDownloadStatus(prev => ({
            ...prev,
            [category]: { loading: true, success: false, error: null }
        }));

        try {
            if (!apiUrl.startsWith('http')) {
                throw new Error(`URL inválida: ${apiUrl}`);
            }

            console.log(`Haciendo fetch a: ${apiUrl}`);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(30000),
            });

            console.log(`Respuesta recibida:`, response.status, response.statusText);

            if (response.status === 404) {
                throw new Error('No se encontraron archivos CSV para esta categoría. La base de datos puede estar vacía o en proceso de actualización.');
            }
            
            if (response.status === 500) {
                throw new Error('Error interno del servidor. El sistema de archivos puede estar temporalmente no disponible.');
            }
            
            if (response.status === 503) {
                throw new Error('Servicio temporalmente no disponible. El sistema puede estar en mantenimiento.');
            }
            
            if (response.status === 403) {
                throw new Error('Acceso denegado. No tienes permisos para descargar archivos de esta categoría.');
            }
            
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
            }

            const contentLength = response.headers.get('content-length');
            console.log(`Content-Length:`, contentLength);
            
            if (contentLength === '0' || !contentLength) {
                throw new Error('El archivo CSV está vacío o no contiene datos válidos.');
            }

            console.log(`Descargando blob...`);
            const blob = await response.blob();
            console.log(`Blob descargado:`, blob.size, 'bytes');
            
            if (blob.size === 0) {
                throw new Error('El archivo descargado está vacío. Puede que no haya datos disponibles.');
            }

            const contentDisposition = response.headers.get('content-disposition');
            const fileName = contentDisposition 
                ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
                : `darwin_${category}_${new Date().toISOString().split('T')[0]}.csv`;

            console.log(`Nombre del archivo:`, fileName);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log(`Descarga completada exitosamente`);

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
                        records: 0,
                        columns: 0
                    }
                }
            }));

            console.log(`🔄 Iniciando actualización automática en background para ${category}...`);
            executeScrapingInBackground(category);

            setTimeout(() => {
                setDownloadStatus(prev => ({
                    ...prev,
                    [category]: { loading: false, success: false, error: null }
                }));
            }, 5000);

        } catch (error) {
            console.error(`Error descargando ${category}:`, error);
            console.error(`Error completo:`, {
                name: error instanceof Error ? error.name : 'Unknown',
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : 'No stack trace',
                category,
                apiUrl
            });
            
            let errorMessage = 'Error desconocido durante la descarga';
            
            if (error instanceof Error) {
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet o que el servidor esté funcionando.';
                } else if (error.message.includes('Failed to fetch')) {
                    errorMessage = 'Error de conexión. El servidor puede estar caído, no accesible, o hay un problema de CORS.';
                } else if (error.message.includes('timeout')) {
                    errorMessage = 'La descarga tardó demasiado tiempo. El archivo puede ser muy grande o el servidor está lento.';
                } else if (error.message.includes('AbortError')) {
                    errorMessage = 'La descarga fue cancelada por timeout. El servidor puede estar muy lento.';
                } else if (error.message.includes('URL inválida')) {
                    errorMessage = 'La URL de la API no es válida. Contacta al administrador.';
                } else {
                    errorMessage = error.message;
                }
            }

            setDownloadStatus(prev => ({
                ...prev,
                [category]: { 
                    loading: false, 
                    success: false, 
                    error: errorMessage
                }
            }));

            setTimeout(() => {
                setDownloadStatus(prev => ({
                    ...prev,
                    [category]: { loading: false, success: false, error: null }
                }));
            }, 10000);
        }
    };

    const executeScrapingInBackground = async (category: string) => {
        const apiUrl = scrapingEndpoints[category as keyof typeof scrapingEndpoints];
        if (!apiUrl) return;

        try {
            console.log(`🔄 Ejecutando scraping en background para ${category}`);
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category: category,
                    timestamp: new Date().toISOString(),
                    trigger: 'post_download_auto',
                    source: 'background_update'
                })
            });

            if (response.ok) {
                console.log(`✅ Scraping en background completado para ${category}`);
            } else {
                console.error(`❌ Error en scraping en background para ${category}: ${response.status}`);
            }

        } catch (error) {
            console.error(`❌ Error en scraping en background de ${category}:`, error);
        }
    };

    // Función para agregar especie al sistema de agregación
    const addSpeciesToSystem = async (species: SearchResult) => {
        try {
            console.log(`🔄 Agregando especie al sistema:`, species);
            
            // Preparar los datos para enviar al sistema de agregación
            const speciesData = {
                // Campos básicos de la especie
                name: species.name,
                scientific_name: species.scientific_name || '',
                common_name: species.common_name || '',
                family: species.family || '',
                category: species.category,
                
                // Descripción y características
                description: species.description,
                habitat: species.habitat || '',
                distribution: species.distribution || '',
                ecology: species.ecology || '',
                
                // Estado de conservación
                conservation_status: species.conservation_status || '',
                threats: species.threats || '',
                protection: species.protection || '',
                
                // Imagen si está disponible
                image_url: species.image_url || '',
                
                // Metadatos de la operación
                source: 'darwin_search_results',
                added_from: 'PageServiceDarwin',
                timestamp: new Date().toISOString(),
                original_search_query: searchQuery,
                original_category: selectedCategory
            };

            console.log(`📤 Datos preparados para enviar:`, speciesData);

            // Redirigir a la página addSpecies con los datos pre-llenados
            const queryParams = new URLSearchParams();
            Object.entries(speciesData).forEach(([key, value]) => {
                if (value) {
                    queryParams.append(key, value.toString());
                }
            });

            // Redirigir a la página de agregación con los datos
            window.open(`/dashboard/add-species?${queryParams.toString()}`, '_blank');

        } catch (error) {
            console.error(`❌ Error agregando especie al sistema:`, error);
            showErrorNotification('Error al agregar la especie al sistema');
        }
    };

    // Función para mostrar notificación de error
    const showErrorNotification = (message: string) => {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm bg-red-500 text-white';
        
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">❌</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
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

                        {/* Filtros y ordenamiento para resultados */}
                        {searchResults.length > 0 && searchResults[0]?.name !== 'No se encontraron resultados' && searchResults[0]?.name !== 'Error en la búsqueda' && (
                            <div className="border-t pt-4">
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div className="flex-1">
                                        <label className="text-sm font-medium mb-2 block">🔍 Buscar en resultados</label>
                                        <Input
                                            placeholder="Filtrar por nombre, científico, familia, hábitat..."
                                            value={internalSearchQuery}
                                            onChange={(e) => setInternalSearchQuery(e.target.value)}
                                            className="max-w-md"
                                        />
                                    </div>
                                    
                                    <div className="flex gap-2 items-center">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium">Ordenar por:</label>
                                            <Select value={sortBy} onValueChange={(value: 'name' | 'scientific_name' | 'family') => setSortBy(value)}>
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="name">Nombre</SelectItem>
                                                    <SelectItem value="scientific_name">Científico</SelectItem>
                                                    <SelectItem value="family">Familia</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                            >
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </Button>
                                        </div>
                                        
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={clearInternalFilters}
                                        >
                                            Limpiar
                                        </Button>
                                    </div>
                                </div>
                                
                                {/* Información de filtros aplicados */}
                                <div className="mt-2 text-sm text-gray-600">
                                    {internalSearchQuery && (
                                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                                            🔍 Filtrado por: "{internalSearchQuery}"
                                        </span>
                                    )}
                                    <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                        Mostrando {currentResults.length} de {filteredResults.length} resultados
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Resultados de búsqueda con paginación */}
                        {searchResults.length > 0 && (
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold">Resultados de la búsqueda:</h3>
                                    <Badge variant="secondary">
                                        {searchResults[0]?.name === 'No se encontraron resultados' || searchResults[0]?.name === 'Error en la búsqueda' 
                                            ? '0' 
                                            : `${currentResults.length} de ${filteredResults.length}`} resultado{filteredResults.length !== 1 ? 's' : ''}
                                    </Badge>
                                </div>
                                
                                {/* Resultados de la página actual */}
                                <div className="space-y-3">
                                    {currentResults.map((result) => (
                                        <div key={result.id} className={`p-4 border rounded-lg ${
                                            result.name === 'No se encontraron resultados' || result.name === 'Error en la búsqueda'
                                                ? 'bg-yellow-50 border-yellow-200'
                                                : 'bg-gray-50'
                                        }`}>
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-lg">{result.name}</h4>
                                                        
                                                        {result.scientific_name && (
                                                            <p className="text-sm text-gray-600 italic">
                                                                <span className="font-medium">Nombre científico:</span> {result.scientific_name}
                                                            </p>
                                                        )}
                                                        
                                                        {result.common_name && (
                                                            <p className="text-sm text-gray-600">
                                                                <span className="font-medium">Nombre común:</span> {result.common_name}
                                                            </p>
                                                        )}
                                                        
                                                        {result.family && (
                                                            <p className="text-sm text-gray-600">
                                                                <span className="font-medium">Familia:</span> {result.family}
                                                            </p>
                                                        )}
                                                        
                                                        <p className="text-sm text-gray-600 mt-2">{result.description}</p>
                                                        
                                                        {result.habitat && (
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                <span className="font-medium">Hábitat:</span> {result.habitat}
                                                            </p>
                                                        )}
                                                        
                                                        {result.distribution && (
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                <span className="font-medium">Distribución:</span> {result.distribution}
                                                            </p>
                                                        )}
                                                        
                                                        {result.ecology && (
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                <span className="font-medium">Ecología:</span> {result.ecology}
                                                            </p>
                                                        )}
                                                        
                                                        {result.conservation_status && (
                                                            <Badge 
                                                                variant={result.conservation_status.toLowerCase().includes('amenazada') || 
                                                                        result.conservation_status.toLowerCase().includes('vulnerable') || 
                                                                        result.conservation_status.toLowerCase().includes('en peligro') 
                                                                    ? 'destructive' : 'secondary'}
                                                                className="mt-2"
                                                            >
                                                                    {result.conservation_status}
                                                                </Badge>
                                                        )}
                                                        
                                                        {result.threats && (
                                                            <p className="text-sm text-red-600 mt-1">
                                                                <span className="font-medium">Amenazas:</span> {result.threats}
                                                            </p>
                                                        )}
                                                        
                                                        {result.protection && (
                                                            <p className="text-sm text-green-600 mt-1">
                                                                <span className="font-medium">Protección:</span> {result.protection}
                                                            </p>
                                                        )}
                                                    </div>
                                                    
                                                    {result.image_url && (
                                                        <div className="ml-4 flex-shrink-0">
                                                            <img 
                                                                src={result.image_url} 
                                                                alt={result.name}
                                                                className="w-16 h-16 object-cover rounded border"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="secondary">
                                                        {categories.find(c => c.value === result.category)?.label}
                                                    </Badge>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        {/* Botón para más información */}
                                                        {result.name !== 'No se encontraron resultados' && result.name !== 'Error en la búsqueda' && (
                                                            <Button variant="outline" size="sm">
                                                                Ver más detalles
                                                            </Button>
                                                        )}
                                                        
                                                        {/* Botón Agregar al Sistema */}
                                                        {result.name !== 'No se encontraron resultados' && result.name !== 'Error en la búsqueda' && (
                                                            <Button 
                                                                variant="default" 
                                                                size="sm"
                                                                onClick={() => addSpeciesToSystem(result)}
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                            >
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                Agregar al Sistema
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Paginación compacta y eficiente */}
                                {totalPages > 1 && (
                                    <div className="mt-6 flex items-center justify-center">
                                        <div className="flex items-center gap-1">
                                            {/* Botón primera página */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={goToFirstPage}
                                                disabled={currentPage === 1}
                                                className="px-2"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                <ChevronLeft className="h-4 w-4 -ml-2" />
                                            </Button>

                                            {/* Botón página anterior */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={goToPreviousPage}
                                                disabled={currentPage === 1}
                                                className="px-2"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>

                                            {/* Números de página */}
                                            <div className="flex items-center gap-1">
                                                {getPageNumbers().map((page, index) => (
                                                    <div key={index}>
                                                        {page === '...' ? (
                                                            <span className="px-2 py-1 text-gray-500">...</span>
                                                        ) : (
                                                            <Button
                                                                variant={currentPage === page ? "default" : "outline"}
                                                                onClick={() => goToPage(page as number)}
                                                                size="sm"
                                                                className="w-8 h-8 p-0"
                                                            >
                                                                {page}
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Botón página siguiente */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={goToNextPage}
                                                disabled={currentPage === totalPages}
                                                className="px-2"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>

                                            {/* Botón última página */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={goToLastPage}
                                                disabled={currentPage === totalPages}
                                                className="px-2"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                                <ChevronRight className="h-4 w-4 -ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Información adicional de la búsqueda */}
                                {searchResults[0]?.name !== 'No se encontraron resultados' && searchResults[0]?.name !== 'Error en la búsqueda' && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-blue-700">
                                            💡 <strong>Tip:</strong> Los resultados se obtienen de la base de datos del Instituto Darwin. 
                                            Usa el filtro interno para buscar dentro de los resultados, la paginación compacta para navegar por grandes cantidades de datos, 
                                            y el botón verde "Agregar al Sistema" para añadir especies directamente a tu base de datos.
                                        </p>
                                    </div>
                                )}
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
                            <span className="block mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                                🔄 <strong>Actualización Automática:</strong> Los archivos CSV se actualizan automáticamente en background después de cada descarga para mantener los datos siempre frescos.
                            </span>
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
                                                        <div className="text-xs text-blue-600 bg-blue-50 p-1 rounded mt-2">
                                                            Actualizando datos en background...
                                                        </div>
                                                    </div>
                                                )}
                                                {downloadStatus[category.value].error && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center text-red-600 font-medium">
                                                            <XCircle className="mr-2 h-3 w-3" />
                                                            Error en la descarga
                                                        </div>
                                                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                                            {downloadStatus[category.value].error}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            <p>• Verifica que el servidor esté funcionando</p>
                                                            <p>• Intenta nuevamente en unos minutos</p>
                                                            <p>• Contacta al administrador si persiste</p>
                                                        </div>
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
    