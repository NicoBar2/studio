
import type { Species } from '@/lib/types';

export type Language = 'es' | 'en';

export type Translations = {
    // General
    loading: string;
    error: string;
    success: string;
    goBack: string;
    dashboard: string;
    species: string;
    login: string;
    logout: string;
    publicSite: string;
    edit: string;
    backToDashboard: string;
    selectPlaceholder: string;
    optional: string;
    deleteButton: string;
    deleting: string;
    updating: string;
    areYouSure: string;
    cancel: string;
    confirmDelete: string;
    deleteWarning: (name: string) => string;
    collaborators: string;
    
    // Header
    role_admin: string;
    role_researcher: string;
    role_tourist: string;

    // Sidebar
    sidebar_summary: string;
    sidebar_generate_query: string;
    sidebar_add_species: string;
    sidebar_manage_researchers: string;
    sidebar_import_species: string;
    sidebar_public_site: string;
    sidebar_heatmap: string;

    // Login Page
    loginTitle: string;
    loginDesc: string;
    forgotPasswordLink: string;
    registerTitle: string;
    registerDesc: string;
    createAccountButton: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    fullName: string;
    fullNamePlaceholder: string;
    institution: string;
    institutionPlaceholder: string;
    specialization: string;
    specializationPlaceholder: string;

    // Add/Edit Species Page
    addSpecies_title: string;
    addSpecies_description: string;
    addSpecies_createButton: string;
    creating: string;
    addSpecies_section_names: string;
    addSpecies_label_spanishName: string;
    addSpecies_label_englishName: string;
    genus: string;
    specificEpithet: string;
    addSpecies_section_status: string;
    iucnDescription: string;
    increasing: string;
    decreasing: string;
    stable: string;
    unknown: string;
    addSpecies_section_distribution: string;
    addSpecies_label_islands: string;
    addSpecies_section_descriptions: string;
    addSpecies_label_spanishDesc: string;
    addSpecies_label_englishDesc: string;
    addSpecies_label_threats: string;
    addSpecies_section_image: string;
    addSpecies_label_uploadImage: string;
    addSpecies_image_hint: string;
    addSpecies_section_visibility: string;
    addSpecies_label_showPublic: string;
    year: string;
    value: string;
    unit: string;
    description: string;
    descriptionPlaceholder: string;
    addDataPoint: string;

    // Public home page
    public_map_title: string;
    public_map_description: string;
    public_clear_selection: string;
    public_species_in: (island: string) => string;
    public_all_species: string;
    public_filter_by_island_placeholder: string;
    public_search_placeholder: string;
    public_species_found_count: (count: number) => string;
    public_no_results_all: string;
    public_no_results_island: (island: string) => string;
    public_no_results_search: (term: string) => string;
    public_no_results_both: (term: string, island: string) => string;
    public_try_different_filters: string;

    // Collaborators Page
    collaborators_title: string;
    collaborators_description: string;
    collaborators_no_results: string;
    collaborators_check_back: string;

    // Dashboard
    dashboard_welcome: string;
    dashboard_description: string;
    dashboard_map_title: string;
    dashboard_map_description: string;
    dashboard_filter_island: string;
    dashboard_select_island_placeholder: string;
    allIslands: string;
    dashboard_search_label: string;
    dashboard_search_placeholder: string;
    clearFilters: string;
    dashboard_species_in: (island: string) => string;
    dashboard_all_species_summary: string;
    searchingFor: string;
    dashboard_species_shown: (shown: number, total: number) => string;
    viewVisualizations: string;
    viewPublicPage: string;
    noSpeciesFound: string;
    tryDifferentFilters: string;
    clearAllFilters: string;
    
    // Admin pages
    admin_create_researcher_title: string;
    admin_create_researcher_desc: string;
    createResearcherButton: string;
    researcherList: string;
    researcherListDesc: string;
    verified: string;
    pending: string;
    markVerified: string;
    markUnverified: string;
    noResearchersYet: string;

    // Map component
    mapAriaLabel: string;
    
    // Compare page
    compare_title: string;
    compare_description: string;
    compare_filters_title: string;
    compare_filter_family: string;
    compare_filter_family_placeholder: string;
    compare_filter_family_all: string;
    compare_filter_year: string;
    startYear: string;
    endYear: string;
    startYearAria: string;
    endYearAria: string;
    compare_select_species: string;
    unitless: string;
    compare_no_species_match: string;
    compare_chart_placeholder_title: string;
    compare_chart_placeholder_desc: string;
    compare_chart_title_prefix: string;

    // Visualize page
    visualize_title_prefix: string;
    speciesNotFound: string;
    visualize_filters_title: string;
    visualize_filters_desc: (name: string) => string;
    visualize_minYear: string;
    visualize_maxYear: string;
    visualize_minValue: (unit: string) => string;
    visualize_maxValue: (unit: string) => string;
    visualize_value_placeholder: string;
    visualize_value_placeholder_max: string;
    visualize_main_title_prefix: string;
    visualize_main_title_desc: (name: string) => string;
    noDataForFilters: string;
    tryAdjustingFilters: string;
    visualize_table_title: string;
    visualize_table_desc: (name: string) => string;
    visualize_stats_title: string;
    visualize_stats_desc: (name: string) => string;
    metric: string;
    maxInRange: string;
    minInRange: string;
    avgInRange: string;

    // Heatmap Page
    heatmap_description: string;
    heatmap_select_species: string;
    heatmap_search_species: string;
    heatmap_select_all: string;
    heatmap_clear_selection: string;
    heatmap_species_selected: (count: number) => string;

    // Species Details
    speciesDescription: string;
    taxonomicClassification: string;
    conservationAndPopulation: string;
    iucnStatus: string;
    populationTrend: string;
    habitat: string;
    keyStats: string;
    mainThreats: string;
    geographicDistribution: string;
    registrationInfo: string;
    creationDate: string;
    aiSummary: string;
    aiSummaryDescription: string;
    generateAISummary: string;
    generating: string;
    historicalData: string;
    historicalDataVisualization: string;
    historicalDataGraphDesc: string;
    downloadPdfReport: string;
    generatingPdf: string;
    // Other dynamic text can be functions
    getSpeciesName: (species: Species) => string;
    getSpeciesDescription: (species: Species) => string;
};

const esTranslations: Translations = {
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    goBack: "Volver",
    dashboard: "Panel",
    species: "Especies",
    login: "Iniciar Sesión",
    logout: "Cerrar Sesión",
    publicSite: "Sitio Público",
    edit: "Editar",
    backToDashboard: "Volver al Panel",
    selectPlaceholder: "Seleccionar...",
    optional: "Opcional",
    deleteButton: "Eliminar",
    deleting: "Eliminando...",
    updating: "Actualizando...",
    areYouSure: "¿Estás seguro?",
    cancel: "Cancelar",
    confirmDelete: "Sí, eliminar",
    deleteWarning: (name) => `Estás a punto de eliminar permanentemente la especie ${name}. Esta acción no se puede deshacer.`,
    collaborators: "Colaboradores",
    
    role_admin: "Administrador/a",
    role_researcher: "Investigador/a",
    role_tourist: "Turista",

    sidebar_summary: "Resumen",
    sidebar_generate_query: "Búsqueda interactiva de especies",
    sidebar_add_species: "Añadir Especie",
    sidebar_manage_researchers: "Gestionar Investigadores",
    sidebar_import_species: "Importar Especies",
    sidebar_public_site: "Sitio Público",
    sidebar_heatmap: "Mapa de Calor",

    loginTitle: "Acceder",
    loginDesc: "Investigadores verificados, si es su primer acceso, la contraseña que ingresen se establecerá como su nueva contraseña.",
    forgotPasswordLink: "¿Olvidaste tu contraseña?",
    registerTitle: "Registro de Investigador",
    registerDesc: "Crea una cuenta. Un administrador deberá verificarla antes de que puedas iniciar sesión.",
    createAccountButton: "Crear Cuenta",
    email: "Correo Electrónico",
    emailPlaceholder: "tu@email.com",
    password: "Contraseña",
    passwordPlaceholder: "Tu contraseña",
    fullName: "Nombre Completo",
    fullNamePlaceholder: "Ej: Dra. Jane Goodall",
    institution: "Institución",
    institutionPlaceholder: "Ej: Universidad de Galápagos",
    specialization: "Especialización",
    specializationPlaceholder: "Ej: Biología Marina",

    addSpecies_title: "Añadir Nueva Especie",
    addSpecies_description: "Completa el formulario para registrar una nueva especie en la base de datos.",
    addSpecies_createButton: "Crear Especie",
    creating: "Creando...",
    addSpecies_section_names: "Nombres e Identificación",
    addSpecies_label_spanishName: "Nombre Común en Español (Obligatorio)",
    addSpecies_label_englishName: "Nombre Común en Inglés",
    genus: "Género",
    specificEpithet: "Epíteto Específico",
    addSpecies_section_status: "Estado y Tendencia",
    iucnDescription: "UICN: Unión Internacional para la Conservación de la Naturaleza.",
    increasing: 'Creciente',
    decreasing: 'Decreciente',
    stable: 'Estable',
    unknown: 'Desconocida',
    addSpecies_section_distribution: "Distribución",
    addSpecies_label_islands: "Islas de Presencia",
    addSpecies_section_descriptions: "Descripciones y Amenazas",
    addSpecies_label_spanishDesc: "Descripción (Español)",
    addSpecies_label_englishDesc: "Descripción (Inglés)",
    addSpecies_label_threats: "Amenazas (separadas por coma)",
    addSpecies_section_image: "Imagen de la Especie",
    addSpecies_label_uploadImage: "Subir Imagen (Opcional)",
    addSpecies_image_hint: "Si no subes una imagen, se usará una imagen de marcador de posición.",
    addSpecies_section_visibility: "Configuración de Visibilidad",
    addSpecies_label_showPublic: "Permitir que el público vea el gráfico de datos históricos de esta especie.",
    year: "Año",
    value: "Valor",
    unit: "Unidad",
    description: "Descripción",
    descriptionPlaceholder: "Ej: Censo post-evento El Niño",
    addDataPoint: "Añadir Punto de Dato",

    public_map_title: "Explorador Interactivo de Especies de Galápagos",
    public_map_description: "Selecciona una isla en el mapa o del desplegable para descubrir las especies que allí habitan, o explora todas las especies listadas abajo.",
    public_clear_selection: "Ver Todas las Especies / Limpiar Selección",
    public_species_in: (island) => `Especies en ${island}`,
    public_all_species: "Todas las Especies Representativas",
    public_filter_by_island_placeholder: "Filtrar por isla...",
    public_search_placeholder: "Buscar por nombre, hábitat...",
    public_species_found_count: (count) => `${count} ${count === 1 ? 'especie encontrada' : 'especies encontradas'}`,
    public_no_results_all: "No hay datos de especies disponibles para mostrar.",
    public_no_results_island: (island) => `No se encontraron especies destacadas en ${island} en nuestra base de datos actual.`,
    public_no_results_search: (term) => `No se encontraron especies que coincidan con "${term}".`,
    public_no_results_both: (term, island) => `No se encontraron especies que coincidan con "${term}" en ${island}.`,
    public_try_different_filters: "Intenta con otro término de búsqueda o ajusta los filtros.",

    collaborators_title: "Nuestros Colaboradores",
    collaborators_description: "Un reconocimiento a los investigadores verificados que contribuyen a esta plataforma.",
    collaborators_no_results: "Actualmente no hay investigadores colaboradores para mostrar.",
    collaborators_check_back: "Vuelve a consultar más tarde.",

    dashboard_welcome: "¡Bienvenido/a",
    dashboard_description: "Gestiona, filtra y analiza los datos de las especies de Galápagos.",
    dashboard_map_title: "Mapa Interactivo y Filtros",
    dashboard_map_description: "Usa el mapa o los filtros para explorar y encontrar especies específicas para gestionar.",
    dashboard_filter_island: "Filtrar por Isla",
    dashboard_select_island_placeholder: "Seleccionar isla...",
    allIslands: "Todas las Islas",
    dashboard_search_label: "Buscar por Nombre o Hábitat",
    dashboard_search_placeholder: "Buscar por nombre, hábitat...",
    clearFilters: "Limpiar Filtros",
    dashboard_species_in: (island) => `Especies en ${island}`,
    dashboard_all_species_summary: "Resumen de Todas las Especies",
    searchingFor: "buscando",
    dashboard_species_shown: (shown, total) => `${shown} de ${total} Especies Mostradas`,
    viewVisualizations: "Ver Visualizaciones",
    viewPublicPage: "Ver Página Pública",
    noSpeciesFound: "No se encontraron especies que coincidan con los filtros aplicados.",
    tryDifferentFilters: "Intenta con otros filtros o límpialos para ver todas las especies.",
    clearAllFilters: "Limpiar todos los filtros",
    
    admin_create_researcher_title: "Crear Nuevo Investigador (Admin)",
    admin_create_researcher_desc: "Añade un nuevo investigador directamente al sistema. La cuenta se creará como no verificada.",
    createResearcherButton: "Crear Investigador",
    researcherList: "Lista de Investigadores",
    researcherListDesc: "Gestiona los investigadores registrados en el sistema. Verifica, desverifica o elimina sus cuentas.",
    verified: "Verificado",
    pending: "Pendiente",
    markVerified: "Marcar Verificado",
    markUnverified: "Marcar No Verificado",
    noResearchersYet: "No hay investigadores registrados todavía.",

    mapAriaLabel: "Mapa interactivo de las Islas Galápagos",

    compare_title: "Búsqueda interactiva de especies",
    compare_description: "Utiliza los criterios de búsqueda para filtrar y seleccionar especies, y visualiza las comparaciones.",
    compare_filters_title: "Criterios de búsqueda",
    compare_filter_family: "Filtrar por Familia",
    compare_filter_family_placeholder: "Seleccionar familia...",
    compare_filter_family_all: "Todas las familias",
    compare_filter_year: "Rango de Años del Gráfico",
    startYear: "Inicio",
    endYear: "Fin",
    startYearAria: "Año de inicio del filtro",
    endYearAria: "Año máximo del filtro",
    compare_select_species: "Seleccionar Especies",
    unitless: "sin unidad",
    compare_no_species_match: "No hay especies que coincidan con el filtro de familia.",
    compare_chart_placeholder_title: "Visualiza tus Datos",
    compare_chart_placeholder_desc: "Selecciona una o más especies del panel de criterios de búsqueda para comenzar.",
    compare_chart_title_prefix: "Comparación por:",
    
    visualize_title_prefix: "Visualizar",
    speciesNotFound: "Especie No Encontrada",
    visualize_filters_title: "Filtros de Datos Históricos",
    visualize_filters_desc: (name) => `Ajusta los rangos para filtrar los datos que se muestran en el gráfico, estadísticas y tabla de ${name}.`,
    visualize_minYear: "Año Mínimo",
    visualize_maxYear: "Año Máximo",
    visualize_minValue: (unit) => `Valor Mínimo (${unit})`,
    visualize_maxValue: (unit) => `Valor Máximo (${unit})`,
    visualize_value_placeholder: "Ej: 1000",
    visualize_value_placeholder_max: "Ej: 50000",
    visualize_main_title_prefix: "Visualización de Datos:",
    visualize_main_title_desc: (name) => `Gráficos de barras interactivos que muestran datos históricos filtrados para ${name}.`,
    noDataForFilters: "No hay datos históricos que coincidan con los filtros aplicados.",
    tryAdjustingFilters: "Intenta ajustar los filtros o limpiarlos para ver más datos.",
    visualize_table_title: "Datos Históricos Tabulados (Filtrados)",
    visualize_table_desc: (name) => `Tabla de los datos históricos filtrados para ${name}.`,
    visualize_stats_title: "Estadísticas Históricas Clave (Filtradas)",
    visualize_stats_desc: (name) => `Un resumen de los datos históricos filtrados de ${name}.`,
    metric: "Métrica",
    maxInRange: "Máximo en Rango Filtrado",
    minInRange: "Mínimo en Rango Filtrado",
    avgInRange: "Promedio en Rango Filtrado",

    heatmap_description: "Visualiza la concentración de especies seleccionadas en el archipiélago.",
    heatmap_select_species: "Seleccionar Especies",
    heatmap_search_species: "Buscar especie...",
    heatmap_select_all: "Seleccionar todo",
    heatmap_clear_selection: "Limpiar selección",
    heatmap_species_selected: (count) => `${count} especies seleccionadas`,

    speciesDescription: "Descripción",
    taxonomicClassification: "Clasificación Taxonómica",
    conservationAndPopulation: "Conservación y Población",
    iucnStatus: "Estado UICN",
    populationTrend: "Tendencia Poblacional",
    habitat: "Hábitat",
    keyStats: "Estadísticas Clave",
    mainThreats: "Amenazas Principales",
    geographicDistribution: "Distribución Geográfica",
    registrationInfo: "Información de Registro",
    creationDate: "Fecha de Creación",
    aiSummary: "Resumen Generado por IA",
    aiSummaryDescription: "Obtén un resumen rápido del estado actual e importancia de esta especie.",
    generateAISummary: "Generar Resumen con IA",
    generating: "Generando...",
    historicalData: "Datos Históricos",
    historicalDataVisualization: "Visualización de Datos Históricos",
    historicalDataGraphDesc: "Gráficos de barras que muestran datos históricos de la población u otras métricas relevantes.",
    downloadPdfReport: "Descargar Informe en PDF",
    generatingPdf: "Generando PDF...",
    getSpeciesName: (s) => s.spanishCommonName,
    getSpeciesDescription: (s) => s.spanishDescription,
};

const enTranslations: Translations = {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    goBack: "Go Back",
    dashboard: "Dashboard",
    species: "Species",
    login: "Login",
    logout: "Logout",
    publicSite: "Public Site",
    edit: "Edit",
    backToDashboard: "Back to Dashboard",
    selectPlaceholder: "Select...",
    optional: "Optional",
    deleteButton: "Delete",
    deleting: "Deleting...",
    updating: "Updating...",
    areYouSure: "Are you sure?",
    cancel: "Cancel",
    confirmDelete: "Yes, delete",
    deleteWarning: (name) => `You are about to permanently delete the species ${name}. This action cannot be undone.`,
    collaborators: "Collaborators",

    role_admin: "Administrator",
    role_researcher: "Researcher",
    role_tourist: "Tourist",

    sidebar_summary: "Summary",
    sidebar_generate_query: "Interactive Species Search",
    sidebar_add_species: "Add Species",
    sidebar_manage_researchers: "Manage Researchers",
    sidebar_import_species: "Import Species",
    sidebar_public_site: "Public Site",
    sidebar_heatmap: "Heatmap",

    loginTitle: "Login",
    loginDesc: "Verified researchers, if this is your first time logging in, the password you enter will be set as your new password.",
    forgotPasswordLink: "Forgot your password?",
    registerTitle: "Researcher Registration",
    registerDesc: "Create an account. An administrator will need to verify it before you can log in.",
    createAccountButton: "Create Account",
    email: "Email",
    emailPlaceholder: "you@email.com",
    password: "Password",
    passwordPlaceholder: "Your password",
    fullName: "Full Name",
    fullNamePlaceholder: "e.g., Dr. Jane Goodall",
    institution: "Institution",
    institutionPlaceholder: "e.g., University of Galapagos",
    specialization: "Specialization",
    specializationPlaceholder: "e.g., Marine Biology",
    
    addSpecies_title: "Add New Species",
    addSpecies_description: "Complete the form to register a new species in the database.",
    addSpecies_createButton: "Create Species",
    creating: "Creating...",
    addSpecies_section_names: "Names and Identification",
    addSpecies_label_spanishName: "Spanish Common Name (Required)",
    addSpecies_label_englishName: "English Common Name",
    genus: "Genus",
    specificEpithet: "Specific Epithet",
    addSpecies_section_status: "Status and Trend",
    iucnDescription: "IUCN: International Union for Conservation of Nature.",
    increasing: 'Increasing',
    decreasing: 'Decreasing',
    stable: 'Stable',
    unknown: 'Unknown',
    addSpecies_section_distribution: "Distribution",
    addSpecies_label_islands: "Island Presence",
    addSpecies_section_descriptions: "Descriptions and Threats",
    addSpecies_label_spanishDesc: "Description (Spanish)",
    addSpecies_label_englishDesc: "Description (English)",
    addSpecies_label_threats: "Threats (comma-separated)",
    addSpecies_section_image: "Species Image",
    addSpecies_label_uploadImage: "Upload Image (Optional)",
    addSpecies_image_hint: "If you don't upload an image, a placeholder will be used.",
    addSpecies_section_visibility: "Visibility Settings",
    addSpecies_label_showPublic: "Allow the public to see the historical data chart for this species.",
    year: "Year",
    value: "Value",
    unit: "Unit",
    description: "Description",
    descriptionPlaceholder: "e.g., Post-El Niño event census",
    addDataPoint: "Add Data Point",

    public_map_title: "Interactive Galápagos Species Explorer",
    public_map_description: "Select an island on the map or from the dropdown to discover the species that live there, or explore all listed species below.",
    public_clear_selection: "View All Species / Clear Selection",
    public_species_in: (island) => `Species on ${island}`,
    public_all_species: "All Representative Species",
    public_filter_by_island_placeholder: "Filter by island...",
    public_search_placeholder: "Search by name, habitat...",
    public_species_found_count: (count) => `${count} ${count === 1 ? 'species found' : 'species found'}`,
    public_no_results_all: "No species data available to display.",
    public_no_results_island: (island) => `No featured species found on ${island} in our current database.`,
    public_no_results_search: (term) => `No species matching "${term}" found.`,
    public_no_results_both: (term, island) => `No species matching "${term}" found on ${island}.`,
    public_try_different_filters: "Try another search term or adjust the filters.",
    
    collaborators_title: "Our Collaborators",
    collaborators_description: "A recognition of the verified researchers who contribute to this platform.",
    collaborators_no_results: "There are currently no collaborating researchers to display.",
    collaborators_check_back: "Please check back later.",

    dashboard_welcome: "Welcome",
    dashboard_description: "Manage, filter, and analyze data for Galápagos species.",
    dashboard_map_title: "Interactive Map and Filters",
    dashboard_map_description: "Use the map or filters to explore and find specific species to manage.",
    dashboard_filter_island: "Filter by Island",
    dashboard_select_island_placeholder: "Select island...",
    allIslands: "All Islands",
    dashboard_search_label: "Search by Name or Habitat",
    dashboard_search_placeholder: "Search by name, habitat...",
    clearFilters: "Clear Filters",
    dashboard_species_in: (island) => `Species on ${island}`,
    dashboard_all_species_summary: "All Species Summary",
    searchingFor: "searching for",
    dashboard_species_shown: (shown, total) => `Showing ${shown} of ${total} Species`,
    viewVisualizations: "View Visualizations",
    viewPublicPage: "View Public Page",
    noSpeciesFound: "No species found matching the applied filters.",
    tryDifferentFilters: "Try different filters or clear them to see all species.",
    clearAllFilters: "Clear all filters",

    admin_create_researcher_title: "Create New Researcher (Admin)",
    admin_create_researcher_desc: "Add a new researcher directly to the system. The account will be created as unverified.",
    createResearcherButton: "Create Researcher",
    researcherList: "Researcher List",
    researcherListDesc: "Manage registered researchers in the system. Verify, un-verify, or delete their accounts.",
    verified: "Verified",
    pending: "Pending",
    markVerified: "Mark Verified",
    markUnverified: "Mark Unverified",
    noResearchersYet: "No researchers registered yet.",

    mapAriaLabel: "Interactive map of the Galápagos Islands",

    compare_title: "Interactive Species Search",
    compare_description: "Use the search criteria to filter and select species, and visualize the comparisons.",
    compare_filters_title: "Search Criteria",
    compare_filter_family: "Filter by Family",
    compare_filter_family_placeholder: "Select family...",
    compare_filter_family_all: "All families",
    compare_filter_year: "Chart Year Range",
    startYear: "Start",
    endYear: "End",
    startYearAria: "Start year for filter",
    endYearAria: "End year for filter",
    compare_select_species: "Select Species",
    unitless: "unitless",
    compare_no_species_match: "No species match the family filter.",
    compare_chart_placeholder_title: "Visualize Your Data",
    compare_chart_placeholder_desc: "Select one or more species from the criteria panel to begin.",
    compare_chart_title_prefix: "Comparison by:",

    visualize_title_prefix: "Visualize",
    speciesNotFound: "Species Not Found",
    visualize_filters_title: "Historical Data Filters",
    visualize_filters_desc: (name) => `Adjust the ranges to filter the data shown in the chart, stats, and table for ${name}.`,
    visualize_minYear: "Minimum Year",
    visualize_maxYear: "Maximum Year",
    visualize_minValue: (unit) => `Minimum Value (${unit})`,
    visualize_maxValue: (unit) => `Maximum Value (${unit})`,
    visualize_value_placeholder: "e.g., 1000",
    visualize_value_placeholder_max: "e.g., 50000",
    visualize_main_title_prefix: "Data Visualization:",
    visualize_main_title_desc: (name) => `Interactive bar charts showing filtered historical data for ${name}.`,
    noDataForFilters: "No historical data matches the applied filters.",
    tryAdjustingFilters: "Try adjusting or clearing the filters to see more data.",
    visualize_table_title: "Tabulated Historical Data (Filtered)",
    visualize_table_desc: (name) => `Table of the filtered historical data for ${name}.`,
    visualize_stats_title: "Key Historical Stats (Filtered)",
    visualize_stats_desc: (name) => `A summary of the filtered historical data for ${name}.`,
    metric: "Metric",
    maxInRange: "Maximum in Filtered Range",
    minInRange: "Minimum in Filtered Range",
    avgInRange: "Average in Filtered Range",
    
    heatmap_description: "Visualize the concentration of selected species across the archipelago.",
    heatmap_select_species: "Select Species",
    heatmap_search_species: "Search species...",
    heatmap_select_all: "Select all",
    heatmap_clear_selection: "Clear selection",
    heatmap_species_selected: (count) => `${count} species selected`,

    speciesDescription: "Description",
    taxonomicClassification: "Taxonomic Classification",
    conservationAndPopulation: "Conservation & Population",
    iucnStatus: "IUCN Status",
    populationTrend: "Population Trend",
    habitat: "Habitat",
    keyStats: "Key Stats",
    mainThreats: "Main Threats",
    geographicDistribution: "Geographic Distribution",
    registrationInfo: "Registration Information",
    creationDate: "Creation Date",
    aiSummary: "AI-Generated Summary",
    aiSummaryDescription: "Get a quick summary of the current status and importance of this species.",
    generateAISummary: "Generate AI Summary",
    generating: "Generating...",
    historicalData: "Historical Data",
    historicalDataVisualization: "Historical Data Visualization",
    historicalDataGraphDesc: "Bar charts showing historical population data or other relevant metrics.",
    downloadPdfReport: "Download PDF Report",
    generatingPdf: "Generating PDF...",
    getSpeciesName: (s) => s.englishCommonName || s.spanishCommonName,
    getSpeciesDescription: (s) => s.englishDescription || s.spanishDescription,
};

export const translations: Record<Language, Translations> = {
    es: esTranslations,
    en: enTranslations,
};

/**
 * Gets the translation object for a given language. Can be used on the server.
 * @param lang The desired language ('es' or 'en').
 * @returns The translations object.
 */
export function getTranslations(lang: Language): Translations {
    return translations[lang] || translations['es'];
}
