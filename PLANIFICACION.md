# Planificación del Proyecto: Galapagos DataLens

Este documento describe las fases de desarrollo, los hitos clave y las futuras mejoras planificadas para la plataforma Galapagos DataLens.

## 1. Fases del Proyecto

El desarrollo se puede estructurar en las siguientes fases, muchas de las cuales ya han sido completadas en el prototipo actual.

### Fase 1: Estructura y Funcionalidades Base (Completada)
- **Hito 1.1**: Configuración inicial del proyecto con Next.js, TypeScript y Tailwind CSS.
- **Hito 1.2**: Implementación del sistema de roles de usuario (Turista, Investigador, Administrador) y lógica de autenticación.
- **Hito 1.3**: Creación de las páginas públicas principales: página de inicio con mapa, lista de especies y página de detalle de especie.
- **Hito 1.4**: Desarrollo del panel de control (`/dashboard`) con guardias de rol para proteger el acceso.
- **Hito 1.5**: Implementación de las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para las especies, con permisos asignados por rol.

### Fase 2: Visualización de Datos y Análisis (Completada)
- **Hito 2.1**: Integración de gráficos (Recharts) para la visualización de datos históricos en las páginas de detalle y comparación.
- **Hito 2.2**: Desarrollo de la página de "Generar Consulta" para la comparación dinámica de múltiples especies.
- **Hito 2.3**: Implementación del "Mapa de Calor" para visualizar la concentración de especies en el archipiélago.

### Fase 3: Integración de Inteligencia Artificial (Completada)
- **Hito 3.1**: Configuración de Genkit para la integración con modelos de lenguaje de Google AI.
- **Hito 3.2**: Creación del flujo de IA (`compareSpeciesFlow`) para generar análisis comparativos de texto.
- **Hito 3.3**: Creación del flujo para la generación de resúmenes de especies en la página de detalle.
- **Hito 3.4**: Implementación de la generación de informes en PDF utilizando Puppeteer, controlada por un flujo (`generatePdfFlow`).

### Fase 4: Gestión Administrativa y Mejoras (Completada)
- **Hito 4.1**: Desarrollo de la interfaz para la gestión de investigadores (verificación, eliminación de cuentas) por parte del administrador.
- **Hito 4.2**: Implementación del sistema de notificaciones por correo electrónico (Resend) para la verificación de cuentas y restablecimiento de contraseña.
- **Hito 4.3**: Creación de la página de perfil de usuario para que los investigadores puedan actualizar su propia información.
- **Hito 4.4**: Creación de una página de ejemplo para la conexión con microservicios externos ("Servicio Darwin").

## 2. Futuras Mejoras (Planificación a Largo Plazo)

- **Mejora de la Gestión de Datos**:
  - **Historial de Cambios**: Implementar un registro de auditoría para rastrear quién editó qué especie y cuándo.
  - **Validación Avanzada de Datos**: Añadir validaciones más estrictas en los formularios para garantizar la coherencia de los datos taxonómicos y numéricos.

- **Expansión de Funcionalidades de IA**:
  - **Análisis Predictivo**: Utilizar datos históricos para generar pronósticos de tendencias poblacionales.
  - **Asistente de Chat**: Crear un chatbot que permita a los usuarios hacer preguntas en lenguaje natural sobre los datos de las especies.
  - **Identificación de Especies por Imagen**: Permitir a los usuarios subir una foto de una especie y que la IA intente identificarla.

- **Optimización y Rendimiento**:
  - **Paginación y Carga Diferida (Infinite Scrolling)**: Optimizar la carga de la lista de especies en la página principal y el panel de control.
  - **Optimización de Imágenes**: Implementar una estrategia más avanzada para la compresión y el servicio de imágenes.

- **Colaboración y Comunidad**:
  - **Foros de Discusión**: Añadir un espacio para que los investigadores discutan sobre especies o datos específicos.
  - **API Pública**: Ofrecer una API de solo lectura para que otros sistemas puedan consumir los datos públicos de la plataforma.
