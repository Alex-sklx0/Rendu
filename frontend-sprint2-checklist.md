# Checklist frontend — Sprint 2 (backend actualizado por Carolina)

## Estado verificado del backend

La implementación de referencia está en `back2/`. Los controles revisados quedan así:

- Sprint 1, NIT duplicado: corregido. El backend normaliza puntos/espacios, verifica duplicados y conserva la restricción `UNIQUE`; responde `409`.
- Sprint 2, HU-11: implementada. PATCH y DELETE exigen `id_empresa`, validan la empresa propietaria y rechazan otra empresa con `403`.
- Campos protegidos: el backend solo actualiza los campos permitidos por el servicio.
- JWT real: pendiente como deuda técnica; la validación actual depende del `id_empresa` enviado por el frontend.

Backend corriendo en `http://localhost:8000/api` (con prefijo `/api` esta vez).
`.env` del front: `VITE_API_BASE_URL=http://localhost:8000/api`

---

## 🔴 Cambios que rompen lo que ya existe (hay que tocar código sí o sí)

### 1. Registro de empresa — ya NO acepta texto, solo ids numéricos
`POST /api/empresas` ahora exige:
```json
{
  "nombre": "...",
  "nit": "...",
  "id_municipio": 1,
  "id_rol": 1,
  "id_usuario": 1
}
```
**Ya no acepta** `municipio: "Medellín"` ni `tipo_actor: "empresa_generadora"` como texto.
`CompanyRegistrationPage.tsx` hoy manda `municipio` y `tipo_actor` en texto — hay que:
- Mandar `id_municipio` (usa la tabla fija de abajo) en vez de `municipio`.
- Mandar `id_rol`: `1` = Generador, `2` = Transformador (el selector de "ECA" no tiene equivalente todavía — hay que decidir qué id usar o quitar esa opción del selector).

### 2. Registro de persona — mismo cambio, y YA NO crea empresa
`POST /api/personas` ahora exige:
```json
{
  "nombre": "...",
  "cedula": "...",
  "id_municipio": 1,
  "id_rol": 2,
  "id_usuario": 1
}
```
`id_rol`: `2` = Transformador, `3` = Reciclador.

**Importante:** `PersonRegistrationPage.tsx` hoy también llama a `registrarEmpresa` después de `registrarPersona`, para crear una fila fantasma en `empresas` y poder publicar subproductos. **Hay que borrar esa llamada.** Se decidió que **una persona no publica subproductos** — solo consulta el catálogo. Si esa página guarda `id_empresa` en `localStorage`, ya no debe hacerlo para el flujo de persona (guardar `null` o no guardarlo).

### 3. `cedula` es obligatoria
La base de datos exige `cedula` (no puede ir vacía). Si el formulario de persona permite dejarla en blanco, hay que hacerla obligatoria en el formulario también, o el backend va a responder 400.

### 4. PATCH y DELETE de subproductos ahora piden `id_empresa`
- `PATCH /api/subproductos/:id` → el body debe incluir `id_empresa` (además de los campos a cambiar). Si no coincide con el dueño real, responde 403.
- `DELETE /api/subproductos/:id?id_empresa=123` → ahora va como **query param** en la URL, no en el body (los DELETE normalmente no llevan body).

Sin esto, ambas acciones van a fallar con 400 ("id_empresa es obligatorio").

### 5. Shape del catálogo cambió — ya no vienen nombres resueltos
`GET /api/catalogo` ahora devuelve los subproductos con **ids crudos**, no nombres:
```json
{
  "ok": true,
  "subproductos": [
    {
      "id": 1,
      "id_empresa": 2,
      "nombre": "Cartón corrugado",
      "id_familia_material": 1,
      "id_municipio": 1,
      "id_unidad_medida": 1,
      "volumen_disponible": 150,
      "disponible": true,
      "foto_url": "https://...",
      "fecha_registro": "..."
      // ya NO viene: "familia", "municipio" (texto), "unidad_volumen", "empresa", "emoji"
    }
  ]
}
```
El front tiene que resolver `id_familia_material` → nombre, `id_municipio` → nombre, etc. usando las tablas de catálogo (ver abajo). Si `client.ts` espera los nombres ya resueltos (como en la versión vieja), hay que ajustar el mapeo ahí.

También filtra automáticamente: solo trae subproductos **publicados** (no borradores) y **disponibles**.

### 6. Login ahora existe de verdad
`POST /api/usuarios/login`:
```json
// body
{ "email": "...", "password": "..." }

// respuesta 200
{
  "ok": true,
  "mensaje": "Inicio de sesión exitoso",
  "usuario": { "id": 1, "email": "...", "fecha_registro": "...", "nombre": "...", "id_empresa": 2 },
  "empresa": { ... } | null,
  "persona": { ... } | null
}
```
Revisar que `LoginPage.tsx` esté usando este shape correctamente.

### 7. Eliminar cuenta
`DELETE /api/usuarios/:id` — sin cambios de shape, ya estaba contemplado en `client.ts` (`eliminarCuenta`).

---

## 🟡 Funcionalidad nueva que el front puede empezar a usar

### 8. Publicar / despublicar subproducto (HU-07)
`PATCH /api/subproductos/:id/publicar`
```json
// body
{ "id_empresa": 2, "publicar": true }
```
Un subproducto **nace en borrador** al crearse — ya no se publica automáticamente. El front necesita un botón "Publicar" en "Mis publicaciones" que llame este endpoint con `publicar: true`, y opcionalmente un "Despublicar" con `publicar: false`.

### 9. Subir imagen (HU-08)
Dos formas:
- Al crear el subproducto: mandar `image_base64` (Data URI, ej. `"data:image/png;base64,...."`) dentro del mismo `POST /api/subproductos`.
- O subir la imagen antes, por separado: `POST /api/subproductos/upload` con `{ "image_base64": "..." }`, devuelve `{ "ok": true, "foto_url": "https://..." }`.

### 10. Disponibilidad (HU-12)
Va dentro del mismo `PATCH /api/subproductos/:id`, mandando `disponible: true` o `false` junto al resto de campos (y el `id_empresa` obligatorio del punto 4).

---

## 📋 Tablas de catálogo (ids fijos, confirmados en Supabase)

**roles**
| id | nombre |
|---|---|
| 1 | GENERADOR |
| 2 | TRANSFORMADOR |
| 3 | RECICLADOR |

**familias_material**
| id | nombre |
|---|---|
| 1 | Papel y cartón |
| 2 | Plásticos |
| 3 | Vidrio |
| 4 | Metales |
| 5 | Textiles |
| 6 | Madera |

**unidades_medida**
| id | nombre | abreviatura |
|---|---|---|
| 1 | Kilogramo | kg |
| 2 | Tonelada | t |
| 3 | Metro cúbico | m³ |

**estados_publicacion** (solo lo usa el backend internamente, el front no necesita mandarlo)
| id | nombre |
|---|---|
| 1 | BORRADOR |
| 2 | PUBLICADO |

**municipios** — pendiente de confirmar los nombres exactos con Carolina (los ids 1–10 ya se usan, faltó pegar la tabla completa). Por ahora, si `MUNICIPIOS_VALLE_ABURRA` en `constants.ts` sigue el orden: Medellín, Bello, Itagüí, Envigado, Sabaneta, Copacabana, Barbosa, Caldas, La Estrella, Girardota → probablemente coincide 1 a 1 con los ids 1–10, pero **hay que confirmarlo antes de dar por bueno el flujo de registro**.

---

## ⚠️ Pendiente de decisión de equipo (no es solo código)

- **Selector "ECA"** en el registro de empresa: no existe ese rol en la base de datos (solo Generador/Transformador). Decidir si se quita del formulario o se mapea a Transformador.
- **JWT / autenticación real:** hoy la validación de "eres el dueño" en PATCH/DELETE de subproductos confía en el `id_empresa` que manda el front (sacado de `localStorage`). No es seguridad real — cualquiera que edite el `localStorage` podría mandar otro `id_empresa`. Está documentado como deuda técnica, pendiente para un sprint futuro.
