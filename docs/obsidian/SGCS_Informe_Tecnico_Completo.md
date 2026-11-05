---
title: "SGCS - Informe Técnico de Arquitectura, Base de Datos y Gestión de Configuración"
date: 2026-11-05
tags:
  - documentacion
  - arquitectura
  - base-de-datos
  - neon
  - postgresql
  - nextjs
  - prisma
  - gcs
system: "Sistema de Gestión de Configuración de Software (SGCS)"
grupo: "G01"
version: "1.0.0"
estado: "Producción"
---

# Sistema de Gestión de Configuración de Software (SGCS)
## Memoria Técnica de Arquitectura, Persistencia e Implementación

> [!abstract] Resumen Ejecutivo
> El presente documento constituye la especificación técnica integral del Sistema de Gestión de Configuración de Software (SGCS). Describe los fundamentos teóricos del estándar de Gestión de Configuración (GCS), la arquitectura de software desacoplada, la infraestructura en la nube (Neon Cloud Postgres y Vercel), el diseño relacional de la base de datos con trece entidades, la matriz de seguridad y el motor de terminología dinámica para soporte multi-industria.

---

## 1. Introducción y Fundamentos del Sistema

### 1.1 Contexto y Problemática
En proyectos de ingeniería de software y construcción civil, la falta de control formal sobre las versiones de los entregables genera fallas críticas:
- Inconsistencia entre código desplegado y requerimientos aprobados.
- Pérdida de trazabilidad histórica ante cambios no autorizados.
- Falta de un canal unificado para evaluar el impacto técnico y presupuestario de las modificaciones.
- Dificultades de comunicación entre equipos multidisciplinarios debido al uso de terminologías dispares.

El SGCS resuelve esta problemática mediante la automatización del ciclo de vida de la configuración, asegurando auditoría inmutable y control estricto de accesos.

### 1.2 Objetivos de la Plataforma
1. **Identificación de la Configuración:** Identificar y registrar unívocamente cada Elemento de Configuración (ECS), ya sea digital (código fuente, scripts DDL) o físico/documental (planos de estructuras, memorias de cálculo).
2. **Control de Versiones y Cambios:** Implementar un flujo cerrado de Solicitudes de Cambio (RFC) supervisadas por un Comité de Control de Cambios (CCB).
3. **Contabilidad de Estado e Inmutabilidad:** Proveer Líneas Base (Baselines) congeladas donde los entregables aprobados no puedan ser modificados ni eliminados directamente.
4. **Auditoría y Trazabilidad:** Registrar de forma automática e indeleble cada evento, mutación de datos y acceso de usuario.

### 1.3 Arquitectura Multi-Tenant y Motor de Terminología Dinámica
El sistema implementa un modelo de tenencia compartida (Shared Database Multi-Tenancy) gobernado por la entidad `Organizacion`. Cada organización define su rubro operativo (`RubroIndustria`):
- `SOFTWARE`: Empresas de desarrollo tecnológico y servicios de TI.
- `CONSTRUCCION`: Empresas constructoras, estudios de arquitectura e ingeniería civil.
- `VETERINARIA`: Clínicas y centros de gestión agropecuaria o de salud animal.
- `OTRO`: Entidades genéricas con flujos adaptables.

El sistema almacena en la columna `configuracion_terminologia` (formato JSON) un diccionario de alias léxicos. El frontend y backend transforman dinámicamente las etiquetas de la interfaz según el rubro de la organización autenticada:

| Concepto SGCS | Terminología Rubro Software | Terminología Rubro Construcción |
| :--- | :--- | :--- |
| Proyecto | Sistema / Proyecto TI | Obra Civil / Edificación |
| Elemento de Configuración (ECS) | Componente / Módulo de Código | Plano Técnico / Memoria Estructural |
| Versión de ECS | Release / Tag Git | Revisión de Plano / Enmienda |
| Línea Base (Baseline) | Línea Base de Código | Hito Congelado / Firma de Planos |
| Solicitud de Cambio (RFC) | RFC / Ticket de Cambio | Orden de Modificación de Obra |
| Reporte Diario | Daily Standup de Desarrollo | Bitácora Diaria de Cuadrilla |

---

## 2. Infraestructura Cloud y Topología de Despliegue

La plataforma opera sobre una arquitectura serverless desacoplada, garantizando alta disponibilidad, escalabilidad elástica y costos operativos reducidos.

```mermaid
flowchart TD
    subgraph Usuarios["Capa de Clientes"]
        Nav["Navegador Web (Desktop / Mobile)"]
    end

    subgraph Vercel["Vercel Cloud (Hosting & Compute)"]
        CDN["Vercel Edge Network (CDN Global)"]
        AppServer["Next.js App Router (Node.js Serverless Functions)"]
        Middleware["Edge Middleware (Validacion JWT & RBAC)"]
    end

    subgraph Neon["Neon Serverless PostgreSQL (AWS us-east-2)"]
        Pooler["Connection Pooler (PgBouncer - Puerto 5432)"]
        DirectCompute["Direct TCP Compute (Puerto 5432)"]
        StorageEngine["Neon Distributed Page Storage (S3-backed WAL)"]
    end

    Nav -->|HTTPS / TLS 1.3| CDN
    CDN --> Middleware
    Middleware --> AppServer
    AppServer -->|DATABASE_URL / Transacciones Web| Pooler
    AppServer -.->|DIRECT_URL / Migraciones DDL| DirectCompute
    Pooler --> DirectCompute
    DirectCompute --> StorageEngine
```

### 2.1 Base de Datos: Neon Serverless PostgreSQL 16
- **Proveedor y Región:** Amazon Web Services (AWS), región `us-east-2` (Ohio).
- **Arquitectura de Cómputo Desacoplado:** Neon separa la capa de cómputo (instancias Postgres efímeras) de la capa de almacenamiento (Neon Page Server distribuido). Permite autoescalado en función de la demanda y reducción a cero cómputos (scale-to-zero) en inactividad.
- **Estrategia de Doble Enlace (Dual Connection):**
  1. `DATABASE_URL` (Connection Pooling): Utiliza un proxy PgBouncer gestionado por Neon (`-pooler`). Diseñado específicamente para entornos serverless, evitando la sobrecarga por apertura y cierre continuo de conexiones TCP.
  2. `DIRECT_URL` (Direct Connection): Conexión directa TCP hacia el endpoint primario de PostgreSQL. Requerida por Prisma Migrate para ejecutar sentencias de lenguaje de definición de datos (DDL) y bloqueos a nivel de esquema sin interferencias de PgBouncer.

### 2.2 Despliegue de Aplicación: Vercel Cloud
- **Motor de Compilación:** Pipeline CI/CD conectado a la rama `main` del repositorio Git.
- **Hook de Instalación:** En la fase de `postinstall` se ejecuta automáticamente `prisma generate` para compilar el cliente tipado de Prisma adaptado al entorno del contenedor de compilación de Vercel.
- **Enrutamiento:** Procesamiento dinámico mediante funciones serverless en Node.js runtime para Server Actions y páginas con Server-Side Rendering (SSR).

### 2.3 Repositorios y Control de Código Fuente
El código se encuentra bajo control de versiones con la siguiente topología de remotos:
- **Remoto Primario (`origin`):** `https://github.com/jdquispedev-hub/g01-sgcs-plataforma.git` (Vinculado a Vercel para despliegues continuos de producción).
- **Remoto Secundario (`clara`):** `https://github.com/ClaraBQuispeChileno/G01_Gesti-n-de-la-Configuraci-n-de-S-ftware.git` (Repositorio de respaldo y sincronización colegiada).

---

## 3. Stack Tecnológico y Dependencias

El sistema ha sido desarrollado bajo el principio de tipado estricto de extremo a extremo (End-to-End Type Safety).

### 3.1 Frontend
- **Next.js 14.2.18:** Uso integral del App Router (`app/`), optimizando la transferencia de JavaScript hacia el cliente mediante React Server Components.
- **React 18.3.1:** Biblioteca base para la gestión declarativa de la interfaz.
- **Tailwind CSS 3.4.15:** Marco de trabajo de diseño basado en clases utilitarias, complementado con `tailwind-merge` y `clsx` para control de variantes y estados dinámicos.
- **Framer Motion 14.9.0:** Motor de animaciones fluidas para transiciones modales, tablas y retroalimentación de operaciones.
- **Lucide React 0.460.0:** Catálogo de vectores SVG normalizados para la iconografía del sistema.

### 3.2 Backend y Lógica de Negocio
- **Server Actions:** Mecanismo nativo de Next.js para mutaciones de datos del lado del servidor, eliminando la necesidad de APIs intermedias redundantes y manteniendo la seguridad de las transacciones.
- **Zod 3.23.8:** Biblioteca de validación y análisis de esquemas tipados. Todas las entradas del usuario (formularios, parámetros de URL, payloads) son validadas rigurosamente en servidor antes de interactuar con la base de datos.
- **Jose 6.2.14 y Jsonwebtoken 9.0.7:** Implementación de estándares de seguridad Web Token. Las sesiones se firman mediante algoritmos criptográficos robustos (HS256) y se distribuyen exclusivamente en cookies con directivas `HttpOnly`, `SameSite=Lax` y `Secure`.
- **Bcryptjs 2.4.3:** Funciones hash criptográficas con factor de salting 12 para la protección de contraseñas de usuarios.

### 3.3 Capa de Datos
- **Prisma Client 5.22.0:** ORM que proporciona consultas fuertemente tipadas en TypeScript, prevención de inyecciones SQL por parametrización nativa y transacciones ACID (`prisma.$transaction`).
- **TypeScript 5.6.3:** Lenguaje de desarrollo configurado con reglas estrictas de compilación.

---

## 4. Modelo de Datos Relacional y Diccionario de Base de Datos

### 4.1 Diagrama Entidad-Relación (Mermaid)

```mermaid
erDiagram
    ORGANIZACIONES ||--o{ USUARIOS : "agrupa"
    ORGANIZACIONES ||--o{ PROYECTOS_CASOS : "administra"
    
    USUARIOS ||--o{ AUDITORIA_LOGS : "origina"
    USUARIOS ||--o{ REPORTES_DIARIOS : "redacta"
    USUARIOS ||--o{ REUNIONES_PROYECTO : "convoca"
    USUARIOS ||--o{ ECS : "supervisa"
    USUARIOS ||--o{ VERSIONES_ECS : "autoriza"
    USUARIOS ||--o{ LINEAS_BASE : "concreta"
    USUARIOS ||--o{ SOLICITUDES_CAMBIO : "plantea"
    USUARIOS ||--o{ EVALUACIONES_CAMBIO : "dictamina"

    PROYECTOS_CASOS ||--o{ ECS : "contiene"
    PROYECTOS_CASOS ||--o{ LINEAS_BASE : "congelado_en"
    PROYECTOS_CASOS ||--o{ REPORTES_DIARIOS : "bitacora"
    PROYECTOS_CASOS ||--o{ REUNIONES_PROYECTO : "actas"

    ECS ||--o{ VERSIONES_ECS : "historial_versiones"
    ECS ||--o{ SOLICITUDES_CAMBIO : "objeto_modificacion"
    ECS ||--o{ CAMBIO_ECS_AFECTADOS : "impactado"

    LINEAS_BASE ||--o{ LINEA_BASE_VERSIONES : "compuesta_por"
    VERSIONES_ECS ||--o{ LINEA_BASE_VERSIONES : "version_incluida"

    SOLICITUDES_CAMBIO ||--o| EVALUACIONES_CAMBIO : "dictamen_ccb"
    SOLICITUDES_CAMBIO ||--o{ CAMBIO_ECS_AFECTADOS : "evaluacion_impacto"
    VERSIONES_ECS ||--o{ SOLICITUDES_CAMBIO : "version_origen"
    VERSIONES_ECS ||--o{ SOLICITUDES_CAMBIO : "version_propuesta"
```

### 4.2 Diccionario de Tablas Relacionales

A continuación se detalla la estructura física de las trece tablas implementadas en PostgreSQL:

#### 1. `organizaciones`
Representa cada empresa o institución inquilina dentro del esquema multi-tenant.
- `id` (UUID, PK): Identificador único global.
- `nombre` (VARCHAR 150, NOT NULL): Razón social o denominación de la empresa.
- `rubro` (ENUM RubroIndustria, NOT NULL): Industria base (`SOFTWARE`, `CONSTRUCCION`, `VETERINARIA`, `OTRO`).
- `configuracion_terminologia` (JSONB, DEFAULT `{}`): Mapeo dinámico de vocabulario técnico.
- `activo` (BOOLEAN, DEFAULT TRUE): Estado de la suscripción/acceso.
- `created_at` / `updated_at` (TIMESTAMP): Marcas temporales de auditoría.

#### 2. `usuarios`
Catálogo de usuarios con asignación estricta a una organización.
- `id` (UUID, PK): Identificador del usuario.
- `organizacion_id` (UUID, FK -> `organizaciones.id`, ON DELETE CASCADE): Organización a la que pertenece.
- `nombre_completo` (VARCHAR 150, NOT NULL): Nombres y apellidos.
- `email` (VARCHAR 150, NOT NULL): Correo electrónico institucional.
- `password_hash` (VARCHAR 255, NOT NULL): Clave encriptada con Bcrypt.
- `rol` (ENUM RolUsuario, NOT NULL): Nivel de autorización (`SUPERADMIN`, `ADMINISTRADOR`, `APROBADOR`, `SOLICITANTE`).
- `cargo` (VARCHAR 100, NULL): Posición formal (ej. Residente de Obra, Tech Lead).
- `activo` (BOOLEAN, DEFAULT TRUE): Habilitación del perfil.
- **Restricciones:** Clave única compuesta `UNIQUE(organizacion_id, email)` e índice de búsqueda en `email`.

#### 3. `proyectos_casos`
Contenedor central de la configuración, delimitando el alcance de una obra o desarrollo de software.
- `id` (UUID, PK): Identificador del proyecto.
- `organizacion_id` (UUID, FK -> `organizaciones.id`, ON DELETE CASCADE): Empresa propietaria.
- `codigo` (VARCHAR 50, NOT NULL): Código alfanumérico identificador (ej. `PRY-CURSOS-01`, `PRY-CASA-01`).
- `nombre` (VARCHAR 200, NOT NULL): Nombre oficial de la obra o sistema.
- `cliente_nombre` (VARCHAR 150, NOT NULL): Nombre del cliente o entidad contratante.
- `fecha_inicio` (DATE, NOT NULL): Fecha de inicio oficial.
- `fecha_estimada_fin` (DATE, NULL): Proyección de culminación.
- `estado` (ENUM EstadoProyecto, NOT NULL): Estado del proyecto (`DIAGNOSTICO`, `PLANIFICACION`, `EN_EJECUCION`, `CONGELADO`, `CERRADO`).
- **Restricciones:** Clave única compuesta `UNIQUE(organizacion_id, codigo)`.

#### 4. `ecs`
Catálogo de Elementos de Configuración bajo gestión formal.
- `id` (UUID, PK): Identificador del ECS.
- `proyecto_id` (UUID, FK -> `proyectos_casos.id`, ON DELETE CASCADE): Proyecto contenedor.
- `codigo` (VARCHAR 50, NOT NULL): Identificador técnico del elemento (ej. `ECS-MOD-PAGOS`, `PLANO-EST-01`).
- `nombre` (VARCHAR 200, NOT NULL): Nombre descriptivo del entregable.
- `tipo` (ENUM TipoEcs, NOT NULL): Clasificación técnica (`DOCUMENTO`, `CODIGO_FUENTE`, `DISENO`, `BASE_DATOS`, `CASO_PRUEBA`, `OTRO`).
- `descripcion` (TEXT, NULL): Resumen funcional y alcance.
- `ubicacion` (VARCHAR 500, NOT NULL): Ruta en repositorio de código, enlace a almacenamiento cloud o archivador físico.
- `responsable_id` (UUID, FK -> `usuarios.id`): Usuario custodio técnico del elemento.
- `atributos_personalizados` (JSONB, DEFAULT `{}`): Metadatos adicionales (ej. escala, herramienta CAD, lenguaje).
- `estado` (ENUM EstadoEcs, DEFAULT `ACTIVO`): Estado (`ACTIVO`, `DEPRECADO`).
- **Restricciones:** Clave única compuesta `UNIQUE(proyecto_id, codigo)`.

#### 5. `versiones_ecs`
Historial de iteraciones de un elemento de configuración.
- `id` (UUID, PK): Identificador de la versión.
- `ecs_id` (UUID, FK -> `ecs.id`, ON DELETE CASCADE): Elemento de configuración asociado.
- `numero_version` (VARCHAR 30, NOT NULL): Nomenclatura de versión (ej. `1.0.0`, `REV-B`).
- `descripcion` (TEXT, NOT NULL): Memoria explicativa de los cambios introducidos.
- `archivo_url` (VARCHAR 500, NULL): Enlace a los artefactos o commit específico.
- `estado` (ENUM EstadoVersion, NOT NULL): Estado de validación (`PENDIENTE`, `APROBADA`, `RECHAZADA`).
- `autor_id` (UUID, FK -> `usuarios.id`): Autor que genera la versión.
- `aprobador_id` (UUID, FK -> `usuarios.id`, NULL): Miembro del CCB que dictaminó la versión.
- `fecha_aprobacion` (TIMESTAMP, NULL): Momento de la aprobación formal.
- **Restricciones:** Clave única compuesta `UNIQUE(ecs_id, numero_version)`.

#### 6. `lineas_base`
Hitos congelados de configuración que agrupan un conjunto de entregables formalmente aprobados.
- `id` (UUID, PK): Identificador de la Línea Base.
- `proyecto_id` (UUID, FK -> `proyectos_casos.id`, ON DELETE CASCADE): Proyecto al que pertenece.
- `codigo` (VARCHAR 50, NOT NULL): Identificador unívoco (ej. `LB-CURSOS-01`, `LB-ESTRUCTURAS-01`).
- `nombre` (VARCHAR 200, NOT NULL): Denominación del hito (ej. Línea Base de Arquitectura).
- `descripcion` (TEXT, NULL): Alcance formal congelado.
- `autor_id` (UUID, FK -> `usuarios.id`): Usuario que formaliza la creación.
- `estado` (ENUM EstadoLineaBase, DEFAULT `VIGENTE`): Estado (`VIGENTE`, `OBSOLETA`).
- **Restricciones:** Clave única compuesta `UNIQUE(proyecto_id, codigo)`.

#### 7. `linea_base_versiones`
Tabla puente de asociación que materializa la inmutabilidad de las líneas base.
- `linea_base_id` (UUID, FK -> `lineas_base.id`, ON DELETE CASCADE): Línea base.
- `version_ecs_id` (UUID, FK -> `versiones_ecs.id`, ON DELETE RESTRICT): Versión de ECS congelada.
- **Regla Crítica de Integridad:** La restricción `ON DELETE RESTRICT` asegura que ninguna versión asociada a una línea base vigente pueda ser eliminada del sistema.
- **Restricciones:** Clave primaria compuesta `PRIMARY KEY (linea_base_id, version_ecs_id)`.

#### 8. `solicitudes_cambio`
Expedientes de Solicitud de Cambio (RFC) dirigidos al Comité de Control de Cambios.
- `id` (UUID, PK): Identificador de la solicitud.
- `codigo` (VARCHAR 50, NOT NULL, UNIQUE): Identificador único (ej. `RFC-2026-001`).
- `ecs_id` (UUID, FK -> `ecs.id`, ON DELETE CASCADE): Elemento principal sobre el que se solicita el cambio.
- `version_base_id` (UUID, FK -> `versiones_ecs.id`, ON DELETE RESTRICT): Versión actual vigente que se propone modificar.
- `version_resultante_id` (UUID, FK -> `versiones_ecs.id`, ON DELETE SET NULL, NULL): Nueva versión generada una vez implementado el cambio.
- `descripcion` (TEXT, NOT NULL): Descripción técnica de la alteración requerida.
- `justificacion` (TEXT, NOT NULL): Fundamentación operativa, contractual o de mejora.
- `estado` (ENUM EstadoCambio, NOT NULL): Flujo del cambio (`PENDIENTE_EVALUACION`, `EN_EVALUACION`, `APROBADA`, `RECHAZADA`, `IMPLEMENTADA`).
- `solicitante_id` (UUID, FK -> `usuarios.id`): Usuario que emite la propuesta.
- `resolutor_id` (UUID, FK -> `usuarios.id`, NULL): Miembro del CCB que emitió el dictamen final.
- `resolucion_justificacion` (TEXT, NULL): Motivos técnicos del veredicto del CCB.
- `fecha_resolucion` / `fecha_implementacion` (TIMESTAMP, NULL): Marcas de tiempo de resolución y cierre.

#### 9. `evaluaciones_cambio`
Evaluación técnica y de impacto realizada por el Comité de Control de Cambios antes de resolver una RFC.
- `id` (UUID, PK): Identificador del informe de evaluación.
- `solicitud_id` (UUID, FK -> `solicitudes_cambio.id`, ON DELETE CASCADE, UNIQUE): Solicitud evaluada.
- `impacto` (ENUM NivelImpacto, NOT NULL): Clasificación del riesgo (`BAJO`, `MEDIO`, `ALTO`, `CRITICO`).
- `observaciones` (TEXT, NOT NULL): Análisis de interferencias, costo y tiempo estimado.
- `evaluador_id` (UUID, FK -> `usuarios.id`): Ingeniero o evaluador responsable del análisis.

#### 10. `cambio_ecs_afectados`
Matriz de impacto que vincula elementos colaterales susceptibles a verse afectados por un cambio.
- `solicitud_id` (UUID, FK -> `solicitudes_cambio.id`, ON DELETE CASCADE).
- `ecs_id` (UUID, FK -> `ecs.id`, ON DELETE CASCADE).
- **Restricciones:** Clave primaria compuesta `PRIMARY KEY (solicitud_id, ecs_id)`.

#### 11. `reportes_diarios`
Bitácoras diarias operativas (Daily Standups o Bitácoras de Obra).
- `id` (UUID, PK): Identificador del reporte diario.
- `proyecto_id` (UUID, FK -> `proyectos_casos.id`, ON DELETE CASCADE).
- `usuario_id` (UUID, FK -> `usuarios.id`): Autor de la bitácora.
- `fecha` (DATE, NOT NULL): Día correspondiente al informe.
- `resumen_actividades` (TEXT, NOT NULL): Actividades ejecutadas en la jornada.
- `metricas_avance` (JSONB, DEFAULT `{}`): Indicadores cuantificables (ej. porcentaje de avance, horas hombre).
- `tiene_bloqueo` (BOOLEAN, DEFAULT FALSE): Señalización de impedimentos críticos.
- `detalle_bloqueo` (TEXT, NULL): Explicación del obstáculo operativo.
- `evidencias_urls` (TEXT[], DEFAULT ARRAY[]): Enlaces a fotografías, logs o actas.

#### 12. `auditoria_logs`
Pistas de auditoría del sistema conforme a la norma RNF-10.
- `id` (BIGINT, PK, AUTOINCREMENT): Secuencia ordenada de eventos.
- `usuario_id` (UUID, FK -> `usuarios.id`, ON DELETE SET NULL, NULL): Actor que ejecutó la acción.
- `accion` (VARCHAR 100, NOT NULL): Nombre del evento (ej. `APROBAR_SOLICITUD_CAMBIO`, `CREAR_LINEA_BASE`).
- `entidad` (VARCHAR 50, NOT NULL): Tabla afectada (ej. `solicitudes_cambio`).
- `entidad_id` (VARCHAR 100, NOT NULL): Clave primaria del registro alterado.
- `datos_anteriores` (JSONB, NULL): Fotografía del estado previo a la mutación.
- `datos_nuevos` (JSONB, NULL): Fotografía del estado posterior.
- `ip_address` (VARCHAR 45, NULL): Dirección IPv4 o IPv6 de origen.
- `user_agent` (VARCHAR 255, NULL): Firma del cliente/navegador.
- `created_at` (TIMESTAMP, DEFAULT NOW()): Marca de tiempo UTC inalterable.

#### 13. `reuniones_proyecto`
Actas de acuerdos con clientes o sesiones internas del equipo de ingeniería.
- `id` (UUID, PK): Identificador del acta de reunión.
- `proyecto_id` (UUID, FK -> `proyectos_casos.id`, ON DELETE CASCADE).
- `convocante_id` (UUID, FK -> `usuarios.id`, ON DELETE SET NULL, NULL): Convocante oficial.
- `titulo` (VARCHAR 200, NOT NULL): Propósito de la sesión.
- `tipo` (ENUM TipoReunion, NOT NULL): `CLIENTE`, `EQUIPO_INTERNO` o `COMITE_CAMBIOS`.
- `fecha` (TIMESTAMP, NOT NULL): Fecha de celebración.
- `hora` (VARCHAR 10, DEFAULT '10:00'): Hora fijada.
- `participantes` (TEXT, NOT NULL): Lista de asistentes formales.
- `temas_tratados` (TEXT, NOT NULL): Puntos expuestos en la agenda.
- `acuerdos` (TEXT, NOT NULL): Compromisos asumidos con valor contractual o técnico.
- `proximo_paso` (TEXT, NULL): Tarea inmediata de seguimiento.

---

## 5. Ciclo de Vida y Flujos Operativos del SGCS

El funcionamiento del sistema implementa de forma estricta los cuatro macroprocesos estándar de la disciplina de Gestión de la Configuración:

```mermaid
flowchart TD
    subgraph Fase1["1. Identificacion de la Configuracion"]
        A[Definicion de Proyecto] --> B[Registro de ECS]
        B --> C[Emision de Version Inicial 1.0.0]
    end

    subgraph Fase2["2. Establecimiento de Linea Base"]
        C --> D[Revision Tecnica Aprobada]
        D --> E[Congelamiento de Linea Base Vigente]
    end

    subgraph Fase3["3. Control de Modificaciones (CCB)"]
        E -.->|Surge requerimiento o desvio| F[Emision de Solicitud de Cambio RFC]
        F --> G[Evaluacion de Impacto Tecnico]
        G --> H{Veredicto del CCB}
        H -->|Rechazado| I[Cierre con Justificacion]
        H -->|Aprobado| J[Implementacion de Nueva Version]
        J --> K[Actualizacion de Linea Base / Nueva LB]
    end

    subgraph Fase4["4. Contabilidad de Estado y Auditoria"]
        E --> L[Bitacora Diaria de Avance]
        J --> L
        L --> M[Pista de Auditoria Inmutable RNF-10]
    end
```

### 5.1 Flujo 1: Registro de ECS y Control de Versiones
1. El `ADMINISTRADOR` o `SOLICITANTE` crea un nuevo Elemento de Configuración indicando su código, tipo (código fuente, diseño, plano) y ubicación.
2. Se asigna un responsable custodio y se publica la primera versión (`1.0.0` o `REV-A`).
3. El estado de la versión queda en `PENDIENTE` hasta que un usuario con rol `APROBADOR` convalide la integridad del artefacto.

### 5.2 Flujo 2: Congelamiento de Línea Base (Baseline)
1. Al completarse un hito del cronograma, el `ADMINISTRADOR` o `APROBADOR` crea una Línea Base formal.
2. Se asocian las versiones de ECS vigentes que conforman el hito contractual.
3. El sistema bloquea las versiones seleccionadas (`ON DELETE RESTRICT`). A partir de este momento, **ningún usuario puede modificar ni borrar directamente estos elementos sin un dictamen del CCB**.

### 5.3 Flujo 3: Circuito de Solicitudes de Cambio (RFC) y Comité CCB
1. Si un cliente solicita una ampliación de alcance o se detecta un error de ingeniería, el `SOLICITANTE` abre una Solicitud de Cambio formal (`RFC-XXXX-XXX`).
2. Se especifica la versión base congelada que se desea modificar y la justificación técnica.
3. El `APROBADOR` realiza el análisis técnico en `EvaluacionCambio`, calificando el nivel de impacto (`BAJO`, `MEDIO`, `ALTO`, `CRITICO`) y mapeando los componentes secundarios afectados en `CambioEcsAfectado`.
4. El Comité de Control de Cambios (CCB) sesiona y emite su resolución (`APROBADA` o `RECHAZADA`).
5. En caso de aprobación, el equipo de desarrollo u obra genera la versión resultante de reemplazo (ej. `1.1.0`), marcando la solicitud como `IMPLEMENTADA`.

### 5.4 Flujo 4: Bitácoras Diarias y Minutas de Acuerdos
1. Diariamente, los ingenieros de software o residentes de obra emiten un `ReporteDiario` declarando avances, porcentajes y bloqueos operativos.
2. Cada reunión con clientes o comités de control genera un registro en `reuniones_proyecto`, registrando acuerdos inalterables que sirven como sustento para futuras solicitudes de cambio.

---

## 6. Matriz de Requerimientos No Funcionales (RNF)

| Requerimiento | Descripción Formal | Mecanismo de Implementación Técnica en el Repositorio |
| :--- | :--- | :--- |
| **RNF-01** | Seguridad y Cifrado de Credenciales | Cifrado no reversible de contraseñas mediante Bcrypt (factor de costo 12). Ningún secreto ni cadena de conexión se expone en logs ni en respuestas al cliente. |
| **RNF-02** | Autorización Estricta en Servidor | Middleware de Next.js y verificación de roles en cada Server Action. Las peticiones no autorizadas son interceptadas antes de ejecutar consultas a la base de datos. |
| **RNF-06** | Adaptabilidad de Interfaz (Responsive) | Maquetación con CSS Grid y Flexbox mediante Tailwind CSS, validada para resoluciones desde 360px (smartphones) hasta 1366px y superiores (monitores de ingeniería). |
| **RNF-10** | Trazabilidad e Inmutabilidad Forense | Inserción automática en la tabla `auditoria_logs` ante cada creación, actualización o dictamen de cambio, registrando usuario, IP y diferencias de datos (JSON diff). |
| **RNF-12** | Manejo y Sanitización de Errores | Bloques `try/catch` globales en Server Actions. En caso de fallo de infraestructura, la UI recibe un mensaje amigable y se ocultan los volcados de memoria y esquemas SQL. |

---

## 7. Guía Operativa, Variables de Entorno y Credenciales de Acceso

### 7.1 Variables de Entorno de Producción (`.env`)
```bash
# Conexion agrupada mediante Neon Connection Pooler (PgBouncer)
DATABASE_URL="postgresql://neondb_owner:npg_8qXJ7gYQxAvR@ep-restless-paper-beg93kn2-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"

# Conexion directa TCP para migraciones de esquema con Prisma
DIRECT_URL="postgresql://neondb_owner:npg_8qXJ7gYQxAvR@ep-restless-paper-beg93kn2.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Secreto criptografico para la firma de tokens JWT de sesion
JWT_SECRET="sgcs-prod-secret-key-2026-very-secure-change-in-production"

# Entorno de despliegue
NODE_ENV="production"
```

### 7.2 Catálogo de Cuentas y Credenciales de Demostración

> [!important] Clave Universal de Acceso
> Todas las cuentas de prueba iniciales de la base de datos comparten la misma contraseña:
> **`Admin123!`**

#### SuperAdministrador del Sistema
- **Correo Electrónico:** `superadmin@sgcs.com`
- **Rol:** `SUPERADMIN`
- **Privilegios:** Administración de tenants globales, alta de organizaciones, métricas consolidadas y función de suplantación autorizada.

#### Inquilino 1: Rubro Construcción Civil (*Constructora & Proyectos Los Andes*)
- **Administrador (Residente de Obra):** `admin.construccion@sgcs.com`
- **Aprobador (Arquitecta / Supervisora CCB):** `aprobador.construccion@sgcs.com`
- **Solicitante (Maestro de Obra / Cuadrilla):** `maestro.obra@sgcs.com`
- **Proyecto Asignado:** Construcción Vivienda Residencial 2 Pisos (`PRY-CASA-01`).
- **Línea Base Activa:** `LB-ESTRUCTURAS-01` (Planos estructurales congelados).

#### Inquilino 2: Rubro Software / TI (*DevCraft Software Solutions*)
- **Administrador (Gerente de TI):** `admin.software@sgcs.com`
- **Aprobador (Tech Lead / Arquitecto CCB):** `aprobador.software@sgcs.com`
- **Solicitante (Desarrolladora Frontend):** `ana.frontend@sgcs.com`
- **Solicitante (Desarrollador Backend):** `luis.backend@sgcs.com`
- **Proyectos Asignados:** Plataforma Web E-Learning y Pagos (`PRY-CURSOS-01`) y App Móvil de Estudiantes (`PRY-APP-02`).
- **Línea Base Activa:** `LB-CURSOS-01` (Módulo de Pagos congelado).

---

## 8. Guía para Exportar este Documento a PDF en Obsidian

Para generar un documento PDF de alta calidad formal a partir de este archivo utilizando la aplicación Obsidian instalada en el sistema, siga los pasos que se detallan a continuación:

### Paso 1: Abrir el Archivo en Obsidian
1. Inicie la aplicación **Obsidian**.
2. Seleccione la opción **Open folder as vault** (Abrir carpeta como bóveda) y seleccione la carpeta `docs/obsidian/` de este proyecto, o copie este archivo directamente a su bóveda de notas habitual.
3. Abra el archivo `SGCS_Informe_Tecnico_Completo.md`.

### Paso 2: Configurar la Exportación a PDF
1. Presione el atajo de teclado `Ctrl + P` para abrir la paleta de comandos de Obsidian.
2. Escriba y seleccione: **Export to PDF** (Exportar a PDF).
3. En la ventana modal de configuración de impresión:
   - **Page size (Tamaño de página):** A4.
   - **Margin (Márgenes):** Normal o Default.
   - **Downscale percent (Escala):** 100%.
   - **Show page numbers (Números de página):** Activado.
4. Haga clic en el botón **Export to PDF**, seleccione la carpeta de destino y asigne el nombre final del archivo (por ejemplo, `Informe_Tecnico_SGCS_G01.pdf`).

Obsidian generará automáticamente un archivo PDF vectorial que incluirá la portada formal, los llamados de alerta técnicos, las tablas formateadas y todos los diagramas de arquitectura y base de datos con tipografía vectorial nítida.
