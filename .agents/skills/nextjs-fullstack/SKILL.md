---
name: nextjs-fullstack-dev
description: >-
  Guía de desarrollo para Next.js 14 (App Router), Server Actions, Route Handlers,
  Tailwind CSS, validación con Zod y componentes accesibles.
---

# Next.js Fullstack Engineering Standards

Este skill define la estructura de carpetas, convenciones de nombres y patrones de diseño para el código TypeScript en Next.js.

---

## 1. Estructura de Directorios

```plaintext
src/
├── app/                          # App Router (Páginas y API Routes)
│   ├── (auth)/                   # Grupo de rutas de autenticación
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Grupo de rutas privadas con sidebar
│   │   ├── superadmin/page.tsx   # Panel SuperAdmin
│   │   ├── dashboard/page.tsx    # Panel Administrador de Empresa
│   │   ├── ecs/page.tsx          # Gestión de Elementos de Configuración
│   │   ├── lineas-base/page.tsx  # Gestión de Líneas Base
│   │   ├── cambios/page.tsx      # Gestión de Solicitudes de Cambio (RFC)
│   │   ├── bitacora/page.tsx     # Reportes diarios (Mobile-First)
│   │   ├── trazabilidad/page.tsx # Matriz de relaciones
│   │   └── layout.tsx            # Sidebar y Navbar unificados
│   ├── api/                      # Route Handlers (REST endpoints)
│   │   ├── auth/                 # login, logout, me
│   │   ├── ecs/                  # CRUD y versiones
│   │   ├── lineas-base/          # Creación inmutable
│   │   ├── cambios/              # Flujo RFC
│   │   └── reportes-diarios/     # Bitácora y alertas
│   ├── layout.tsx                # Root layout con fuentes y metadatos
│   ├── page.tsx                  # Landing informativa
│   └── globals.css               # Directivas de Tailwind CSS
├── components/                   # Componentes UI reutilizables
│   ├── ui/                       # Botones, inputs, badges, cards, diálogos
│   ├── forms/                    # Formularios vinculados a Zod
│   ├── layout/                   # Sidebar, Navbar, MobileNav, Breadcrumbs
│   └── shared/                   # Tablas con filtros, estados vacíos, spinners
├── lib/                          # Utilidades centrales
│   ├── prisma.ts                 # Cliente singleton de Prisma
│   ├── auth.ts                   # Helpers de JWT y Bcrypt
│   ├── audit.ts                  # Helper para registrar auditoría (RNF-10)
│   └── utils.ts                  # Helper cn() para Tailwind
├── types/                        # Definiciones TypeScript y DTOs
└── middleware.ts                 # Interceptor global de seguridad y RBAC
```

---

## 2. Convenciones de Código

### A. Tipado Estricto (TypeScript)
* Prohibido el uso de `any`. Definir siempre interfaces o tipos explícitos.
* Compartir los esquemas de validación Zod entre el cliente y el servidor.

### B. Route Handlers Estandarizados (`src/app/api/.../route.ts`)
Toda respuesta de la API debe devolver una estructura uniforme:

```typescript
// Respuesta exitosa
return NextResponse.json({
  success: true,
  data: resultado,
});

// Respuesta con error (RNF-12)
return NextResponse.json(
  {
    success: false,
    message: 'Mensaje entendible para el usuario',
    errors?: validacionesZod,
  },
  { status: statusCode }
);
```

### C. Formularios Reactivos (RNF-05)
* Usar `react-hook-form` con `@hookform/resolvers/zod`.
* Los campos obligatorios deben tener un asterisco rojo (`<span className="text-red-500">*</span>`).
* Los mensajes de error de validación deben aparecer inmediatamente debajo del input correspondiente.

### D. Componentes Responsive (RNF-06)
* Utilizar enfoque *Mobile-First*:
  - Móvil (< 768px): Botones grandes (mínimo 44px de altura táctil), tarjetas apiladas, menús colapsables.
  - Tablet (768px - 1024px): Grid de 2 columnas.
  - Escritorio (> 1024px): Tablas completas con scroll horizontal y sidebar fijo.
