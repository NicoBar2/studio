# Galapagos DataLens

## Descripción General

**Galapagos DataLens** es una plataforma de software especializada, diseñada como un sistema de información para la investigación y la conservación de la biodiversidad en las Islas Galápagos. Su propósito principal es servir como un centro de datos centralizado y curado donde la comunidad científica y el público pueden interactuar con datos complejos sobre las especies icónicas del archipiélago.

Para una comprensión más profunda del proyecto, la documentación se ha dividido en las siguientes secciones:

- **[Requisitos del Proyecto](./REQUERIMIENTOS.md)**: Detalla el propósito, el alcance funcional, los roles de usuario y la base conceptual de la plataforma.
- **[Diseño Técnico](./DISENO.md)**: Explica la arquitectura, la pila tecnológica, el mapa de navegación y las justificaciones detrás de las decisiones de diseño.
- **[Planificación del Proyecto](./PLANIFICACION.md)**: Describe las fases de desarrollo, los hitos clave y las futuras mejoras planificadas.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Lenguaje**: TypeScript
- **UI**: React, ShadCN UI Components, Tailwind CSS
- **Inteligencia Artificial**: Genkit (Google AI)
- **Generación de PDF**: Puppeteer
- **Autenticación**: Sistema propio con bcryptjs y Resend para correos.
