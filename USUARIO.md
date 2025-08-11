
# Manual de Usuario: Galapagos DataLens

## 1. Tabla de Contenidos

1.  [Introducción](#2-introducción)
2.	[Control de Versiones](#3-control-de-versiones)
3.	[Avisos Legales y Licencias](#4-avisos-legales-y-licencias)
4.	[Propósito del Manual](#6-propósito-del-manual)
5.	[Alcance del Sistema](#7-alcance-del-sistema)
6.	[Convenciones Tipográficas y Simbología](#8-convenciones-tipográficas-y-simbología)
7.	[Descripción General del Sistema](#9-descripción-general-del-sistema)
8.	[Requisitos y Entorno](#10-requisitos-y-entorno)
    *   [Hardware](#11-requisitos-de-hardware-mínimos-y-recomendados)
    *   [Software](#12-requisitos-de-software)
    *   [Configuraciones Previas](#13-configuraciones-previas-necesarias)
9.	[Instalación y Despliegue](#14-instalación-y-despliegue)
10.	[Primeros Pasos](#15-primeros-pasos)
    *   [Inicio de Sesión y Registro](#a-inicio-de-sesión-o-registro-de-usuarios)
    *   [Recorrido Inicial](#b-recorrido-inicial-por-la-interfaz)
11.	[Guía de Usuario por Módulos](#16-guía-de-usuario-por-módulos)
12.	[Resolución de Problemas](#17-resolución-de-problemas)
13.	[Preguntas Frecuentes (FAQ)](#18-preguntas-frecuentes-faq)
14.	[Soporte y Contacto](#19-soporte-y-contacto)
15.	[Glosario de Términos](#20-glosario-de-términos-y-acrónimos)
16.	[Referencias](#21-referencias-y-bibliografía)
17.	[Anexos](#22-anexos)

---

## 2. Introducción

Este documento sirve como guía completa para los usuarios de la plataforma **Galapagos DataLens**. Proporciona instrucciones detalladas sobre cómo utilizar sus características y funcionalidades, desde el acceso inicial hasta las operaciones más avanzadas de gestión y análisis de datos.

---

## 3. Control de Versiones

| Versión | Fecha      | Autor(es)       | Cambios Realizados                               |
| :------ | :--------- | :-------------- | :----------------------------------------------- |
| 1.0     | 2024-08-08 | [Nombre Autor]  | Creación inicial del manual de usuario.          |
|         |            |                 |                                                  |

---

## 4. Avisos Legales y Licencias

### 5. Derechos de autor, licencia de uso del software, descargos de responsabilidad

- **Derechos de Autor**: © 2024 [Nombre de la Organización o Propietario]. Todos los derechos reservados.
- **Licencia de Uso**: Este software se distribuye bajo la licencia [Nombre de la Licencia, ej. MIT, Apache 2.0]. Para más detalles, consulta el archivo `LICENSE` en el repositorio del proyecto.
- **Descargos de Responsabilidad**: La información presentada en esta plataforma se proporciona "tal cual", sin garantías de ningún tipo. Los datos son para fines de investigación y educativos. No nos hacemos responsables de las decisiones tomadas con base en la información aquí contenida.

---

## 6. Propósito del Manual

El propósito de este manual es capacitar a los usuarios de todos los niveles (Turistas, Investigadores y Administradores) para que utilicen de manera efectiva la plataforma Galapagos DataLens, comprendan su alcance y resuelvan problemas comunes.

---

## 7. Alcance del Sistema

Este manual cubre todas las funcionalidades de la versión actual de Galapagos DataLens, incluyendo:
- Navegación pública del sitio.
- Registro y autenticación de usuarios.
- Gestión de datos de especies (CRUD).
- Visualización de datos (mapas, gráficos).
- Generación de informes y consultas con IA.
- Administración de usuarios (solo para roles de Administrador).

---

## 8. Convenciones Tipográficas y Simbología

Para facilitar la comprensión de este manual, se utilizan las siguientes convenciones:

| Símbolo/Estilo | Significado | Ejemplo |
| :--- | :--- | :--- |
| **Negrita** | Nombres de botones, menús, etiquetas y otros elementos interactivos de la interfaz. | Haz clic en **Guardar Cambios**.<br>Navega a **Panel > Resumen**. |
| *Cursiva* | Énfasis en un término o para introducir un concepto nuevo. | Un *investigador* debe ser verificado por un *administrador*. |
| `Código` | Nombres de archivos, rutas, o fragmentos de código para desarrolladores. | El archivo se encuentra en `src/app/page.tsx`. |
| > **Nota:** | Información adicional, consejos o buenas prácticas que pueden ser útiles. | > **Nota:** Asegúrate de guardar tus cambios antes de salir de la página de edición. |
| >> **Advertencia:** | Indicación de acciones que pueden tener consecuencias importantes o pérdida de datos. | >> **Advertencia:** Eliminar una especie es una acción irreversible y no se puede deshacer. |
| >>> **Importante:** | Información crítica para el correcto funcionamiento de una característica. | >>> **Importante:** Para la generación de PDF, el servidor puede tardar unos segundos. No cierres la ventana. |

### Simbología de Iconos

Los siguientes iconos se utilizan a lo largo de la aplicación para representar acciones comunes:

| Icono (Lucide-React) | Nombre | Acción que Representa |
| :--- | :--- | :--- |
| `Edit` | Editar | Abre el formulario para modificar la información de un elemento. |
| `Trash2` | Eliminar | Inicia el proceso para borrar un elemento de forma permanente. |
| `PlusCircle` | Añadir | Permite crear un nuevo elemento, como una especie o un punto de dato. |
| `ArrowLeft` | Volver | Navega a la página anterior o principal. |
| `FileSearch` | Generar Consulta | Abre la interfaz para comparar datos entre especies. |
| `Layers` | Mapa de Calor | Accede a la visualización de concentración de especies. |
| `Download` | Descargar | Inicia la descarga de un archivo, como un informe en PDF. |
| `CheckCircle` | Verificado / Éxito | Indica que una acción se completó correctamente o que un estado es verificado. |
| `XCircle` | Pendiente / Error | Indica un estado pendiente de aprobación o un error en una operación. |

---

## 9. Descripción General del Sistema

Galapagos DataLens es una plataforma web diseñada para la gestión, visualización y análisis de datos de biodiversidad de las Islas Galápagos. Permite a la comunidad científica y al público general interactuar con un conjunto de datos curado y centralizado.

---

## 10. Requisitos y Entorno

### 11. Requisitos de Hardware Mínimos y Recomendados

- **Mínimos**:
  - Procesador: Dual Core 1.6 GHz
  - RAM: 4 GB
  - Navegador web moderno (Chrome, Firefox, Safari, Edge)
- **Recomendados**:
  - Procesador: Quad Core 2.0 GHz o superior
  - RAM: 8 GB o más
  - Conexión a internet estable para un rendimiento óptimo.

### 12. Requisitos de Software

- **Sistema Operativo**: Windows, macOS, o Linux (no hay dependencia específica).
- **Navegador Web**: Última versión de Google Chrome, Mozilla Firefox, Safari o Microsoft Edge.
- No se requieren librerías o dependencias adicionales por parte del usuario final.

### 13. Configuraciones Previas Necesarias

No se requieren configuraciones previas para el uso general de la plataforma. Para el despliegue o desarrollo local, se necesitan API keys para:
- **Resend**: Para el envío de correos electrónicos.
- **ImgBB**: Para el alojamiento de imágenes.
- **Google AI (Genkit)**: Para las funcionalidades de inteligencia artificial.

---

## 14. Instalación y Despliegue

La plataforma está diseñada para ser accedida a través de un navegador web y no requiere instalación por parte del usuario final. Para desarrolladores, la instalación se realiza clonando el repositorio y ejecutando `npm install`.

---

## 15. Primeros Pasos

### a. Inicio de sesión o registro de usuarios

- **Turistas**: Pueden acceder al sitio público sin necesidad de iniciar sesión.
- **Investigadores**: Deben registrarse en la página de **Login > Registrarse**. Una vez registrados, un administrador debe verificar su cuenta para otorgarles acceso al panel de control.
- **Administradores**: Tienen credenciales pre-configuradas.

### b. Recorrido inicial por la interfaz

- **Página Principal**: Muestra un mapa interactivo y una lista de todas las especies.
- **Panel de Control (`/dashboard`)**: Accesible solo para investigadores y administradores. Contiene herramientas para la gestión de datos, visualización y análisis.
- **Menú Lateral (Dashboard)**: Permite la navegación entre las diferentes secciones del panel.

---

## 16. Guía de Usuario por Módulos

*(Esta sección debe ser desarrollada con capturas de pantalla y descripciones detalladas de cada funcionalidad.)*

- **Módulo de Especies (Público)**:
  - Cómo buscar y filtrar especies.
  - Cómo interpretar la página de detalle de una especie.
- **Módulo de Gestión de Especies (Dashboard)**:
  - Cómo añadir una nueva especie.
  - Cómo editar la información existente.
  - Cómo gestionar los datos históricos.
  - Cómo eliminar una especie (solo Admins).
- **Módulo de Visualización de Datos**:
  - Cómo usar la página de **Generar Consulta** para comparar especies.
  - Cómo interpretar el **Mapa de Calor**.
- **Módulo de Administración (Dashboard)**:
  - Cómo gestionar (verificar, eliminar) las cuentas de los investigadores.

---

## 17. Resolución de Problemas

| Problema Común                                | Posible Causa                                    | Solución                                                                    |
| :-------------------------------------------- | :----------------------------------------------- | :-------------------------------------------------------------------------- |
| No puedo iniciar sesión.                      | Contraseña incorrecta o cuenta no verificada.    | Usa el enlace **¿Olvidaste tu contraseña?** o contacta a un administrador. |
| La imagen que subí no se muestra.             | Error de conexión o formato de archivo no válido. | Intenta subir la imagen de nuevo. Asegúrate de que sea JPG o PNG.          |
| El PDF no se descarga.                        | El proceso en el servidor puede tardar.          | Espera unos segundos y vuelve a intentarlo.                                |

---

## 18. Preguntas Frecuentes (FAQ)

- **¿Quién puede añadir o editar datos de especies?**
  - Solo los usuarios con rol de **Investigador** o **Administrador** pueden modificar los datos.

- **¿Son los datos de la plataforma de acceso público?**
  - La información general de las especies es pública. Los datos históricos detallados solo son visibles para los investigadores, a menos que se marque explícitamente como públicos.

---

## 19. Soporte y Contacto

Para soporte técnico, dudas o sugerencias, por favor contacta a:
- **Email**: `soporte@galapagos-datalens.org`
- **Sitio Web**: `https://galapagos-datalens.org/contact` (página de ejemplo)

---

## 20. Glosario de Términos y Acrónimos

- **CRUD**: Create, Read, Update, Delete (Crear, Leer, Actualizar, Eliminar).
- **IA**: Inteligencia Artificial.
- **UICN**: Unión Internacional para la Conservación de la Naturaleza.
- **API**: Application Programming Interface (Interfaz de Programación de Aplicaciones).

---

## 21. Referencias y Bibliografía

*(Espacio para citar fuentes de datos, trabajos de investigación o documentación técnica relevante.)*

---

## 22. Anexos

*(Sección para incluir información adicional, como diagramas de flujo detallados, ejemplos de datos de entrada/salida, etc.)*

