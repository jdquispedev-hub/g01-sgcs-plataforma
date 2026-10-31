---
name: database-prisma-guidelines
description: >-
  Estándares de modelado, transacciones ACID, integridad referencial,
  consultas eficientes e inmutabilidad en PostgreSQL con Prisma ORM.
---

# Database & Prisma ORM Guidelines

Este skill instruye al agente sobre cómo realizar consultas, manejar relaciones y garantizar la inmutabilidad de datos en PostgreSQL con Prisma ORM.

---

## 1. Reglas de Inmutabilidad de Datos (RF-09, RF-10, RNF-10)

Existen entidades críticas que **NUNCA deben modificarse ni eliminarse**:

1. **`lineas_base` y `linea_base_versiones`:**
   - Una vez creada una línea base, sus versiones asociadas quedan congeladas.
   - Cualquier cambio en un ECS requiere generar una **NUEVA línea base**.
2. **`auditoria_logs`:**
   - Esta tabla es exclusivamente de tipo *append-only* (solo inserciones).
   - Prohibido crear endpoints o queries con `prisma.auditoriaLog.update()` o `delete()`.

---

## 2. Transacciones ACID Obligatorias (RNF-08)

Siempre que una operación modifique más de una tabla o cambie estados críticos (ej. resolución de RFCs, aprobación de versiones o creación de líneas base), **debe envolverse en `prisma.$transaction()`**:

```typescript
export async function aprobarVersionConAuditoria(
  versionId: string, 
  aprobadorId: string,
  userId: string,
  ip: string
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Actualizar estado de la versión
    const version = await tx.versionEcs.update({
      where: { id: versionId },
      data: {
        estado: 'APROBADA',
        aprobador_id: aprobadorId,
        fecha_aprobacion: new Date(),
      },
    });

    // 2. Registrar auditoría automática (RNF-10)
    await tx.auditoriaLog.create({
      data: {
        usuario_id: userId,
        accion: 'APROBAR_VERSION',
        entidad: 'VERSION_ECS',
        entidad_id: version.id,
        datos_nuevos: { estado: 'APROBADA', fecha: new Date() },
        ip_address: ip,
      },
    });

    return version;
  });
}
```

---

## 3. Optimización de Consultas para Cumplir RNF-04 (< 3 segundos)

1. **Paginación Obligatoria:**
   - En listados de ECS y auditorías, usar siempre `take: limit` y `skip: offset`.
2. **Selección Selectiva (`select`):**
   - Nunca traer campos pesados que no se usen. Excluir explícitamente `password_hash`.
3. **Uso de Índices Existentes:**
   - Filtrar usando columnas indexadas: `codigo`, `nombre`, `tipo`, `estado`, `organizacion_id`.
