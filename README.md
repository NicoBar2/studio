# Galapagos DataLens

## Descripción General y Propósito del Proyecto

Galapagos DataLens es una plataforma de software especializada, diseñada como un sistema de información para la investigación y la conservación de la biodiversidad en las Islas Galápagos. Su propósito principal es servir como un centro de datos centralizado y curado donde investigadores, administradores y el público general pueden interactuar con datos complejos sobre las especies icónicas del archipiélago.

La plataforma va más allá de ser una simple base de datos; es una herramienta integral que combina:
- **Gestión de Datos**: Permite a los usuarios autorizados editar y actualizar información detallada de las especies.
- **Visualización Interactiva**: Ofrece mapas y gráficos para explorar la distribución geográfica y las tendencias poblacionales.
- **Inteligencia Artificial**: Utiliza IA para enriquecer automáticamente los datos de las especies con información de fuentes confiables de internet, actuando como un asistente de investigación virtual.
- **Acceso Basado en Roles**: Garantiza la integridad de los datos al tiempo que permite el acceso público para la educación y la concienciación.

## Tipo de Investigación y Base Conceptual

La plataforma está diseñada para apoyar la **investigación ecológica y de conservación**. Facilita la recopilación, gestión y análisis de datos fundamentales para entender y proteger la biodiversidad, tales como:

- **Dinámica de Poblaciones**: A través de sus capacidades de visualización de datos históricos, permite a los investigadores analizar tendencias poblacionales a lo largo del tiempo.
- **Biogeografía y Distribución de Especies**: El mapa interactivo ayuda a estudiar la distribución de las especies en las diferentes islas, un aspecto clave de la ecología de Galápagos.
- **Estado de Conservación**: Centraliza el seguimiento del estado de conservación de las especies según la UICN, una métrica vital para los esfuerzos de protección.
- **Estudios Taxonómicos y Biológicos**: El modelo de datos detallado permite almacenar información taxonómica completa, descripciones, hábitats, amenazas y estadísticas clave, proporcionando una visión holística de cada especie.

## Comparativa con Otras Plataformas

- **Frente a Herramientas de Propósito General (ej. Excel, Google Sheets)**: A diferencia de las hojas de cálculo, DataLens ofrece una interfaz estructurada, validaciones de datos, seguridad basada en roles y visualizaciones interactivas (mapas/gráficos) diseñadas específicamente para datos de biodiversidad, lo que reduce errores y facilita el análisis.
- **Frente a Bases de Datos Globales (ej. GBIF, iNaturalist)**: Mientras que las plataformas globales son repositorios masivos de datos de avistamientos, DataLens es una **herramienta curada para un ecosistema específico**. Está pensada para que un equipo de investigación gestione su propio conjunto de datos detallado, incluyendo tendencias históricas y estadísticas clave, en lugar de solo puntos de observación.
- **Frente a Software de Laboratorio Personalizado**: DataLens busca ser una alternativa moderna, basada en la web y fácil de usar a las herramientas internas que muchos laboratorios construyen. Aprovecha tecnologías como Next.js y la IA para ser más potente y accesible.

## Justificación de las Decisiones de Diseño y Tecnología

- **Enfoque en las Galápagos**: Este archipiélago es un "laboratorio viviente" mundialmente famoso, lo que lo convierte en un caso de uso ideal y de alto impacto para una plataforma de datos de conservación.
- **Control de Acceso Basado en Roles**: El sistema de tres roles (Turista, Investigador, Administrador) simula un escenario real donde la divulgación pública es importante, pero la integridad de los datos debe ser protegida por expertos.
- **Pila Tecnológica Moderna**:
  - **Next.js (App Router)**: Elegido por su rendimiento, renderizado del lado del servidor (bueno para el SEO de las páginas públicas) y la facilidad para crear Server Actions, que manejan las operaciones de datos de forma segura sin una API separada.
  - **Genkit**: Se utiliza para las funciones de IA porque simplifica la integración con modelos de lenguaje avanzados, permitiendo crear potentes asistentes de investigación como la función de "Enriquecer con IA".
  - **ShadCN y Tailwind CSS**: Permiten un desarrollo rápido de una interfaz de usuario profesional, estéticamente agradable y totalmente personalizable.
- **Funcionalidades Clave**: El mapa interactivo, los gráficos y la importación de Excel fueron incluidos para abordar los puntos débiles comunes en la gestión de datos de investigación, automatizando y visualizando la información para que sea más intuitiva y útil.

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- ShadCN UI Components
- Genkit (for AI features)

## Roles de Usuario

- **Turista**: Rol predeterminado, puede navegar por la información pública de las especies.
- **Investigador**: Puede ver visualizaciones detalladas y editar datos (requiere verificación de cuenta).
- **Administrador**: Control total sobre la edición de datos y la gestión de usuarios.
