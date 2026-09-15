# API Backend — Sprint 1 (Base del sistema)

**Base URL (desarrollo local):** `http://localhost:3000`

> Cada quien corre su propio backend localmente. Mientras desarrollamos, usa `http://localhost:3000` (o el puerto que tenga corriendo quien lo levantó). Antes de la entrega final, esta URL cambiará por la del backend desplegado — se actualizará aquí cuando pase.

Todas las respuestas son JSON. Todas siguen este formato:

**Éxito:**
```json
{ "ok": true, "mensaje": "...", "usuario": { ... } }
```

**Error:**
```json
{ "ok": false, "error": "descripción del error" }
```

`ok` siempre indica si la operación funcionó. Revisa siempre ese campo antes de asumir que los datos llegaron bien.

---

## 1. Registrar usuario

Crea la cuenta base (login). El rol y el tipo de actor (empresa o persona) se definen después, en un segundo paso.

**`POST /usuarios`**

**Body (JSON):**
```json
{
  "email": "correo@ejemplo.com",
  "password": "mínimo 6 caracteres"
}
```

**Respuesta exitosa (201):**
```json
{
  "ok": true,
  "mensaje": "Usuario registrado exitosamente",
  "usuario": {
    "id": 1,
    "email": "correo@ejemplo.com",
    "fecha_registro": "2026-09-07T05:14:14.447+00:00"
  }
}
```

**Posibles errores:**
| Código | Causa |
|---|---|
| 400 | Falta `email` o `password`, formato de email inválido, o password < 6 caracteres |
| 409 | El email ya está registrado |

---

## 2. Registrar empresa

Se usa cuando el usuario elige el flujo **"Empresa"** en el frontend. Requiere que el usuario ya exista (paso 1 completado antes).

**`POST /empresas`**

**Body (JSON):**
```json
{
  "nombre": "Nombre de la empresa",
  "nit": "900123456-1",
  "id_municipio": 1,
  "id_rol": 1,
  "id_usuario": 1
}
```

**`id_rol` para empresas — solo dos valores válidos:**
| id_rol | Significado |
|---|---|
| 1 | GENERADOR |
| 2 | TRANSFORMADOR |

(3 = RECICLADOR está reservado para personas, no aplica aquí — el backend lo rechaza si lo mandas)

**`id_municipio` — Valle de Aburrá:**
| id | Municipio |
|---|---|
| 1 | Medellín |
| 2 | Bello |
| 3 | Itagüí |
| 4 | Envigado |
| 5 | Sabaneta |
| 6 | Copacabana |
| 7 | Barbosa |
| 8 | Caldas |
| 9 | La Estrella |
| 10 | Girardota |

**Respuesta exitosa (201):**
```json
{
  "ok": true,
  "mensaje": "Empresa registrada exitosamente",
  "empresa": {
    "id": 2,
    "nombre": "Nombre de la empresa",
    "nit": "900123456-1",
    "id_municipio": 1,
    "id_rol": 1,
    "id_usuario": 1
  }
}
```

**Posibles errores:**
| Código | Causa |
|---|---|
| 400 | Falta algún campo obligatorio |
| 400 | `id_municipio` fuera del rango 1-10 |
| 400 | `id_rol` inválido para empresa (debe ser 1 o 2) |
| 404 | El `id_usuario` indicado no existe |
| 409 | Ya existe una empresa con ese NIT |

---

## 3. Registrar persona

Se usa cuando el usuario elige el flujo **"Persona"** en el frontend (ej. reciclador independiente). Requiere que el usuario ya exista.

**`POST /personas`**

**Body (JSON):**
```json
{
  "nombre": "Nombre completo",
  "cedula": "1234567890",
  "id_municipio": 3,
  "id_rol": 3,
  "id_usuario": 1
}
```

**`id_rol` para personas — solo dos valores válidos:**
| id_rol | Significado |
|---|---|
| 2 | TRANSFORMADOR |
| 3 | RECICLADOR |

(1 = GENERADOR está reservado para empresas, no aplica aquí)

`id_municipio` usa la misma tabla que en empresas (ver arriba).

**Respuesta exitosa (201):**
```json
{
  "ok": true,
  "mensaje": "Persona registrada exitosamente",
  "persona": {
    "id": 1,
    "nombre": "Nombre completo",
    "cedula": "1234567890",
    "id_municipio": 3,
    "id_rol": 3,
    "id_usuario": 1
  }
}
```

**Posibles errores:**
| Código | Causa |
|---|---|
| 400 | Falta algún campo obligatorio |
| 400 | `id_municipio` fuera del rango 1-10 |
| 400 | `id_rol` inválido para persona (debe ser 2 o 3) |
| 404 | El `id_usuario` indicado no existe |
| 409 | Ya existe una persona con esa cédula |

---

## 4. Registrar subproducto

Solo las **empresas** pueden publicar subproductos (no las personas). Este endpoint cubre de una vez: registro básico, clasificación por familia de material, volumen disponible y ubicación.

**`POST /subproductos`**

**Body (JSON):**
```json
{
  "id_empresa": 2,
  "nombre": "Cartón corrugado",
  "id_familia_material": 1,
  "volumen_disponible": 150,
  "id_unidad_medida": 1,
  "descripcion": "Cartón limpio y seco",
  "id_municipio": 1,
  "direccion": "Calle 50 #30-20"
}
```

`descripcion` y `direccion` son **opcionales**, todo lo demás es obligatorio.

**Respuesta exitosa (201):**
```json
{
  "ok": true,
  "mensaje": "Subproducto registrado exitosamente",
  "subproducto": {
    "id": 1,
    "id_empresa": 2,
    "nombre": "Cartón corrugado",
    "id_familia_material": 1,
    "volumen_disponible": 150,
    "id_unidad_medida": 1,
    "descripcion": "Cartón limpio y seco",
    "id_municipio": 1,
    "direccion": "Calle 50 #30-20",
    "fecha_registro": "2026-09-07T..."
  }
}
```

**Posibles errores:**
| Código | Causa |
|---|---|
| 400 | Falta algún campo obligatorio, o `volumen_disponible` es negativo |
| 400 | `id_municipio` fuera del rango 1-10 |
| 404 | `id_empresa`, `id_familia_material` o `id_unidad_medida` no existen |

> `id_familia_material` y `id_unidad_medida` los debe consultar el frontend directamente en Supabase (tablas `familias_material` y `unidades_medida`) para llenar los selectores del formulario — aún no hay un endpoint GET para listarlos desde este backend. Si lo necesitas, avísame y lo agregamos.

---

## Ejemplo de consumo desde React

```javascript
async function registrarUsuario(email, password) {
  const response = await fetch('http://localhost:3000/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.error);
  }

  return data.usuario;
}
```

El mismo patrón (`fetch` + `POST` + `JSON.stringify`) aplica igual para `/empresas`, `/personas` y `/subproductos` — solo cambia la URL y el body.

---

## Flujo esperado end-to-end (Sprint 1)

1. Usuario se registra → `POST /usuarios` → obtienes `id` del usuario
2. Usuario elige si es "Empresa" o "Persona" en el frontend
   - Si Empresa → `POST /empresas` con el `id_usuario` del paso 1
   - Si Persona → `POST /personas` con el `id_usuario` del paso 1
3. (Solo si es Empresa) Puede registrar subproductos → `POST /subproductos` con su `id_empresa`

---

*Documento generado para el equipo — Proyecto Aplicado en TIC I. Cualquier duda sobre un endpoint, revisar con Carolina (Backend).*
