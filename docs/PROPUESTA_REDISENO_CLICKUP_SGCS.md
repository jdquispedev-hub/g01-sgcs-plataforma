# Propuesta de Arquitectura y Rediseño Visual: SGCS ClickUp 3.0

> **Documento de Diseño de Interfaz y Experiencia de Usuario (UI/UX)**  
> **Proyecto:** Plataforma de Gestión de la Configuración de Software (SGCS)  
> **Fecha de Especificación:** 13 de Noviembre de 2026  
> **Estado:** Aprobado para Implementación  

---

## 1. Diagnóstico de la Interfaz Actual

Durante la evaluación de usabilidad y revisión técnica se identificaron tres factores críticos que generaban fatiga visual y confusión en la navegación:

1. **Saturación Visual por Exceso de Color y Gradientes:**
   - Presencia predominante de gradientes dorados (`from-upt-gold to-amber-400`), tarjetas con fondos contrastantes (`bg-red-600`, `bg-sky-500/15`, `bg-emerald-500/15`) y bordes de alta intensidad que competían de manera simultánea por la atención del usuario.
2. **Elementos Sobredimensionados ("Cosas Gigantes"):**
   - Tarjetas informativas con paddings excesivos (`p-7`, `rounded-3xl`) que ocupaban hasta el 60% de la altura de la pantalla, empujando la información operativa relevante hacia abajo y forzando un scroll vertical innecesario.
3. **Falta de Segmentación por Contexto de Trabajo:**
   - La pantalla principal (*Dashboard*) concentraba en una sola columna vertical: el stepper de 5 fases del ciclo de vida, la alerta de bloqueos de campo, el banner personal del colaborador, 3 métricas numéricas grandes, el catálogo de artefactos y la bandeja de asignaciones.

---

## 2. Paradigma de Referencia: ClickUp 3.0 & Linear

Para transformar el SGCS en una plataforma de ingeniería moderna, limpia y de alto rendimiento, se adopta el modelo de **ClickUp 3.0** combinado con la sobriedad cromática de **Linear**:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📁 PROYECTO: SGCS-PLATAFORMA  •  Metodología: RUP (Proceso Unificado)       [+ Nuevo Objeto] │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  [📥 Mi Bandeja (2)]   [📋 Entregables]   [📅 Cronograma]   [🔗 Trazabilidad CU01]   [⚙️ Config]  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│  ▼ FASE 1: INICIO (Concepción y Viabilidad)                                2 Entregables   │
│  ┌──────────┬────────────────────────────┬─────────────┬──────────────┬──────────┬───────┐  │
│  │ Código   │ Entregable / Artefacto     │ Responsable │ Plazo        │ Estado   │ Acción│  │
│  ├──────────┼────────────────────────────┼─────────────┼──────────────┼──────────┼───────┤  │
│  │ SRS-CU01 │ Especificación Requisitos  │ Luis Dev    │ 12-18 Nov    │ Pendiente│ [✓][✗]│  │
│  │ CAS-001  │ Caso de Negocio Inicial    │ Ana Analist │ 12-15 Nov    │ Aceptada │ Det.  │  │
│  └──────────┴────────────────────────────┴─────────────┴──────────────┴──────────┴───────┘  │
│                                                                                             │
│  ▼ FASE 2: ELABORACIÓN (Arquitectura y Línea Base)                         3 Entregables   │
│  ┌──────────┬────────────────────────────┬─────────────┬──────────────┬──────────┬───────┐  │
│  │ SAD-CU01 │ Documento Arquitectura SAD │ Carlos Arq  │ 19-28 Nov    │ Aceptada │ Det.  │  │
│  │ MOD-001  │ Modelo Entidad-Relación BD │ Luis Dev    │ 20-25 Nov    │ Progreso │ Det.  │  │
│  └──────────┴────────────────────────────┴─────────────┴──────────────┴──────────┴───────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Pilares de la Nueva Arquitectura

### 3.1. Barra de Vistas Superior (*View Switcher*)
En lugar de forzar al usuario a hacer scroll infinito, la navegación se estructura en 4 pestañas superiores de acceso instantáneo (0ms):
* **📥 Mi Bandeja (Inbox):** Centro de notificaciones operativas donde el usuario logueado visualiza exclusivamente los entregables que el administrador le ha delegado, contando con botones directos de **[Aceptar Asignación]** y **[Rechazar]** (con modal de justificación obligatoria).
* **📋 Entregables (List View):** Vista jerárquica de todos los Elementos de Configuración de Software (ECS) organizados por fases.
* **📅 Cronograma (Gantt / Timeline):** Visualización cronológica de fechas de inicio, hitos y fechas límite estimadas.
* **🔗 Trazabilidad (Matriz CU01):** Matriz tridimensional que conecta el Caso de Uso analizado con sus Requisitos (SRS), Arquitectura (SAD) y Código Fuente/BD.

### 3.2. Grupos Colapsables por Metodología
Las metodologías configurables en la plataforma generan vistas agrupadas dinámicamente:
* **RUP (Rational Unified Process):**
  * `▼ Fase Inicio` (SRS, Caso de Negocio, Alcance)
  * `▼ Fase Elaboración` (SAD, Modelo de Dominio, Arquitectura Base)
  * `▼ Fase Construcción` (Código Fuente, Componentes, Casos de Prueba)
  * `▼ Fase Transición` (Manuales de Despliegue, Pruebas de Aceptación)
* **SCRUM (Ágil):**
  * `▼ Product Backlog & Historias de Usuario`
  * `▼ Sprint 1: Autenticación y Fundaciones`
  * `▼ Sprint 2: Core del Sistema y Reglas de Negocio`
  * `▼ Sprint 3: Integraciones y Entrega`
* **CASCADA (Secuencial Clásico):**
  * `▼ Requisitos` → `▼ Análisis y Diseño` → `▼ Implementación` → `▼ Pruebas`

### 3.3. Filas Compactas de Datos (*Data Grid* de 36px)
* Se eliminan las tarjetas cuadradas voluminosas. Cada elemento pasa a ser una fila esbelta de 36px a 40px con tipografía de 12px/13px.
* Identificadores de configuración en fuente monoespaciada (`font-mono font-bold text-xs`), facilitando la lectura para ingenieros y auditores.
* Badges de estado discretos (puntos de color de 6px y etiquetas suaves de 10px):
  * `Verde`: Aprobada / Aceptada.
  * `Ámbar`: Pendiente de Aceptación / En Evaluación.
  * `Rojo / Rosa`: Rechazada / Bloqueo Activo.

### 3.4. Panel Lateral Deslizable (*Slide-over Drawer*)
* Al hacer clic en cualquier entregable o solicitud de cambio, los detalles se abren en un panel lateral derecho limpio sin perder el contexto de la lista principal, evitando recargas completas de pantalla.

---

## 4. Alineación con la Rúbrica de Evaluación Académica

| Criterio de Evaluación | Puntos | Implementación en la Plataforma |
|---|---|---|
| **Configuración del Proyecto** | **8 Pts** | • Soporte de metodologías (RUP, SCRUM, CASCADA).<br>• Generación automática de etapas y entregables estándar.<br>• Calendario de inicio y fin.<br>• **Handshake Asíncrono:** Botones obligatorios de Aceptar/Rechazar en la bandeja del usuario (no derivación directa). |
| **Gestión de Cambios (RFC)** | **8 Pts** | • Flujo secuencial guiado en 4 pasos.<br>• Vinculación obligatoria a la Actividad / Caso de Uso (`CU01`).<br>• Identificación del Requerimiento analizado (`RF-XX`).<br>• Selección de objetos de software afectados en cascada (`ecs_afectados_ids`). |
| **Informe Detallado** | **4 Pts** | • Matriz de Trazabilidad por Caso de Uso.<br>• Conexión visual `CU01` → SRS → SAD → Código/BD.<br>• Historial de versiones y estado formal de dictamen con acta de impresión. |
| **Total** | **20 / 20** | **Plataforma completa, trazable y validada.** |

---

## 5. Próximos Pasos de Implementación Visual

1. **Refactorización del Dashboard:** Reemplazar el layout vertical por el componente `ClickUpWorkspace` con pestañas superiores fijas.
2. **Componente Data Grid:** Implementar la tabla de entregables colapsable con agrupaciones por fase.
3. **Integración del Drawer Lateral:** Modal de lectura rápida para entregables sin abandonar la vista activa.
