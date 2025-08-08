# Requisitos del Proyecto: Galapagos DataLens

Este documento detalla los requisitos funcionales, los roles de usuario y la base conceptual que definen el propósito y alcance de la plataforma Galapagos DataLens.

## 1. Descripción General y Propósito

Galapagos DataLens es una plataforma de software diseñada para la gestión, visualización y análisis de datos sobre la biodiversidad de las Islas Galápagos. El sistema debe cumplir con los siguientes objetivos:

- **Centralización de Datos**: Servir como un repositorio único y curado para la información de especies, accesible para diferentes perfiles de usuario.
- **Gestión de Información**: Permitir a usuarios autorizados (Investigadores, Administradores) añadir, editar y actualizar de forma segura la información detallada de las especies.
- **Visualización Interactiva**: Ofrecer herramientas visuales, como un mapa de calor y gráficos comparativos, para explorar la distribución geográfica y las tendencias poblacionales de las especies.
- **Asistencia con IA**: Utilizar un modelo de lenguaje (a través de Genkit) para generar resúmenes analíticos y comparativas de datos, actuando como un asistente de investigación virtual.
- **Acceso Basado en Roles**: Implementar un sistema de autenticación y autorización que proteja la integridad de los datos mientras permite el acceso público para fines educativos.
- **Generación de Informes**: Proveer una funcionalidad para que los usuarios puedan descargar informes de especies en formato PDF con secciones personalizables.

## 2. Tipo de Investigación y Base Conceptual

La plataforma está diseñada para soportar investigación de carácter **descriptivo** y **comparativo**, fundamental en ecología y conservación.

| Aspecto Metodológico | Justificación en la Plataforma |
|---|---|
| **Identificación y Caracterización** | Formularios de edición detallados para almacenar taxonomía, descripciones, hábitat y amenazas. |
| **Distribución y Abundancia** | Registros de presencia por isla (`is_...`) y visualización de la concentración de especies a través del **Mapa de Calor**. |
| **Tendencias Temporales** | Monitoreo de cambios poblacionales a lo largo del tiempo mediante los **Datos Históricos** y gráficos de visualización. |
| **Análisis Comparativo** | La página de **Generar Consulta** permite contrastar datos históricos y de estado de conservación entre múltiples especies. |
| **Evaluación del Estado de Conservación** | Centralización de la clasificación de la UICN y la tendencia poblacional, métricas clave para la toma de decisiones en conservación. |

## 3. Comparativa con Otras Plataformas

- **Frente a Herramientas de Propósito General (ej. Excel, Google Sheets)**: DataLens ofrece una interfaz estructurada con validaciones, seguridad basada en roles y visualizaciones interactivas (mapas/gráficos) diseñadas para datos de biodiversidad, minimizando errores y agilizando el análisis.
- **Frente a Bases de Datos Globales (ej. GBIF, iNaturalist)**: A diferencia de los repositorios masivos de avistamientos, DataLens es una **herramienta curada para un ecosistema específico**. Permite a un equipo de investigación gestionar su propio conjunto de datos detallados, incluyendo tendencias históricas y análisis, no solo puntos de observación.

## 4. Roles de Usuario

El sistema define tres roles de usuario para gestionar el acceso a la información y las funcionalidades.

### 4.1. Turista (Público General)
- **Acceso**: No requiere autenticación.
- **Permisos**:
  - Navegar y ver la información pública de las especies.
  - Ver la lista de investigadores colaboradores.
  - No puede acceder al panel de control (`/dashboard`).

### 4.2. Investigador
- **Acceso**: Requiere registro y verificación por parte de un Administrador.
- **Permisos**:
  - Iniciar sesión para acceder al panel de control.
  - Acceder a todas las funcionalidades comunes del panel:
    - Ver resúmenes y visualizaciones detalladas.
    - **Añadir nuevas especies**.
    - **Editar la información de especies existentes**.
    - Generar consultas comparativas.
    - Utilizar el mapa de calor.
    - Editar su propio perfil.

### 4.3. Administrador
- **Acceso**: Pre-configurado en el sistema.
- **Permisos**:
  - Todos los permisos del rol de Investigador.
  - **Gestionar cuentas de investigadores**: verificar, desverificar y eliminar cuentas.
  - Acceder a funcionalidades administrativas especiales, como la conexión con servicios externos (ej. Servicio Darwin).
  - Tiene la capacidad de **eliminar especies**, una acción crítica no disponible para los investigadores.
