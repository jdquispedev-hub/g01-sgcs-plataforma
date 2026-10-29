# 02. Especificación de Requerimientos del Sistema

Este documento formaliza los **Requerimientos No Funcionales (RNF-01 al RNF-12)** y los **Requerimientos Funcionales (RF-01 al RF-18)** que rigen el sistema.

---

## 1. Requerimientos No Funcionales (RNF)

| Código | Nombre | Descripción Técnica y Criterio de Aceptación |
| :--- | :--- | :--- |
| **RNF-01** | Seguridad de credenciales | Almacenamiento obligatorio de contraseñas con función hash criptográfica (`bcrypt` con salt individual). Las contraseñas en texto plano nunca deben figurar en la base de datos, respuestas JSON ni archivos de log. |
| **RNF-02** | Protección de acceso | Verificación de identidad y permisos de rol (RBAC) ejecutada estrictamente en el servidor en cada petición. El sistema debe rechazar cualquier intento de acceso no autorizado por URL directa o llamadas forzadas de API. |
| **RNF-03** | Protección de comunicaciones | Toda transmisión de credenciales y datos sensibles debe efectuarse obligatoriamente mediante el protocolo HTTPS con cifrado TLS 1.3 / 1.2. |
| **RNF-04** | Rendimiento y concurrencia | $\ge 95\%$ de las consultas deben completarse en $\le 3$ segundos bajo pruebas de carga con 10 usuarios concurrentes y 1 000 registros ECS (excluye descarga de archivos pesados). |
| **RNF-05** | Usabilidad de formularios | Identificación visual clara de campos obligatorios (asterisco rojo), mensajes de error en línea inmediatos y conservación íntegra de los datos válidos tras un fallo de validación. |
| **RNF-06** | Adaptabilidad de interfaz | Diseño *Responsive Mobile-First* validado en resoluciones de 360 px (smartphone), 768 px (tablet) y 1366 px (escritorio) sin solapamiento de textos ni desbordes horizontales de página. |
| **RNF-07** | Compatibilidad de navegadores | Soporte funcional y visual verificado en las versiones actuales de Google Chrome, Microsoft Edge y Mozilla Firefox. |
| **RNF-08** | Integridad transaccional | Gestión transaccional ACID (`BEGIN ... COMMIT / ROLLBACK`) en todas las operaciones que afecten múltiples entidades (ej. aprobación de cambios y generación de líneas base) para evitar inconsistencias o estados parciales. |
| **RNF-09** | Respaldo y recuperación | Soporte para copias de seguridad (backup) periódicas de la base de datos y archivos adjuntos, garantizando un procedimiento documentado de restauración comprobado. |
| **RNF-10** | Protección del historial | Los registros de auditoría (`auditoria_logs`) son de solo inserción (*append-only*); no pueden ser modificados ni eliminados por los usuarios de la aplicación ni por servicios del sistema. |
| **RNF-11** | Mantenibilidad arquitectónica | Clara separación de capas (Interfaz de usuario, lógica de negocio/servicios y persistencia de datos) acompañada de documentación de despliegue y mantenimiento. |
| **RNF-12** | Manejo seguro de errores | Presentación de mensajes de error comprensibles y amigables al usuario final, manteniendo los detalles técnicos (trazas SQL, rutas de archivos y credenciales) confinados a logs internos privados. |

---

## 2. Requerimientos Funcionales (RF)

### Módulo de Acceso, Usuarios y Roles
* **RF-01 (Iniciar sesión):** El sistema debe autenticar al usuario mediante email y contraseña, verificando que la cuenta esté activa y asignando los privilegios y vistas según su rol.
* **RF-02 (Gestionar usuarios):** El Administrador de la empresa podrá dar de alta, consultar, actualizar y desactivar cuentas de trabajadores, garantizando identificadores y correos únicos y preservando el histórico de operaciones.
* **RF-03 (Asignar roles y permisos):** Soporte para los roles funcionales: `Administrador`, `Responsable de Aprobación` (Especialista Técnico) y `Solicitante` (Operador/Trabajador de Campo), además del rol `SuperAdmin` de la plataforma.

### Módulo de Elementos de Configuración (ECS)
* **RF-04 (Registrar ECS):** Permitir el registro de un nuevo Elemento de Configuración del Software (o activo de proyecto) con código único, nombre, tipo, descripción, responsable asignado y ubicación física o repositorio.
* **RF-05 (Consultar ECS):** Proveer catálogo de búsqueda con filtros por código, nombre y tipo, permitiendo acceder al detalle de sus versiones históricas y solicitudes de cambio asociadas.
* **RF-06 (Actualizar ECS):** Permitir la edición descriptiva de un ECS manteniendo invariable su código identificador e integrando auditoría automática de autor y fecha.

### Módulo de Control de Versiones
* **RF-07 (Registrar versiones):** Registro de una nueva versión asociada a un ECS con número correlativo único por ECS, descripción detallada del cambio, usuario responsable y enlace/archivo de referencia.
* **RF-08 (Consultar y aprobar versiones):** Visualización del historial de versiones de un ECS y flujo formal de aprobación o rechazo ejecutado exclusivamente por el `Responsable de Aprobación`, con fecha y justificación registrada.

### Módulo de Líneas Base
* **RF-09 (Establecer líneas base):** Creación de una línea base formal compuesta **exclusivamente por versiones aprobadas** de los ECS seleccionados.
* **RF-10 (Consultar líneas base):** Visualización inmutable del conjunto de versiones congeladas que conforman una línea base. Cualquier modificación requerirá la creación formal de una nueva línea base.

### Módulo de Gestión de Cambios (RFC)
* **RF-11 (Registrar solicitudes de cambio):** Registro de una solicitud de cambio (RFC) vinculada a un ECS y su versión base, con descripción del cambio requerido, justificación e identificador correlativo único (estado inicial: *Pendiente de evaluación*).
* **RF-12 (Consultar solicitudes de cambio):** Bandeja de solicitudes con filtros por identificador, ECS, estado y rango de fechas, según los permisos del usuario.
* **RF-13 (Registrar evaluación del cambio):** Registro de dictamen técnico que detalle nivel de impacto (Bajo, Medio, Alto, Crítico), ECS indirectamente afectados y observaciones técnicas con firma de autor y fecha.
* **RF-14 (Aprobar o rechazar solicitudes):** Resolución formal de la solicitud por el `Responsable de Aprobación`, documentando la decisión y justificación y pasando el estado a *Aprobada* o *Rechazada*.
* **RF-15 (Registrar implementación del cambio):** Vinculación de una solicitud aprobada con la versión resultante implementada (cambio a estado *Implementada*), garantizando que las líneas base históricas permanezcan inalteradas.

### Módulo de Auditoría, Trazabilidad y Reportes
* **RF-16 (Registrar historial de operaciones):** Registro automático e imperceptible de cada acción relevante en el sistema (usuario, fecha/hora, acción, entidad afectada y valores anteriores/nuevos).
* **RF-17 (Consultar trazabilidad):** Representación gráfica o matricial de trazabilidad completa entre ECS, versiones, líneas base donde participa y solicitudes de cambio asociadas.
* **RF-18 (Generar reportes):** Exportación y visualización de reportes de estado de ECS, versiones, líneas base y ciclo de vida de cambios con filtros por fechas y estados.
