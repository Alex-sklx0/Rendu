# Contrato de API — RENDU (Sprint 2)

> Este documento es la fuente de verdad compartida entre frontend (David) y backend (Carolina)
> mientras no exista un OpenAPI/Swagger real. La implementación de referencia es `back2/` y el
> frontend real consume estas formas desde `frontend/src/api/client.ts`.

## POST /usuarios (HU-01)
**Request**
```json
{ "email": "string", "password": "string" }
```
**Response 201**
```json
{
  "ok": true,
  "mensaje": "Usuario registrado exitosamente",
  "usuario": { "id": "number", "email": "string", "fecha_registro": "ISO-8601" }
}
```

## POST /empresas (HU-02)
**Request**
```json
{
  "id_usuario": "number",
  "nombre": "string",
  "nit": "string",
  "id_municipio": "number (1 a 10)",
  "id_rol": "number (1 GENERADOR o 2 TRANSFORMADOR)"
}
```
**Response 201**
```json
{
  "ok": true,
  "mensaje": "Empresa registrada exitosamente",
  "empresa": { "id": "number", "id_usuario": "number", "nombre": "string", "nit": "string", "id_municipio": "number", "id_rol": "number" }
}
```

El NIT se normaliza quitando puntos y espacios. Un NIT equivalente ya registrado responde `409`.

## POST /personas (HU-01)
**Request**
```json
{
  "nombre": "string",
  "cedula": "string (obligatoria)",
  "id_municipio": "number (1 a 10)",
  "id_rol": "number (2 TRANSFORMADOR o 3 RECICLADOR)",
  "id_usuario": "number"
}
```

Una persona no crea una fila en `empresas` y no puede publicar subproductos.

## POST /subproductos (HU-03, HU-04, HU-05, HU-06)
**Request**
```json
{
  "id_empresa": "number",
  "nombre": "string",
  "descripcion": "string (opcional)",
  "id_familia_material": "number (1 a 6)",
  "volumen_disponible": "number",
  "id_unidad_medida": "number (1 kg, 2 t, 3 m3)",
  "id_municipio": "number (1 a 10)",
  "image_base64": "string (opcional, Data URI)"
}
```
**Response 201**
```json
{
  "ok": true,
  "mensaje": "Subproducto registrado exitosamente",
  "subproducto": {
    "id": "number",
    "id_empresa": "number",
    "nombre": "string",
    "descripcion": "string|null",
    "id_familia_material": "number",
    "volumen_disponible": "number",
    "id_unidad_medida": "number",
    "id_municipio": "number",
    "foto_url": "string|null",
    "id_estado_publicacion": 1,
    "disponible": true,
    "fecha_registro": "ISO-8601"
  }
}
```

Los endpoints están montados bajo `/api`: por ejemplo, `POST /api/usuarios` y
`GET /api/catalogo`. El frontend transforma `foto_url` a `image_url` para su modelo visual.

## GET /subproductos/:id
```json
{ "ok": true, "subproducto": { "id": "UUID", "nombre": "string", "foto_url": "string|null" } }
```

## PATCH /subproductos/:id (HU-11/HU-12)
El body debe incluir `id_empresa`. Acepta parcialmente `nombre`, `descripcion`,
`volumen_disponible`, `foto_url` o `disponible`. Si la empresa no es propietaria responde `403`.
La validación actual es por `id_empresa` enviado por el frontend; JWT queda como deuda técnica.

## PATCH /subproductos/:id/publicar (HU-07)
```json
{ "id_empresa": 2, "publicar": true }
```

`publicar: true` usa estado `PUBLICADO (2)` y `false` devuelve a `BORRADOR (1)`.

## DELETE /subproductos/:id (HU-11)
Requiere `id_empresa` como query param: `DELETE /api/subproductos/1?id_empresa=2`.

## GET /catalogo (HU-09)
Acepta `q`, `id_familia_material` e `id_municipio`. Devuelve ids crudos y solo incluye
subproductos con `id_estado_publicacion = 2` y `disponible = true`.

## GET /subproductos/mis-publicaciones
Devuelve `{ "ok": true, "publicaciones": [] }`. Mientras no exista autenticación, requiere
el query param `id_empresa` para limitar los resultados.

## Catálogos fijos
Familias: `1 Papel y cartón`, `2 Plásticos`, `3 Vidrio`, `4 Metales`, `5 Textiles`, `6 Madera`.
Unidades: `1 kg`, `2 t`, `3 m3`.
Municipios `1` a `10`: Medellín, Bello, Itagüí, Envigado, Sabaneta, Copacabana, Barbosa,
Caldas, La Estrella y Girardota.

## Estado de QA
- NIT duplicado: corregido mediante normalización, consulta previa y restricción `UNIQUE`; responde `409`.
- HU-11: implementada para PATCH y DELETE con validación de propietario; responde `403` ante otra empresa.
- Campos protegidos: el service filtra los cambios a la lista de campos editables.
- JWT/autenticación real: pendiente; la validación actual confía en `id_empresa` del cliente.
