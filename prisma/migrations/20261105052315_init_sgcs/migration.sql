-- CreateEnum
CREATE TYPE "RubroIndustria" AS ENUM ('SOFTWARE', 'VETERINARIA', 'CONSTRUCCION', 'OTRO');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('SUPERADMIN', 'ADMINISTRADOR', 'APROBADOR', 'SOLICITANTE');

-- CreateEnum
CREATE TYPE "EstadoProyecto" AS ENUM ('DIAGNOSTICO', 'PLANIFICACION', 'EN_EJECUCION', 'CONGELADO', 'CERRADO');

-- CreateEnum
CREATE TYPE "TipoEcs" AS ENUM ('DOCUMENTO', 'CODIGO_FUENTE', 'DISENO', 'BASE_DATOS', 'CASO_PRUEBA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoEcs" AS ENUM ('ACTIVO', 'DEPRECADO');

-- CreateEnum
CREATE TYPE "EstadoVersion" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "EstadoLineaBase" AS ENUM ('VIGENTE', 'OBSOLETA');

-- CreateEnum
CREATE TYPE "EstadoCambio" AS ENUM ('PENDIENTE_EVALUACION', 'EN_EVALUACION', 'APROBADA', 'RECHAZADA', 'IMPLEMENTADA');

-- CreateEnum
CREATE TYPE "NivelImpacto" AS ENUM ('BAJO', 'MEDIO', 'ALTO', 'CRITICO');

-- CreateEnum
CREATE TYPE "TipoReunion" AS ENUM ('CLIENTE', 'EQUIPO_INTERNO', 'COMITE_CAMBIOS');

-- CreateTable
CREATE TABLE "organizaciones" (
    "id" TEXT NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "rubro" "RubroIndustria" NOT NULL DEFAULT 'SOFTWARE',
    "configuracion_terminologia" JSONB NOT NULL DEFAULT '{}',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "organizacion_id" TEXT NOT NULL,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'SOLICITANTE',
    "cargo" VARCHAR(100),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proyectos_casos" (
    "id" TEXT NOT NULL,
    "organizacion_id" TEXT NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "cliente_nombre" VARCHAR(150) NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_estimada_fin" DATE,
    "estado" "EstadoProyecto" NOT NULL DEFAULT 'DIAGNOSTICO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proyectos_casos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecs" (
    "id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "tipo" "TipoEcs" NOT NULL DEFAULT 'DOCUMENTO',
    "descripcion" TEXT,
    "ubicacion" VARCHAR(500) NOT NULL,
    "responsable_id" TEXT NOT NULL,
    "atributos_personalizados" JSONB NOT NULL DEFAULT '{}',
    "estado" "EstadoEcs" NOT NULL DEFAULT 'ACTIVO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ecs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "versiones_ecs" (
    "id" TEXT NOT NULL,
    "ecs_id" TEXT NOT NULL,
    "numero_version" VARCHAR(30) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "archivo_url" VARCHAR(500),
    "estado" "EstadoVersion" NOT NULL DEFAULT 'PENDIENTE',
    "autor_id" TEXT NOT NULL,
    "aprobador_id" TEXT,
    "fecha_aprobacion" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "versiones_ecs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lineas_base" (
    "id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "autor_id" TEXT NOT NULL,
    "estado" "EstadoLineaBase" NOT NULL DEFAULT 'VIGENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lineas_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linea_base_versiones" (
    "linea_base_id" TEXT NOT NULL,
    "version_ecs_id" TEXT NOT NULL,

    CONSTRAINT "linea_base_versiones_pkey" PRIMARY KEY ("linea_base_id","version_ecs_id")
);

-- CreateTable
CREATE TABLE "solicitudes_cambio" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "ecs_id" TEXT NOT NULL,
    "version_base_id" TEXT NOT NULL,
    "version_resultante_id" TEXT,
    "descripcion" TEXT NOT NULL,
    "justificacion" TEXT NOT NULL,
    "estado" "EstadoCambio" NOT NULL DEFAULT 'PENDIENTE_EVALUACION',
    "solicitante_id" TEXT NOT NULL,
    "resolutor_id" TEXT,
    "resolucion_justificacion" TEXT,
    "fecha_resolucion" TIMESTAMP(3),
    "fecha_implementacion" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitudes_cambio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluaciones_cambio" (
    "id" TEXT NOT NULL,
    "solicitud_id" TEXT NOT NULL,
    "impacto" "NivelImpacto" NOT NULL DEFAULT 'MEDIO',
    "observaciones" TEXT NOT NULL,
    "evaluador_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluaciones_cambio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambio_ecs_afectados" (
    "solicitud_id" TEXT NOT NULL,
    "ecs_id" TEXT NOT NULL,

    CONSTRAINT "cambio_ecs_afectados_pkey" PRIMARY KEY ("solicitud_id","ecs_id")
);

-- CreateTable
CREATE TABLE "reportes_diarios" (
    "id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resumen_actividades" TEXT NOT NULL,
    "metricas_avance" JSONB NOT NULL DEFAULT '{}',
    "tiene_bloqueo" BOOLEAN NOT NULL DEFAULT false,
    "detalle_bloqueo" TEXT,
    "evidencias_urls" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reportes_diarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_logs" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" TEXT,
    "accion" VARCHAR(100) NOT NULL,
    "entidad" VARCHAR(50) NOT NULL,
    "entidad_id" VARCHAR(100) NOT NULL,
    "datos_anteriores" JSONB,
    "datos_nuevos" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reuniones_proyecto" (
    "id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "convocante_id" TEXT,
    "titulo" VARCHAR(200) NOT NULL,
    "tipo" "TipoReunion" NOT NULL DEFAULT 'CLIENTE',
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hora" VARCHAR(10) DEFAULT '10:00',
    "participantes" TEXT NOT NULL,
    "temas_tratados" TEXT NOT NULL,
    "acuerdos" TEXT NOT NULL,
    "proximo_paso" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reuniones_proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_organizacion_id_email_key" ON "usuarios"("organizacion_id", "email");

-- CreateIndex
CREATE INDEX "proyectos_casos_organizacion_id_estado_idx" ON "proyectos_casos"("organizacion_id", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "proyectos_casos_organizacion_id_codigo_key" ON "proyectos_casos"("organizacion_id", "codigo");

-- CreateIndex
CREATE INDEX "ecs_codigo_idx" ON "ecs"("codigo");

-- CreateIndex
CREATE INDEX "ecs_nombre_idx" ON "ecs"("nombre");

-- CreateIndex
CREATE INDEX "ecs_tipo_idx" ON "ecs"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "ecs_proyecto_id_codigo_key" ON "ecs"("proyecto_id", "codigo");

-- CreateIndex
CREATE INDEX "versiones_ecs_ecs_id_estado_idx" ON "versiones_ecs"("ecs_id", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "versiones_ecs_ecs_id_numero_version_key" ON "versiones_ecs"("ecs_id", "numero_version");

-- CreateIndex
CREATE INDEX "lineas_base_codigo_idx" ON "lineas_base"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "lineas_base_proyecto_id_codigo_key" ON "lineas_base"("proyecto_id", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_cambio_codigo_key" ON "solicitudes_cambio"("codigo");

-- CreateIndex
CREATE INDEX "solicitudes_cambio_codigo_idx" ON "solicitudes_cambio"("codigo");

-- CreateIndex
CREATE INDEX "solicitudes_cambio_estado_idx" ON "solicitudes_cambio"("estado");

-- CreateIndex
CREATE INDEX "solicitudes_cambio_created_at_idx" ON "solicitudes_cambio"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "evaluaciones_cambio_solicitud_id_key" ON "evaluaciones_cambio"("solicitud_id");

-- CreateIndex
CREATE INDEX "reportes_diarios_proyecto_id_fecha_idx" ON "reportes_diarios"("proyecto_id", "fecha");

-- CreateIndex
CREATE INDEX "reportes_diarios_tiene_bloqueo_idx" ON "reportes_diarios"("tiene_bloqueo");

-- CreateIndex
CREATE INDEX "auditoria_logs_entidad_entidad_id_idx" ON "auditoria_logs"("entidad", "entidad_id");

-- CreateIndex
CREATE INDEX "auditoria_logs_created_at_idx" ON "auditoria_logs"("created_at");

-- CreateIndex
CREATE INDEX "reuniones_proyecto_proyecto_id_fecha_idx" ON "reuniones_proyecto"("proyecto_id", "fecha");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_organizacion_id_fkey" FOREIGN KEY ("organizacion_id") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos_casos" ADD CONSTRAINT "proyectos_casos_organizacion_id_fkey" FOREIGN KEY ("organizacion_id") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecs" ADD CONSTRAINT "ecs_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos_casos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecs" ADD CONSTRAINT "ecs_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "versiones_ecs" ADD CONSTRAINT "versiones_ecs_ecs_id_fkey" FOREIGN KEY ("ecs_id") REFERENCES "ecs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "versiones_ecs" ADD CONSTRAINT "versiones_ecs_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "versiones_ecs" ADD CONSTRAINT "versiones_ecs_aprobador_id_fkey" FOREIGN KEY ("aprobador_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineas_base" ADD CONSTRAINT "lineas_base_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos_casos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineas_base" ADD CONSTRAINT "lineas_base_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linea_base_versiones" ADD CONSTRAINT "linea_base_versiones_linea_base_id_fkey" FOREIGN KEY ("linea_base_id") REFERENCES "lineas_base"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linea_base_versiones" ADD CONSTRAINT "linea_base_versiones_version_ecs_id_fkey" FOREIGN KEY ("version_ecs_id") REFERENCES "versiones_ecs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_cambio" ADD CONSTRAINT "solicitudes_cambio_ecs_id_fkey" FOREIGN KEY ("ecs_id") REFERENCES "ecs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_cambio" ADD CONSTRAINT "solicitudes_cambio_version_base_id_fkey" FOREIGN KEY ("version_base_id") REFERENCES "versiones_ecs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_cambio" ADD CONSTRAINT "solicitudes_cambio_version_resultante_id_fkey" FOREIGN KEY ("version_resultante_id") REFERENCES "versiones_ecs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_cambio" ADD CONSTRAINT "solicitudes_cambio_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_cambio" ADD CONSTRAINT "solicitudes_cambio_resolutor_id_fkey" FOREIGN KEY ("resolutor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_cambio" ADD CONSTRAINT "evaluaciones_cambio_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitudes_cambio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_cambio" ADD CONSTRAINT "evaluaciones_cambio_evaluador_id_fkey" FOREIGN KEY ("evaluador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambio_ecs_afectados" ADD CONSTRAINT "cambio_ecs_afectados_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitudes_cambio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambio_ecs_afectados" ADD CONSTRAINT "cambio_ecs_afectados_ecs_id_fkey" FOREIGN KEY ("ecs_id") REFERENCES "ecs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes_diarios" ADD CONSTRAINT "reportes_diarios_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos_casos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes_diarios" ADD CONSTRAINT "reportes_diarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_logs" ADD CONSTRAINT "auditoria_logs_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reuniones_proyecto" ADD CONSTRAINT "reuniones_proyecto_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos_casos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reuniones_proyecto" ADD CONSTRAINT "reuniones_proyecto_convocante_id_fkey" FOREIGN KEY ("convocante_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
