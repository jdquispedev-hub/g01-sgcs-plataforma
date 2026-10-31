---
name: sgcs-core-standards
description: >-
  Estándares centrales de arquitectura, seguridad (RNF-01 a RNF-12),
  control de cambios y flujo operativo del Sistema de Gestión de Configuración (SGCS).
---

# SGCS Core Standards & Philosophy

Este skill gobierna la ingeniería de software, arquitectura de datos y principios de negocio del proyecto **SGCS (Plataforma Multi-Tenant de Gestión de Configuración y Control Operativo)**.

---

## 1. Misión del Sistema: Erradicar el «Teléfono Descompuesto»

El sistema tiene una regla de negocio inviolable:
> **«Ninguna cotización, compromiso o fecha de entrega se formaliza con el cliente sin la pre-factibilidad técnica, solicitud previa y estimación validada por el Especialista Técnico.»**

### Patrón Universal de 5 Etapas
1. **Recepción:** Minuta inicial con el cliente y registro del requerimiento.
2. **Diagnóstico Técnico:** Análisis de viabilidad, insumos necesarios y aprobación formal del técnico.
3. **Planificación & Costos:** Establecimiento de la **Línea Base Inmutable** y cálculo real de plazos.
4. **Ejecución con Bitácora:** Reporte diario de campo con semáforo obligatorio de **bloqueos**.
5. **Cierre:** Verificación de entregables contra la línea base y acta de conformidad.

---

## 2. Aislamiento Multi-Tenant con Plantillas de Industria

El proyecto es un **Monorepo Next.js Fullstack**. Toda empresa comparte la misma base de datos pero vive en un espacio estrictamente aislado:

* **Inyección de Tenant:** Toda consulta a la base de datos a través de Prisma ORM **debe** incluir:
  ```typescript
  where: {
    organizacion_id: session.organizacionId,
    // filtros...
  }
  ```
* **Diccionario Dinámico:** La interfaz nunca mezcla términos entre industrias:
  - **Software:** Proyecto/Sprint, ECS, Versión de código, Daily Standup.
  - **Veterinaria:** Caso Clínico/Paciente, Ficha Médica, Examen, Evolución de Turno.
  - **Construcción:** Obra, Plano/Partida, Revisión, Parte Diario de Faena.

---

## 3. Matriz de Requerimientos No Funcionales (Obligatorios en cada PR)

* **RNF-01 (Seguridad de Credenciales):**
  - Contraseñas procesadas con `bcryptjs` (salt individual, coste $\ge 12$).
  - Prohibido retornar `password_hash` en respuestas JSON o logs.
* **RNF-02 (Protección de Acceso):**
  - Verificación en servidor de sesión (JWT en cookie `HttpOnly`) y permisos por Rol (RBAC).
  - Rechazar URLs directas y endpoints no autorizados con `403 Forbidden` / `401 Unauthorized`.
* **RNF-03 (Protección de Comunicaciones):**
  - Comunicación HTTPS / TLS obligatoria en producción y túnel seguro (`cloudflared`) en desarrollo.
* **RNF-04 (Rendimiento):**
  - Consultas paginadas (`take`, `skip`), índices en columnas clave (`codigo`, `estado`, `organizacion_id`).
  - Respuesta $\le 3$ segundos para 1000 registros con 10 usuarios concurrentes.
* **RNF-05 (Usabilidad y Validación):**
  - Validación con **Zod** tanto en cliente como en servidor.
  - Campos obligatorios marcados con asterisco rojo y preservación de datos ante errores.
* **RNF-06 (Adaptabilidad):**
  - Diseño *Mobile-First* validado en 360 px, 768 px y 1366 px sin desbordamientos.
* **RNF-08 (Integridad Transaccional):**
  - Uso de `prisma.$transaction()` para operaciones multi-tabla (ej. líneas base, resolución de RFCs).
* **RNF-10 (Historial de Auditoría):**
  - Inserción en `auditoria_logs` para cada acción crítica. La tabla es *append-only* (sin update/delete).
* **RNF-12 (Manejo Seguro de Errores):**
  - Mensajes amigables al usuario final. Ninguna consulta SQL ni stack trace debe mostrarse al cliente.
