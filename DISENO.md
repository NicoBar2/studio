# Diseño Técnico del Proyecto: Galapagos DataLens

Este documento describe la arquitectura, la pila tecnológica y las decisiones de diseño que dan forma a la plataforma Galapagos DataLens.

## 1. Justificación de las Decisiones de Diseño y Tecnología

- **Enfoque en las Galápagos**: Este archipiélago es un "laboratorio viviente" de renombre mundial, lo que lo convierte en un caso de uso ideal y de alto impacto para una plataforma de datos de conservación.
- **Pila Tecnológica Moderna**:
  - **Next.js (App Router)**: Elegido por su rendimiento, renderizado del lado del servidor (beneficioso para el SEO de las páginas públicas) y la facilidad para crear Server Actions. Las Server Actions permiten manejar operaciones de datos de forma segura sin necesidad de una API REST separada, simplificando la arquitectura.
  - **Genkit (Google AI)**: Se utiliza para las funciones de IA (resúmenes, comparativas). Simplifica drásticamente la integración con modelos de lenguaje avanzados (LLMs), permitiendo crear potentes asistentes de investigación con un código mínimo.
  - **Puppeteer**: Se seleccionó para la generación de PDFs del lado del servidor. A diferencia de otras librerías, renderiza una página HTML real en un navegador sin cabeza, garantizando una alta fidelidad visual y evitando problemas complejos de dependencias de compilación.
  - **ShadCN y Tailwind CSS**: Permiten un desarrollo rápido de una interfaz de usuario profesional, estéticamente agradable y totalmente personalizable, manteniendo al mismo tiempo un código limpio y mantenible.
  - **Autenticación Propia**: Se implementó un sistema de autenticación con `bcryptjs` y `Resend` para simular un entorno real donde el control de acceso es gestionado internamente, en lugar de depender de proveedores de identidad externos.

## 2. Pila Tecnológica (Tech Stack)

- **Framework**: Next.js (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes UI**: ShadCN UI Components
- **Inteligencia Artificial**: Genkit (con Google AI)
- **Generación de PDF**: Puppeteer
- **Criptografía**: `bcryptjs` para el hashing de contraseñas
- **Envío de Correos**: Resend
- **Visualización de Mapas**: Leaflet, React-Leaflet
- **Gráficos**: Recharts

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
