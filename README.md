
# Galapagos DataLens

## Descripción General y Propósito del Proyecto

Galapagos DataLens es una plataforma de software especializada, diseñada como un sistema de información para la investigación y la conservación de la biodiversidad en las Islas Galápagos. Su propósito principal es servir como un centro de datos centralizado y curado donde investigadores, administradores y el público general pueden interactuar con datos complejos sobre las especies icónicas del archipiélago.

La plataforma va más allá de ser una simple base de datos; es una herramienta integral que combina:
- **Gestión de Datos**: Permite a los usuarios autorizados (Investigadores, Administradores) editar y actualizar información detallada de las especies.
- **Visualización Interactiva**: Ofrece un mapa de calor y gráficos comparativos para explorar la distribución geográfica y las tendencias poblacionales.
- **Inteligencia Artificial**: Utiliza Genkit para generar resúmenes y análisis comparativos de los datos, actuando como un asistente de investigación virtual.
- **Acceso Basado en Roles**: Garantiza la integridad de los datos al tiempo que permite el acceso público para la educación y la concienciación.
- **Generación de Informes**: Permite descargar informes en formato PDF con secciones personalizables.

## Tipo de Investigación y Base Conceptual

La investigación fundamental soportada por Galapagos DataLens es de carácter **descriptivo** y **comparativo**. Este enfoque metodológico es ideal para la ecología de conservación, ya que permite:

| Aspecto | Justificación en la Plataforma |
|---|---|
| **Identificación y Caracterización** | Almacena taxonomía, descripciones, hábitat y amenazas en formularios de edición detallados. |
| **Distribución y Abundancia** | Registra la presencia por isla (`is_...`) y permite visualizar la concentración de especies en el **Mapa de Calor**. |
| **Tendencias Temporales** | Monitorea cambios poblacionales a lo largo del tiempo a través de los **Datos Históricos** y los gráficos de visualización. |
| **Análisis Comparativo** | La página de **Generar Consulta** permite contrastar datos históricos entre múltiples especies. |
| **Evaluación del Estado de Conservación** | Centraliza la clasificación de la UICN y la tendencia poblacional, métricas vitales para la conservación. |

## Mapa de Navegación del Prototipo

```text
                                [ / ] - Sitio Público
                                  |
            +---------------------+---------------------+
            |                     |                     |
      [ /login ]         [ /species/[id] ]      [ /colaboradores ]
      (Login/Registro)   (Página Pública         (Lista Pública de
                         de Especie)              Investigadores)


                                [ /dashboard ] - Panel Protegido
                                  |
      +---------------------------+---------------------------+
      |                           |                           |
[ Rol: Investigador ]       [ Rol: Administrador ]       [ Común para ambos ]
      |                           |                           |
      |                           |                           +-- Resumen de Especies
      |                           |                           +-- Editar Especie
      |                           |                           +-- Añadir Especie
      |                           |                           +-- Generar Consulta (Comparador)
      |                           |                           +-- Mapa de Calor
      |                           |                           +-- Mi Perfil
      |                           |
      |                           +-- Gestionar Investigadores
      |                           +-- Conexión Servicio Darwin
      |
      +-- (Tiene acceso a todo lo común)

```

## Comparativa con Otras Plataformas

- **Frente a Herramientas de Propósito General (ej. Excel, Google Sheets)**: A diferencia de las hojas de cálculo, DataLens ofrece una interfaz estructurada, validaciones de datos, seguridad basada en roles y visualizaciones interactivas (mapas/gráficos) diseñadas específicamente para datos de biodiversidad, lo que reduce errores y facilita el análisis.
- **Frente a Bases de Datos Globales (ej. GBIF, iNaturalist)**: Mientras que las plataformas globales son repositorios masivos de datos de avistamientos, DataLens es una **herramienta curada para un ecosistema específico**. Está pensada para que un equipo de investigación gestione su propio conjunto de datos detallado, incluyendo tendencias históricas y estadísticas clave, en lugar de solo puntos de observación.
- **Frente a Software de Laboratorio Personalizado**: DataLens busca ser una alternativa moderna, basada en la web y fácil de usar a las herramientas internas que muchos laboratorios construyen. Aprovecha tecnologías como Next.js y la IA para ser más potente y accesible.

## Justificación de las Decisiones de Diseño y Tecnología

- **Enfoque en las Galápagos**: Este archipiélago es un "laboratorio viviente" mundialmente famoso, lo que lo convierte en un caso de uso ideal y de alto impacto para una plataforma de datos de conservación.
- **Control de Acceso Basado en Roles**: El sistema de tres roles (Turista, Investigador, Administrador) simula un escenario real donde la divulgación pública es importante, pero la integridad de los datos debe ser protegida por expertos. La autenticación se maneja a través de un sistema propio con contraseñas hasheadas (bcrypt).
- **Pila Tecnológica Moderna**:
  - **Next.js (App Router)**: Elegido por su rendimiento, renderizado del lado del servidor (bueno para el SEO de las páginas públicas) y la facilidad para crear Server Actions, que manejan las operaciones de datos de forma segura sin una API separada.
  - **Genkit**: Se utiliza para las funciones de IA (resúmenes, comparativas) porque simplifica la integración con modelos de lenguaje avanzados, permitiendo crear potentes asistentes de investigación.
  - **Puppeteer**: Para la generación de PDFs del lado del servidor, ofreciendo alta fidelidad y evitando problemas de dependencias de compilación.
  - **ShadCN y Tailwind CSS**: Permiten un desarrollo rápido de una interfaz de usuario profesional, estéticamente agradable y totalmente personalizable.
- **Funcionalidades Clave**: El mapa interactivo, el mapa de calor, los gráficos y la generación de PDF fueron incluidos para abordar los puntos débiles comunes en la gestión de datos de investigación, automatizando y visualizando la información para que sea más intuitiva y útil.

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- ShadCN UI Components
- Genkit (para funciones de IA)
- Puppeteer (para generación de PDF)
- bcryptjs (para hashing de contraseñas)
- Resend (para envío de correos electrónicos)

## Roles de Usuario

- **Turista**: Rol predeterminado. Puede navegar por la información pública de las especies y la lista de colaboradores. No puede acceder al panel de control.
- **Investigador**: Puede iniciar sesión, acceder al panel de control, ver visualizaciones detalladas, editar y añadir datos de especies. Requiere verificación de cuenta por un administrador.
- **Administrador**: Control total sobre la edición de datos, la gestión de usuarios (verificación, eliminación) y el acceso a todas las funcionalidades del panel.
