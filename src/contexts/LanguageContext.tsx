
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import type { Species } from '@/lib/types';

export type Language = 'es' | 'en';

type Translations = {
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
    // Header
    role_admin: string;
    role_researcher: string;
    role_tourist: string;
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
    historicalDataVisualization: string;
    historicalDataGraphDesc: string;
    downloadPdfReport: string;
    generatingPdf: string;
    // Other dynamic text can be functions
    getSpeciesName: (species: Species, lang: Language) => string;
    getSpeciesDescription: (species: Species, lang: Language) => string;
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
    role_admin: "Administrador/a",
    role_researcher: "Investigador/a",
    role_tourist: "Turista",
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
    historicalDataVisualization: "Visualización de Datos Históricos",
    historicalDataGraphDesc: "Gráficos de barras que muestran datos históricos de la población u otras métricas relevantes.",
    downloadPdfReport: "Descargar Informe en PDF",
    generatingPdf: "Generando PDF...",
    getSpeciesName: (s, lang) => s.spanishCommonName,
    getSpeciesDescription: (s, lang) => s.spanishDescription,
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
    role_admin: "Administrator",
    role_researcher: "Researcher",
    role_tourist: "Tourist",
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
    historicalDataVisualization: "Historical Data Visualization",
    historicalDataGraphDesc: "Bar charts showing historical population data or other relevant metrics.",
    downloadPdfReport: "Download PDF Report",
    generatingPdf: "Generating PDF...",
    getSpeciesName: (s, lang) => s.englishCommonName || s.spanishCommonName,
    getSpeciesDescription: (s, lang) => s.englishDescription || s.spanishDescription,
};

const translations: Record<Language, Translations> = {
    es: esTranslations,
    en: enTranslations,
};

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    const storedLang = localStorage.getItem('galapagos-language') as Language | null;
    if (storedLang && ['es', 'en'].includes(storedLang)) {
      setLanguage(storedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('galapagos-language', lang);
    document.documentElement.lang = lang;
  };
  
  const t = useMemo(() => translations[language], [language]);

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
