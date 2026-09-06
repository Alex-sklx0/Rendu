# Contrato de API — RENDU (borrador)

> Este documento es la fuente de verdad compartida entre frontend (David) y backend (Carolina)
> mientras no exista un OpenAPI/Swagger real. El frontend ya está construido contra estas formas
> usando datos simulados (`frontend/src/api/mockClient.ts`). Si el backend implementa algo
> distinto, se actualiza esta tabla **y** los tipos en `frontend/src/types/index.ts` en el mismo
> commit.

## POST /usuarios (HU-01)
**Request**
```json
{ "email": "string", "password": "string" }
```
**Response 201**
```json
{ "id": "string", "email": "string", "rol": "string", "fecha_registro": "ISO-8601" }
```

## POST /empresas (HU-02)
**Request**
```json
{
  "id_usuario": "string",
  "nombre": "string",
  "nit": "string",
  "municipio": "string",
  "tipo_actor": "empresa_generadora | empresa_transformadora | eca | reciclador",
  "medio_contacto": "string (opcional, ej. link de WhatsApp)"
}
```
**Response 201**
```json
{ "id": "string", "nombre": "string", "nit": "string", "municipio": "string", "tipo_actor": "string" }
```

## POST /subproductos (HU-03, HU-04, HU-05, HU-06)
**Request**
```json
{
  "id_empresa": "string",
  "nombre": "string",
  "descripcion": "string (opcional)",
  "id_familia": "string",
  "volumen_disponible": "number",
  "unidad_volumen": "kg | ton | m3 | unidades",
  "municipio": "string"
}
```
**Response 201**
```json
{
  "id": "string",
  "nombre": "string",
  "familia": "string",
  "volumen_disponible": "number",
  "unidad_volumen": "string",
  "municipio": "string",
  "estado_publicacion": "borrador",
  "disponible": true
}
```

## GET /familias
```json
[{ "id": "string", "nombre": "string" }]
```
Valores actuales (precargados en el frontend, ver `frontend/src/lib/constants.ts`):
`papel_carton`, `plasticos`, `vidrio`, `metales`, `textil`, `madera`.

## GET /municipios
Lista fija del Valle de Aburrá (no requiere backend, ver `frontend/src/lib/constants.ts`):
Medellín, Bello, Itagüí, Envigado, Sabaneta, Copacabana, Barbosa, Caldas, La Estrella, Girardota.

## Pendiente de definir con Carolina/Natalia
- Formato exacto de `id` (UUID vs. serial).
- Autenticación: JWT en header `Authorization: Bearer <token>` (asumido, a confirmar).
- Endpoint y forma de subida de fotografías (HU-08).
- `GET /catalogo` — filtros, paginación y forma de cada item (HU-09, HU-13, HU-14, HU-15).
