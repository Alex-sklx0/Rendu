# RENDU — Funcionamiento del frontend

Este documento explica cómo está construido el frontend de RENDU, qué responsabilidad tiene cada archivo y cómo se conectan las partes de la aplicación.

La guía está escrita para entender y mantener el código actual. No reemplaza el contrato de API ni la guía general de desarrollo:

- [README principal](../README.md): propósito y alcance de RENDU.
- [Guía general de desarrollo](README-desarrollo.md): Docker, comandos y convenciones del repositorio.
- [Contrato de API](agents/api-contract.md): formas de datos compartidas con backend.

## 1. Qué tecnología usa

El frontend es una aplicación SPA (Single Page Application) construida con:

- **React:** construye la interfaz mediante componentes.
- **TypeScript:** agrega tipos estáticos a props, formularios, respuestas y estados.
- **Vite:** servidor de desarrollo y herramienta de build.
- **React Router:** cambia de pantalla según la URL sin recargar todo el navegador.
- **Tailwind CSS:** estilos utilitarios escritos principalmente como clases `className`.
- **React Hook Form:** manejo de formularios complejos.
- **Zod:** validación de datos antes de enviarlos.
- **localStorage:** persistencia temporal de los datos simulados.

No hay un estado global como Redux. Cada página administra su propio estado con `useState`, ejecuta cargas iniciales con `useEffect` y llama a la capa de API.

## 2. Cómo arranca la aplicación

El arranque ocurre en cuatro pasos:

```text
index.html
   ↓
main.tsx
   ↓
App.tsx
   ↓
router.tsx + AppShell
   ↓
página correspondiente a la URL
```

### `frontend/index.html`

Es el documento HTML mínimo que Vite entrega al navegador. Contiene el elemento raíz, normalmente `<div id="root"></div>`, donde React monta toda la aplicación.

No contiene las pantallas ni la lógica de negocio. Solo sirve como entrada HTML.

### `frontend/src/main.tsx`

Es el punto de entrada de React.

- Busca el elemento `root` del HTML.
- Crea la raíz con `ReactDOM.createRoot`.
- Renderiza `App`.
- Importa `index.css` para cargar los estilos globales.
- Usa `React.StrictMode`, que ayuda a detectar problemas durante desarrollo.

El operador `!` en `getElementById("root")!` indica a TypeScript que el elemento existe en el HTML.

### `frontend/src/App.tsx`

Es un componente muy pequeño que entrega el router a React mediante `RouterProvider`.

```tsx
export default function App() {
  return <RouterProvider router={router} />;
}
```

La decisión de qué página mostrar no está en `App.tsx`, sino en `router.tsx`.

### `frontend/src/router.tsx`

Define todas las rutas de la aplicación usando `createBrowserRouter`.

La ruta raíz usa `AppShell` como componente padre y las páginas aparecen dentro de su `<Outlet />`. Esto permite compartir encabezado, navegación y ancho general sin repetirlos en cada página.

Rutas principales:

| URL | Componente | Propósito |
| --- | --- | --- |
| `/` | `SplashPage` | Pantalla inicial con redirección al onboarding. |
| `/home` | `HomePage` | Índice de pantallas y accesos del prototipo. |
| `/splash` | `SplashPage` | Splash inicial. |
| `/splash1` | `Splash1Page` | Onboarding sobre conectar subproductos. |
| `/splash2` | `Splash2Page` | Onboarding sobre transporte. |
| `/splash3` | `Splash3Page` | Onboarding sobre certificación. |
| `/login` | `LoginPage` | Inicio de sesión visual. |
| `/pre_register` y `/pre-register` | `PreRegisterPage` | Selección de persona o empresa. |
| `/registro_persona` y `/registro-persona` | `RegistroPersonaPage` | Registro visual de una persona. |
| `/registro_empresa` y `/registro-empresa` | `RegistroEmpresaPage` | Registro visual de una empresa. |
| `/communication` y `/comunicacion` | `CommunicationPage` | Configuración del medio de contacto. |
| `/catalogo` | `CatalogPage` | Búsqueda y filtros del catálogo. |
| `/catalogo/:id` | `SubproductDetailPage` | Detalle de un subproducto. `:id` es dinámico. |
| `/perfil` | `ProfilePage` | Perfil y publicaciones propias. |
| `/subproductos/:id/editar` | `UpdateSubproductPage` | Edición de un subproducto. |
| `/publicar` | `PostSubproductPage` | Publicación de un subproducto. |
| `/matching` | `MatchingPage` | Vista inicial del módulo de coincidencias. |
| `/registro` | `RegisterPage` | Formulario general de registro con tabs. |
| `/subproductos/nuevo` | `RegisterSubproductPage` | Formulario alternativo de registro de subproducto. |

Las rutas con guion bajo y con guion medio existen para aceptar ambas formas mientras se consolidan los nombres definitivos.

## 3. Marco visual y navegación

### `frontend/src/components/layout/AppShell.tsx`

Es el layout principal de la aplicación.

Sus responsabilidades son:

- Mostrar el encabezado superior en las pantallas internas.
- Mostrar el logo enlazado al catálogo.
- Mostrar los accesos a publicar, catálogo y matching.
- Mostrar notificaciones y acceso al perfil.
- Renderizar la página activa mediante `<Outlet />`.
- Aplicar el ancho máximo y el padding general a las pantallas internas.
- Ocultar el encabezado en splash, login, registro y comunicación para replicar los wireframes independientes.

La lista `isStandaloneScreen` decide qué rutas no deben mostrar el header. Si se crea una nueva pantalla independiente, hay que agregar su ruta a esa lista.

`NavLink` permite aplicar estilos diferentes al enlace activo. `useLocation` permite leer la URL actual y `Link` navega internamente sin recargar la aplicación.

## 4. Organización de `src`

```text
frontend/src/
├── api/          comunicación con mocks o backend
├── components/   piezas reutilizables de interfaz
├── img/          imágenes y wireframes
├── lib/          constantes, validadores y utilidades
├── pages/        pantallas asociadas a rutas
├── types/        modelos TypeScript
├── App.tsx       proveedor principal del router
├── index.css     estilos globales y clases compartidas
├── main.tsx      entrada de React
├── router.tsx    definición de URLs
└── vite-env.d.ts tipos de Vite para TypeScript
```

## 5. Comunicación con datos

### `frontend/src/api/client.ts`

Es la única capa que deberían importar las páginas para leer o modificar datos.

Las páginas no llaman directamente a `fetch` ni a `mockClient`. En su lugar, llaman funciones como:

- `registrarUsuario`
- `registrarEmpresa`
- `registrarSubproducto`
- `getCatalogo`
- `getSubproductoDetalle`
- `getMisPublicaciones`
- `actualizarSubproducto`

Esta separación permite cambiar el origen de datos sin reescribir las páginas.

El cliente lee dos variables:

```text
VITE_USE_MOCKS
VITE_API_BASE_URL
```

La expresión:

```ts
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";
```

hace que los mocks estén activos por defecto. Solo se usa el backend real cuando `VITE_USE_MOCKS` vale exactamente `"false"`.

Cuando los mocks están activos:

```text
página → client.ts → mockClient.ts → localStorage
```

Cuando están desactivados:

```text
página → client.ts → fetch → backend Express
```

Las funciones privadas `get` y `post` centralizan las solicitudes HTTP y convierten respuestas no exitosas en errores legibles.

### `frontend/src/api/mockClient.ts`

Simula el backend mientras los controllers reales no están terminados.

Características principales:

- Usa la clave `rendu_mock_db` en `localStorage`.
- Agrega una latencia artificial de 350 ms para que las pantallas puedan mostrar estados de carga.
- Crea usuarios, empresas y subproductos.
- Incluye un catálogo inicial con seis subproductos de ejemplo.
- Filtra el catálogo por texto, familia y municipio.
- Devuelve el detalle de un subproducto.
- Devuelve las publicaciones del perfil.
- Actualiza el subproducto y conserva los cambios en `localStorage`.

`DEFAULT_CATALOG` contiene los datos iniciales de demostración. Si se necesita cambiar el catálogo de ejemplo, se modifica esa constante.

`MockDB` representa la estructura persistida:

```ts
{
  usuarios: Usuario[],
  empresas: Empresa[],
  subproductos: Subproducto[],
  catalogo?: SubproductoDetalle[]
}
```

`loadDB()` lee la información existente o crea una base inicial. `saveDB()` serializa la base con `JSON.stringify`. `delay()` devuelve una promesa retardada para imitar una petición de red.

El mapa `familiaMap` transforma identificadores como `textil` en una etiqueta visible y un emoji para el catálogo mock.

### Cambio futuro al backend real

Cuando exista el backend funcional:

1. Se configura `VITE_USE_MOCKS=false`.
2. Se configura `VITE_API_BASE_URL`.
3. Se comprueba que las respuestas coincidan con `docs/agents/api-contract.md`.
4. Se actualizan simultáneamente contrato, tipos y cliente si cambia alguna forma de datos.
5. Se eliminan o mantienen los mocks solo como herramienta de desarrollo, según la decisión del equipo.

## 6. Tipos y modelos

### `frontend/src/types/index.ts`

Define las formas principales que usa la interfaz:

- `Usuario`: id, correo, rol y fecha de registro.
- `Empresa`: usuario asociado, nombre, NIT, municipio, tipo de actor y contacto.
- `Subproducto`: forma de creación y estado de disponibilidad.
- `SubproductoCatalogo`: datos resumidos para las tarjetas del catálogo.
- `SubproductoDetalle`: datos del catálogo más descripción, condiciones, frecuencia, fecha y contacto.

`SubproductoDetalle` extiende `SubproductoCatalogo`, por eso un detalle puede reutilizar los campos básicos del catálogo y añadir información adicional.

Los tipos no validan datos en tiempo de ejecución. Solo ayudan a TypeScript durante el desarrollo. La validación de formularios se hace con Zod.

## 7. Constantes y validación

### `frontend/src/lib/constants.ts`

Es la fuente central de opciones reutilizadas en formularios y filtros:

- `FAMILIAS_MATERIAL`: papel y cartón, plásticos, vidrio, metales, textil y madera.
- `MUNICIPIOS_VALLE_ABURRA`: municipios disponibles.
- `UNIDADES_VOLUMEN`: kg, ton, m3 y unidades.
- `TIPOS_ACTOR`: generador, transformador, ECA y reciclador.
- Tipos TypeScript `FamiliaMaterial`, `UnidadVolumen` y `TipoActor`.

Si una opción cambia, debe cambiarse aquí para evitar listas duplicadas en las páginas.

### `frontend/src/lib/validators.ts`

Contiene los esquemas Zod usados para validar formularios:

- `personaSchema`: nombre, correo, contraseña y aceptación de términos.
- `empresaRegistroSchema`: razón social, NIT, correo corporativo, contraseña y términos.
- `usuarioSchema`: forma anterior de usuario con confirmación de contraseña.
- `empresaSchema`: forma de empresa alineada al contrato de API.
- `subproductoSchema`: nombre, descripción, familia, volumen, unidad y municipio.

`zodResolver` conecta estos esquemas con React Hook Form. Los mensajes de error se muestran mediante `FormField` u otros componentes de formulario.

### `frontend/src/lib/clsx.ts`

Utilidad pequeña para combinar nombres de clases CSS condicionalmente. Sirve para evitar concatenaciones manuales cuando una clase depende de un estado.

## 8. Componentes reutilizables

### `frontend/src/components/ui/RenduLogo.tsx`

Muestra el logo de RENDU usando la imagen de la caja. Permite controlar tamaño y si se muestra el texto de la marca. Lo usan el header, login, registro y páginas de onboarding.

### `frontend/src/components/ui/SubproductCard.tsx`

Representa un elemento del catálogo:

- imagen o emoji del material,
- familia,
- nombre,
- cantidad,
- empresa y municipio,
- enlace al detalle.

Recibe un `SubproductoCatalogo` mediante props y navega a `/catalogo/:id`.

### `frontend/src/components/ui/FormField.tsx`

Envuelve un campo de formulario con etiqueta, estado de error, indicador de requerido y texto auxiliar. Centraliza la estructura visual de los formularios.

### `frontend/src/components/ui/Input.tsx`

Input reutilizable con estilos del sistema y soporte para `hasError`. Usa `forwardRef` para poder conectarse con React Hook Form.

### `frontend/src/components/ui/PasswordInput.tsx`

Input de contraseña con botón para alternar entre contraseña visible y oculta.

### `frontend/src/components/ui/Select.tsx`

Select reutilizable que mantiene los estilos de los campos y puede mostrar estado de error.

### `frontend/src/components/ui/Textarea.tsx`

Textarea reutilizable para descripciones largas, también compatible con refs de formularios.

### `frontend/src/components/ui/Button.tsx`

Botón compartido con variantes de estilo y estados de carga/deshabilitado. Algunas pantallas nuevas todavía usan botones escritos directamente con clases Tailwind.

### `frontend/src/components/ui/Banner.tsx`

Muestra mensajes de éxito, error o información en formularios.

### `frontend/src/components/ui/Stepper.tsx`

Representa pasos de un flujo, usado principalmente por el formulario de registro de subproducto.

### `frontend/src/components/forms/FamilySelect.tsx`

Select especializado en familias de material. Consume `FAMILIAS_MATERIAL` y recibe la configuración de registro del formulario.

### `frontend/src/components/forms/MunicipioSelect.tsx`

Select especializado en municipios del Valle de Aburrá. Consume `MUNICIPIOS_VALLE_ABURRA`.

### `frontend/src/components/forms/PhotoDropzone.tsx`

Área para seleccionar o arrastrar fotografías. Permite previsualizaciones locales y limita cantidad/tamaño mediante props como `maxFiles` y `maxSizeMB`.

Actualmente la fotografía se maneja en la interfaz; el contrato de subida persistente todavía está pendiente de definirse con backend.

### `frontend/src/components/forms/VolumeField.tsx`

Campo compuesto para volumen y unidad. Reutiliza las opciones de `UNIDADES_VOLUMEN`.

## 9. Pantallas

Todas las páginas exportan un componente React por defecto y se registran en `router.tsx`.

### Inicio y onboarding

#### `pages/SplashPage.tsx`

Muestra el logo inicial. Usa `useEffect` y `setTimeout` para redirigir automáticamente a `/splash1` después de tres segundos.

#### `pages/Splash1Page.tsx`

Primera pantalla informativa. Presenta la conexión de subproductos y usa `circle_box.png`.

#### `pages/Splash2Page.tsx`

Segunda pantalla informativa. Presenta el transporte y usa `shipper.png`.

#### `pages/Splash3Page.tsx`

Tercera pantalla informativa. Presenta certificación y usa `certificate.png`.

#### `pages/HomePage.tsx`

Funciona como índice del prototipo. Tiene enlaces para abrir onboarding, registro, catálogo, publicación y matching. Es útil durante desarrollo porque permite navegar rápidamente entre pantallas.

### Registro y acceso

#### `pages/LoginPage.tsx`

Pantalla visual de inicio de sesión basada en el wireframe. La integración de autenticación real todavía no está implementada como flujo completo.

#### `pages/PreRegisterPage.tsx`

Permite escoger entre registro de persona y registro de empresa. Sus opciones navegan a las rutas correspondientes.

#### `pages/RegistroPersonaPage.tsx`

Formulario visual para registrar una persona con nombre, cédula, ubicación, actividad, correo y contraseña. Llama a `registrarUsuario` y muestra estados de envío y error.

#### `pages/RegistroEmpresaPage.tsx`

Formulario visual para registrar una empresa. Primero crea el usuario y luego la empresa asociada mediante `registrarUsuario` y `registrarEmpresa`.

#### `pages/RegisterPage.tsx`

Formulario general anterior con tabs de persona y empresa. Usa React Hook Form, Zod y los esquemas de `validators.ts`.

Es una segunda implementación del registro, distinta de las pantallas `RegistroPersonaPage` y `RegistroEmpresaPage`. Antes de ampliar registro conviene decidir cuál flujo será el definitivo.

#### `pages/CommunicationPage.tsx`

Pantalla para registrar el medio de contacto preferido. Actualmente representa el flujo visual y prepara la información para una futura integración.

### Subproductos

#### `pages/RegisterSubproductPage.tsx`

Formulario estructurado de registro de subproducto. Usa:

- React Hook Form.
- `subproductoSchema`.
- `PhotoDropzone`.
- `FamilySelect`.
- `MunicipioSelect`.
- `VolumeField` o campos equivalentes.
- `registrarSubproducto`.

Es la versión más guiada del flujo, con stepper y estructura de registro.

#### `pages/PostSubproductPage.tsx`

Pantalla de publicación de material basada en los wireframes del sprint 2. Recoge nombre, cantidad, frecuencia, municipio, familia, descripción y fotografía; después llama a `registrarSubproducto`.

Usa `DEMO_EMPRESA_ID` mientras no haya sesión real. Tras una publicación exitosa, muestra confirmación y redirige al catálogo.

#### `pages/CatalogPage.tsx`

Consulta el catálogo con `getCatalogo` y mantiene tres estados de filtro:

- texto de búsqueda,
- familia,
- municipio.

Cada cambio de filtro vuelve a ejecutar la carga dentro de `useEffect`. También maneja estados de carga, error, catálogo vacío y resultados mediante `SubproductCard`.

#### `pages/SubproductDetailPage.tsx`

Lee el parámetro dinámico `id` con `useParams`, carga el detalle mediante `getSubproductoDetalle` y muestra:

- familia,
- nombre,
- empresa,
- cantidad,
- municipio,
- descripción,
- condiciones,
- frecuencia,
- acción de contacto,
- acceso a edición.

El contacto actualmente cambia a un estado local de confirmación; no registra todavía una manifestación persistente en backend.

#### `pages/ProfilePage.tsx`

Carga las publicaciones con `getMisPublicaciones` y muestra:

- resumen de la empresa,
- cantidad de publicaciones,
- métricas de demostración,
- tabla de publicaciones propias,
- enlaces para editar,
- bloque visual de certificaciones.

Algunas métricas del wireframe, como matches y contactos, todavía son valores de demostración.

#### `pages/UpdateSubproductPage.tsx`

Lee el `id` de la URL, carga el subproducto y copia sus datos a un estado local de formulario. Al guardar llama a `actualizarSubproducto` y vuelve al detalle.

La edición actualiza nombre, descripción, cantidad, unidad, frecuencia y municipio. La selección de archivo es visual y todavía no persiste una imagen mediante API.

### Otros módulos

#### `pages/MatchingPage.tsx`

Pantalla inicial del módulo de matching. Presenta la idea de coincidencias entre oferta y demanda; la comparación automática todavía no está implementada.

## 10. Estilos e imágenes

### `frontend/src/index.css`

Carga Tailwind y define estilos globales:

- suavizado de fuentes,
- fondo y color base del documento,
- estilos de foco accesible,
- clases de campos (`field-input`, `field-label`),
- botones (`btn-primary`, `btn-secondary`, `btn-ghost`),
- tarjetas (`card`, `register-card`),
- tabs,
- stepper,
- dropzone,
- banners y badges.

Una página puede usar estas clases compartidas o clases Tailwind directamente.

### `frontend/tailwind.config.ts`

Define los tokens visuales del proyecto:

- colores `ink`, `surface`, `forest`, `clay` y `signal`,
- tipografías IBM Plex Sans y IBM Plex Mono,
- radios de borde,
- rutas que Tailwind debe escanear.

Si se agrega una clase Tailwind dinámica construida por concatenación, hay que comprobar que Tailwind la detecte durante el build; para clases totalmente dinámicas puede ser necesario agregarlas a `safelist`.

### `frontend/src/img/`

Contiene recursos visuales importados desde los componentes:

- `icon.png`: icono principal de RENDU.
- `notify.png` y `notify2.png`: iconos de notificaciones.
- `certificate.png`: ilustración de certificación.
- `circle_box.png`: ilustración de economía circular.
- `shipper.png`: ilustración de transporte.
- `pencil.png`: recurso relacionado con edición.
- `users.jpg`: recurso visual de usuarios.
- `wireframes/`: imágenes de referencia usadas para construir pantallas.

En Vite, una imagen importada como `import image from "@/img/icon.png"` se transforma en un asset final con nombre hash durante el build.

## 11. Configuración del proyecto

### `frontend/vite.config.ts`

Configura:

- plugin de React para Vite,
- alias `@` apuntando a `src`,
- host accesible desde Docker o red local,
- puerto de desarrollo `5173`.

Gracias al alias, se puede escribir:

```ts
import { getCatalogo } from "@/api/client";
```

en lugar de calcular rutas relativas como `../../api/client`.

### `frontend/tsconfig.json`

Activa TypeScript estricto, resolución de módulos de Vite y el alias `@/*`.

Opciones importantes:

- `strict: true`: detecta errores de tipos.
- `noUnusedLocals: true`: evita imports y variables sin uso.
- `noUnusedParameters: true`: evita parámetros sin uso.
- `noEmit: true`: TypeScript verifica, pero Vite se encarga de generar el bundle.
- `jsx: react-jsx`: transforma JSX con el runtime moderno de React.

### `frontend/tailwind.config.ts`

Además de los tokens, define que Tailwind revise `index.html` y todos los archivos `src/**/*.{ts,tsx}`.

### `frontend/postcss.config.js`

Conecta Tailwind y Autoprefixer con el pipeline de estilos.

### `frontend/eslint.config.js`

Configura ESLint para revisar JavaScript, TypeScript, React Hooks y reglas del proyecto.

### `frontend/vite-env.d.ts`

Incluye las declaraciones de tipos de Vite, necesarias para que TypeScript entienda `import.meta.env` y las importaciones de assets.

### `frontend/.env.example`

Sirve como plantilla de variables de entorno para desarrollo. No debe contener secretos reales.

### `frontend/Dockerfile` y `frontend/nginx.conf`

El Dockerfile prepara el frontend para ejecutarse dentro del stack. `nginx.conf` configura el servidor que entrega los archivos estáticos de la SPA.

En una SPA, el servidor debe devolver `index.html` para rutas como `/catalogo/sp-1`; de lo contrario, una recarga directa en una ruta interna puede producir un 404.

## 12. Flujo completo de publicación y edición

### Publicar

```text
/publicar
   ↓
PostSubproductPage
   ↓ validación zod + react-hook-form
registrarSubproducto
   ↓
client.ts decide mock o fetch
   ↓
mockClient guarda en localStorage
   ↓
/catalogo
```

### Consultar catálogo y detalle

```text
/catalogo
   ↓
CatalogPage
   ↓
getCatalogo(filtros)
   ↓
SubproductCard
   ↓
 /catalogo/:id
   ↓
SubproductDetailPage
```

### Editar

```text
/perfil
   ↓
ProfilePage
   ↓
/subproductos/:id/editar
   ↓
UpdateSubproductPage
   ↓
actualizarSubproducto
   ↓
localStorage o PATCH /subproductos/:id
   ↓
/catalogo/:id
```

## 13. Estados que manejan las páginas

Las páginas que consultan datos suelen tener tres estados:

1. **Carga:** `loading` es `true` y se muestra un indicador.
2. **Error:** se guarda un mensaje en `error` y se muestra una alerta.
3. **Éxito:** se guarda la respuesta en un estado como `subproductos`, `subproducto` o `publicaciones`.

Los formularios suelen manejar:

- valores del formulario,
- `isSubmitting` o `saving`,
- mensaje de error,
- mensaje de éxito,
- navegación después de guardar.

Es importante no llamar una API directamente durante el render. Las cargas deben ocurrir en `useEffect` o como respuesta a un evento como `onSubmit`.

## 14. Cómo agregar una nueva pantalla

1. Crear el componente en `frontend/src/pages/NombrePage.tsx`.
2. Importarlo en `router.tsx`.
3. Agregar una ruta dentro de los children de `AppShell`.
4. Decidir si usa el header general o si debe entrar en `isStandaloneScreen`.
5. Reutilizar componentes de `components/ui` y `components/forms`.
6. Si requiere datos, agregar una función en `api/client.ts` y su versión mock.
7. Agregar o actualizar tipos en `types/index.ts`.
8. Agregar validación en `lib/validators.ts` si es un formulario.
9. Ejecutar `npm run lint` y `npm run build`.

## 15. Cómo agregar una operación de API

La operación debe seguir esta separación:

```text
Página → api/client.ts → mockClient.ts o fetch → backend
```

Ejemplo conceptual:

```ts
// client.ts
export async function getAlgo(): Promise<Algo[]> {
  return USE_MOCKS ? getAlgoMock() : get<Algo[]>("/algo");
}
```

Después:

1. Definir `Algo` en `types/index.ts`.
2. Implementar `getAlgoMock` en `mockClient.ts`.
3. Agregar el endpoint y la forma de respuesta a `docs/agents/api-contract.md`.
4. Usar `getAlgo` desde la página.
5. Probar el flujo con mocks y luego con `VITE_USE_MOCKS=false`.

## 16. Limitaciones actuales que conviene conocer

- No hay autenticación real ni sesión de usuario persistente.
- El perfil usa información demostrativa de empresa.
- Los datos mock viven en el navegador y no se comparten entre usuarios.
- La subida de fotografías todavía no tiene endpoint definido.
- El contacto y los matches no están conectados a persistencia real.
- Las métricas de perfil incluyen valores visuales de demostración.
- La lógica de precios todavía no aparece como modelo completo en los tipos del frontend.
- Hay dos generaciones de pantallas para algunos flujos de registro y subproducto; antes de ampliar esas áreas conviene elegir la implementación oficial.

## 17. Comandos útiles

Desde `frontend/`:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

Para usar el build cuando `frontend/dist` tiene permisos heredados de Docker, se puede validar temporalmente con:

```bash
npm run build -- --outDir /tmp/rendu-frontend-dist
```

El build correcto debe terminar con `built in ...s` y sin errores de TypeScript.
