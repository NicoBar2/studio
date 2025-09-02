# Diseño Técnico del Proyecto: Galapagos DataLens

Este documento describe la arquitectura, la pila tecnológica y las decisiones de diseño que dan forma a la plataforma Galapagos DataLens.

## 1. Justificación de las Decisiones de Diseño y Tecnología

- **Enfoque en las Galápagos**: Este archipiélago es un "laboratorio viviente" de renombre mundial, lo que lo convierte en un caso de uso ideal y de alto impacto para una plataforma de datos de conservación.
- **Pila Tecnológica Moderna**:
  - **Next.js (App Router)**: Elegido por su rendimiento, renderizado del lado del servidor (beneficioso para el SEO de las páginas públicas) y la facilidad para crear Server Actions. Las Server Actions permiten manejar operaciones de datos de forma segura sin necesidad de una API REST separada, simplificando la arquitectura.
  - **Genkit (Google AI)**: Se utiliza para las funciones de IA (resúmenes, comparativas). Simplifica drásticamente la integración con modelos de lenguaje avanzados (LLMs), permitiendo crear potentes asistentes de investigación con un código mínimo.
  - **ShadCN y Tailwind CSS**: Permiten un desarrollo rápido de una interfaz de usuario profesional, estéticamente agradable y totalmente personalizable, manteniendo al mismo tiempo un código limpio y mantenible.
  - **Autenticación Propia**: Se implementó un sistema de autenticación con `bcryptjs` y `Resend` para simular un entorno real donde el control de acceso es gestionado internamente, en lugar de depender de proveedores de identidad externos.

## 2. Pila Tecnológica (Tech Stack)

- **Framework**: Next.js (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes UI**: ShadCN UI Components
- **Inteligencia Artificial**: Genkit (con Google AI)
- **Criptografía**: `bcryptjs` para el hashing de contraseñas
- **Envío de Correos**: Resend
- **Visualización de Mapas**: Leaflet, React-Leaflet
- **Gráficos**: Recharts
- **Alojamiento de Imágenes**: ImgBB

## 3. Mapa de Navegación del Prototipo

El siguiente diagrama ilustra la estructura de rutas y la navegación principal de la aplicación.

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

## 4. Arquitectura de Implementación

La arquitectura de implementación describe cómo las piezas del software están organizadas y se comunican a un nivel técnico.

- **Aplicación Monolítica con Next.js (App Router)**: El proyecto no se divide en un "frontend" y un "backend" separados. Se aprovecha la arquitectura moderna de Next.js donde el código del cliente (navegador) y el del servidor (lógica de negocio) conviven en la misma base de código, simplificando el desarrollo.
- **Componentes de React del Lado del Servidor (RSC)**: La mayoría de los componentes se renderizan en el servidor para mejorar el rendimiento, enviando HTML listo al navegador y reduciendo el JavaScript inicial.
- **Server Actions**: Todas las operaciones que modifican datos (crear, editar, eliminar) se manejan con "Server Actions". Estas funciones de backend se llaman de forma segura desde el frontend sin necesidad de una API REST.
- **Capa de IA (Genkit)**: Las funciones de IA se definen como "flujos" de Genkit (`src/ai/flows/...`). Estos flujos se ejecutan en el servidor y son invocados por las Server Actions para interactuar con los modelos de Google AI.
- **Base de Datos (Simulada)**: En este prototipo, la base de datos se simula con archivos JSON locales (`src/lib/data/*.json`). Las Server Actions leen y escriben en estos archivos. En un sistema de producción, esto se sustituiría por una base de datos real (ej. Firestore, PostgreSQL).
- **Servicios Externos**: La aplicación se conecta con APIs de terceros para funciones específicas:
  - **Resend**: Para el envío de correos transaccionales.
  - **ImgBB**: Para el alojamiento de las imágenes de las especies.

## 5. Arquitectura del Sistema

La arquitectura del sistema es una vista de alto nivel que describe cómo interactúan las partes principales para cumplir los requisitos.

```
+----------------+      +-------------------------+      +---------------------+
|                |      |                         |      |                     |
|   Cliente      |----->|   Servidor Next.js      |----->|   Capa de Datos     |
|  (Navegador)   |      |   (Lógica Principal)    |      | (Archivos JSON)     |
|                |      |                         |      |                     |
+----------------+      +-----------+-------------+      +---------------------+
                        |           |
                        |           |
                        v           v
            +----------------+  +----------------+
            |                |  |                |
            | Capa de IA     |  | Servicios      |
            | (Genkit)       |  | Externos       |
            |                |  | (Resend, ImgBB)|
            +----------------+  +----------------+
```

1.  **Cliente (Navegador)**: El usuario interactúa con la interfaz (React, ShadCN). Las acciones del usuario (clics, formularios) llaman a las Server Actions.
2.  **Servidor Next.js (Lógica Principal)**: El núcleo de la aplicación. Recibe las peticiones, ejecuta las Server Actions, invoca a Genkit para tareas de IA, lee/escribe en los archivos JSON y se comunica con servicios externos.
3.  **Capa de Datos**: Archivos JSON que actúan como una base de datos simple para el prototipo.
4.  **Capa de IA (Genkit)**: Abstrae la comunicación con los modelos de lenguaje de Google AI.
5.  **Servicios Externos**: APIs de terceros que proveen funcionalidades que no son parte del núcleo de la aplicación.