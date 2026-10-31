# Reglas Globales del Proyecto SGCS (Sistema de Gestión de Configuración de Software)

Estas reglas aplican para todo desarrollo, refactorización o verificación en este repositorio.

---

## 1. Convención de Commits (Conventional Commits)
Cada commit debe ser atómico, descriptivo y seguir el estándar internacional:
* `feat:` Nueva funcionalidad o página.
* `fix:` Corrección de bugs o errores de compilación.
* `docs:` Cambios o adiciones en documentación.
* `refactor:` Mejoras de código sin alterar comportamiento.
* `test:` Pruebas unitarias o de integración.
* `chore:` Mantenimiento de paquetes o configuraciones.

## 2. Validación de Seguridad y No Funcionales
Antes de dar por completada una tarea:
1. **RNF-01:** Verificar que ninguna contraseña ni dato sensible quede expuesto en texto plano o logs.
2. **RNF-02:** Verificar que los endpoints y páginas privadas requieran autenticación y rol válido en servidor.
3. **RNF-06:** Comprobar adaptabilidad en pantallas móviles (360px) y escritorio (1366px).
4. **RNF-10:** Garantizar que toda acción crítica genere su registro en `auditoria_logs`.
5. **RNF-12:** Asegurar que los mensajes de error retornados a la UI sean claros y no expongan rutas ni errores SQL.

## 3. Skills del Repositorio
Consulta las especificaciones detalladas en:
* `.agents/skills/sgcs-core/SKILL.md` (Filosofía anti-teléfono descompuesto y matriz RNF)
* `.agents/skills/nextjs-fullstack/SKILL.md` (Patrones Next.js, Zod y Tailwind)
* `.agents/skills/database-prisma/SKILL.md` (Transacciones ACID e inmutabilidad)
