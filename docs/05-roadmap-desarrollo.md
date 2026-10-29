# 05. Hoja de Ruta de Desarrollo (Roadmap)

Este documento traza las fases secuenciales de desarrollo para construir e implementar el sistema garantizando la satisfacción de los requerimientos.

---

## Fase 1: Inicialización del Entorno y Base de Datos
- [x] Documentación arquitectónica, análisis de requerimientos y modelo de base de datos.
- [x] Vinculación e inicialización del repositorio Git oficial.
- [ ] Inicialización del proyecto Next.js 15 con TypeScript y Tailwind CSS.
- [ ] Configuración del cliente Prisma ORM y creación del archivo `schema.prisma`.
- [ ] Definición del script de migración inicial en PostgreSQL.
- [ ] Script de datos semilla (`prisma/seed.ts`) con el usuario SuperAdmin inicial y plantillas por defecto (Software, Veterinaria, Construcción).

---

## Fase 2: Autenticación, Multi-Tenant y Seguridad (RF-01 a RF-03, RNF-01 a RNF-03)
- [ ] Módulo de cifrado de contraseñas con `bcrypt` (salt individual).
- [ ] Endpoint de login con validación de credenciales y generación de JWT en cookie `HttpOnly`.
- [ ] Middleware global en Next.js para protección de rutas según rol (RBAC) y aislamiento por `organizacion_id`.
- [ ] CRUD de usuarios por empresa con validación de identificador único y roles.
- [ ] Redirección inteligente post-login según el rol del usuario.

---

## Fase 3: Gestión de ECS y Control de Versiones (RF-04 a RF-08)
- [ ] Formulario reactivo para alta y edición descriptiva de ECS con validación de código único (Zod).
- [ ] Catálogo de ECS con filtros reactivos (código, nombre, tipo) y paginación rápida (< 3s - RNF-04).
- [ ] Módulo de registro de versiones por ECS (número de versión único, archivo o referencia).
- [ ] Bandeja técnica para el `Responsable de Aprobación`: revisión y dictamen (Aprobada / Rechazada).
- [ ] Registro automático en la tabla de auditoría para cada acción.

---

## Fase 4: Líneas Base Inmutables y Gestión de Cambios (RF-09 a RF-15, RNF-08)
- [ ] Módulo para establecer Líneas Base a partir de versiones aprobadas mediante transacciones ACID (`prisma.$transaction`).
- [ ] Vista inmutable de líneas base y congelamiento de versiones.
- [ ] Flujo de Solicitud de Cambio (RFC):
  - Solicitud vinculada a versión base.
  - Evaluación técnica de impacto y ECS afectados.
  - Dictamen formal del aprobador (Aprobada / Rechazada).
  - Implementación con vinculación a la versión resultante.

---

## Fase 5: Bitácora Diaria, Alertas de Bloqueo y Dashboard (Mobile-First)
- [ ] Vista optimizada para celulares (360px) para el registro del reporte diario de campo.
- [ ] Campos de reporte según la plantilla de la empresa (m², commits o dosis).
- [ ] Semáforo y banner de alerta gerencial para reportes con bloqueo activo.
- [ ] Dashboard gerencial con métricas de avance y estado de proyectos/casos.

---

## Fase 6: Trazabilidad, Reportes y Auditoría (RF-16 a RF-18, RNF-10)
- [ ] Matriz y diagrama visual de trazabilidad: ECS ➔ Versiones ➔ Líneas Base ➔ Solicitudes de Cambio.
- [ ] Módulo de reportes exportables en PDF y Excel con filtros por fecha y estado.
- [ ] Visualizador de logs de auditoría para administradores.

---

## Fase 7: Pruebas, Rendimiento y Despliegue
- [ ] Pruebas de carga concurrente (10 usuarios, 1000 ECS - RNF-04).
- [ ] Verificación de responsive en 360, 768 y 1366 px (RNF-06).
- [ ] Conexión y pruebas externas con **Cloudflare Tunnel** (`cloudflared`).
- [ ] Verificación de respaldos y restauración de base de datos (RNF-09).
