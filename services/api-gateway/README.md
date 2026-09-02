# api-gateway

**Responsable:** Carolina Ramirez Lotero (backend).

Reverse proxy (nginx) que enruta `/usuarios`, `/empresas`, `/subproductos` y `/catalogo` hacia
cada microservicio. El frontend, en producción, apuntaría `VITE_API_BASE_URL` a este gateway
en vez de a un servicio individual. Opcional para el prototipo: mientras el equipo prefiera
que el frontend hable directo con un solo servicio, este gateway puede quedar sin usar.
