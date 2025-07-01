SET NAMES utf8mb4;

-- Puedes descomentar la siguiente línea si quieres eliminar la base de datos antes de crearla (¡cuidado, borra todos los datos!)
-- DROP DATABASE IF EXISTS `db_salud_mental`;

CREATE DATABASE IF NOT EXISTS `db_salud_mental`
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

USE `db_salud_mental`;

-- 1. CREACIÓN DE TABLAS

CREATE TABLE `Personas` (
    `persona_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL UNIQUE,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `documento_identidad` VARCHAR(50) NOT NULL UNIQUE,
    `fecha_nacimiento` DATE NOT NULL,
    `genero` ENUM('Masculino', 'Femenino', 'No binario', 'Otro', 'Prefiero no decir') NOT NULL,
    `nacionalidad` VARCHAR(100) NULL,
    `ocupacion` VARCHAR(255) NULL,
    `estado_civil` ENUM('Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión Libre') NULL,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `usuario_creacion_id` BIGINT UNSIGNED NOT NULL,
    `ultima_modificacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `usuario_modificacion_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`persona_id`),
    UNIQUE INDEX `idx_uuid` (`uuid`),
    UNIQUE INDEX `idx_documento_identidad` (`documento_identidad`),
    INDEX `idx_nombre_apellido` (`apellido`, `nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Direcciones` (
    `direccion_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `persona_id` BIGINT UNSIGNED NOT NULL UNIQUE,
    `calle` VARCHAR(255) NOT NULL,
    `numero` VARCHAR(50) NOT NULL,
    `piso` VARCHAR(50) NULL,
    `departamento` VARCHAR(50) NULL,
    `ciudad` VARCHAR(100) NOT NULL,
    `provincia` VARCHAR(100) NOT NULL,
    `codigo_postal` VARCHAR(20) NULL,
    `pais` VARCHAR(100) NOT NULL,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ultima_modificacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`direccion_id`),
    UNIQUE INDEX `idx_direccion_persona_id` (`persona_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Contactos` (
    `contacto_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `persona_id` BIGINT UNSIGNED NOT NULL UNIQUE,
    `telefono_principal` VARCHAR(50) NULL,
    `telefono_alternativo` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL UNIQUE,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ultima_modificacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`contacto_id`),
    UNIQUE INDEX `idx_contacto_persona_id` (`persona_id`),
    UNIQUE INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Pacientes` (
    `paciente_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `persona_id` BIGINT UNSIGNED NOT NULL UNIQUE,
    `fecha_primera_consulta` DATE NULL,
    `riesgo_actual` ENUM('Bajo', 'Moderado', 'Alto', 'Crítico') NOT NULL DEFAULT 'Bajo',
    `observaciones_generales` TEXT NULL,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `usuario_creacion_id` BIGINT UNSIGNED NOT NULL,
    `ultima_modificacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `usuario_modificacion_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`paciente_id`),
    UNIQUE INDEX `idx_paciente_persona_id` (`persona_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Solicitantes` (
    `solicitante_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `persona_id` BIGINT UNSIGNED NOT NULL UNIQUE,
    `es_tutor_legal` BOOLEAN NOT NULL DEFAULT FALSE,
    `fecha_establecimiento_tutela` DATE NULL,
    `observaciones_solicitante` TEXT NULL,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `usuario_creacion_id` BIGINT UNSIGNED NOT NULL,
    `ultima_modificacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `usuario_modificacion_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`solicitante_id`),
    UNIQUE INDEX `idx_solicitante_persona_id` (`persona_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Profesionales` (
    `profesional_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `persona_id` BIGINT UNSIGNED NOT NULL UNIQUE,
    `numero_matricula` VARCHAR(100) NOT NULL UNIQUE,
    `sobre_mi` TEXT NULL,
    `idiomas` VARCHAR(255) NULL,
    `disponibilidad_horaria` TEXT NULL,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `usuario_creacion_id` BIGINT UNSIGNED NOT NULL,
    `ultima_modificacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `usuario_modificacion_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`profesional_id`),
    UNIQUE INDEX `idx_profesional_persona_id` (`persona_id`),
    UNIQUE INDEX `idx_numero_matricula` (`numero_matricula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLAS DE ROLES / UNIÓN

CREATE TABLE `Paciente_Solicitante` (
    `paciente_id` BIGINT UNSIGNED NOT NULL,
    `solicitante_id` BIGINT UNSIGNED NOT NULL,
    `parentesco_especifico` VARCHAR(100) NULL,
    `es_solicitante_principal` BOOLEAN NOT NULL DEFAULT FALSE,
    `fecha_establecimiento_relacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_fin_relacion` DATETIME NULL,
    `autorizacion_tratamiento` BOOLEAN NOT NULL DEFAULT FALSE,
    `observaciones_relacion` TEXT NULL,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ultima_modificacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`paciente_id`, `solicitante_id`),
    INDEX `idx_solicitante_id_ps` (`solicitante_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Profesional_Especialidad` (
    `profesional_id` BIGINT UNSIGNED NOT NULL,
    `especialidad_id` SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY (`profesional_id`, `especialidad_id`),
    INDEX `idx_especialidad_id_pe` (`especialidad_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLAS DE CATÁLOGOS

CREATE TABLE `Especialidades` (
    `especialidad_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre_especialidad` VARCHAR(100) NOT NULL UNIQUE,
    `descripcion` TEXT NULL,
    PRIMARY KEY (`especialidad_id`),
    UNIQUE INDEX `idx_nombre_especialidad` (`nombre_especialidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Diagnosticos` (
    `diagnostico_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigo_cie` VARCHAR(20) NOT NULL UNIQUE,
    `nombre` VARCHAR(255) NOT NULL UNIQUE,
    `descripcion` TEXT NULL,
    PRIMARY KEY (`diagnostico_id`),
    UNIQUE INDEX `idx_codigo_cie` (`codigo_cie`),
    UNIQUE INDEX `idx_nombre_diagnostico` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Medicamentos` (
    `medicamento_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre_generico` VARCHAR(255) NOT NULL UNIQUE,
    `nombre_comercial` VARCHAR(255) NULL,
    `descripcion` TEXT NULL,
    PRIMARY KEY (`medicamento_id`),
    UNIQUE INDEX `idx_nombre_generico_medicamento` (`nombre_generico`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `TiposConsentimiento` (
    `tipo_consentimiento_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre_tipo` VARCHAR(255) NOT NULL UNIQUE,
    `descripcion` TEXT NULL,
    PRIMARY KEY (`tipo_consentimiento_id`),
    UNIQUE INDEX `idx_nombre_tipo_consentimiento` (`nombre_tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLAS DE SEGUIMIENTO / HISTORIAL

CREATE TABLE `EducacionProfesional` (
    `educacion_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `profesional_id` BIGINT UNSIGNED NOT NULL,
    `institucion` VARCHAR(255) NOT NULL,
    `titulo_obtenido` VARCHAR(255) NOT NULL,
    `fecha_inicio` DATE NULL,
    `fecha_fin` DATE NULL,
    `observaciones` TEXT NULL,
    PRIMARY KEY (`educacion_id`),
    INDEX `idx_educacion_profesional_id` (`profesional_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ExperienciasLaborales` (
    `experiencia_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `profesional_id` BIGINT UNSIGNED NOT NULL,
    `empresa_institucion` VARCHAR(255) NOT NULL,
    `puesto` VARCHAR(255) NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NULL,
    `descripcion_logros` TEXT NULL,
    PRIMARY KEY (`experiencia_id`),
    INDEX `idx_experiencia_profesional_id` (`profesional_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `CertificacionesAcreditaciones` (
    `certificacion_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `profesional_id` BIGINT UNSIGNED NOT NULL,
    `nombre_certificacion` VARCHAR(255) NOT NULL,
    `entidad_emisora` VARCHAR(255) NOT NULL,
    `fecha_emision` DATE NOT NULL,
    `fecha_expiracion` DATE NULL,
    PRIMARY KEY (`certificacion_id`),
    INDEX `idx_certificacion_profesional_id` (`profesional_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ResenasProfesional` (
    `resena_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `profesional_id` BIGINT UNSIGNED NOT NULL,
    `persona_reseña_id` BIGINT UNSIGNED NULL,
    `puntuacion` TINYINT UNSIGNED NOT NULL,
    `comentario` TEXT NULL,
    `fecha_resena` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `aprobada` BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (`resena_id`),
    INDEX `idx_resena_profesional_id` (`profesional_id`),
    INDEX `idx_resena_persona_id` (`persona_reseña_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Paciente_Diagnostico` (
    `paciente_diagnostico_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `paciente_id` BIGINT UNSIGNED NOT NULL,
    `diagnostico_id` INT UNSIGNED NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NULL,
    `profesional_diagnostico_id` BIGINT UNSIGNED NULL,
    `razon_cambio_fin` TEXT NULL,
    `es_principal` BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (`paciente_diagnostico_id`),
    INDEX `idx_pd_paciente_id` (`paciente_id`),
    INDEX `idx_pd_diagnostico_id` (`diagnostico_id`),
    INDEX `idx_pd_profesional_id` (`profesional_diagnostico_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Paciente_Medicacion` (
    `paciente_medicacion_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `paciente_id` BIGINT UNSIGNED NOT NULL,
    `medicamento_id` INT UNSIGNED NOT NULL,
    `dosis` VARCHAR(100) NOT NULL,
    `frecuencia` VARCHAR(100) NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NULL,
    `profesional_prescriptor_id` BIGINT UNSIGNED NULL,
    `motivo_fin` TEXT NULL,
    PRIMARY KEY (`paciente_medicacion_id`),
    INDEX `idx_pm_paciente_id` (`paciente_id`),
    INDEX `idx_pm_medicamento_id` (`medicamento_id`),
    INDEX `idx_pm_profesional_id` (`profesional_prescriptor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Sesiones` (
    `sesion_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `paciente_id` BIGINT UNSIGNED NOT NULL,
    `fecha_sesion` DATETIME NOT NULL,
    `tipo_sesion` ENUM('Individual', 'Familiar', 'Grupal', 'Pareja', 'Online', 'Presencial', 'Domiciliaria') NOT NULL,
    `motivo_consulta` TEXT NULL,
    `estado_animo_reportado` TEXT NULL,
    `temas_tratados` TEXT NULL,
    `observaciones` TEXT NULL,
    `proxima_sesion_fecha` DATETIME NULL,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `usuario_creacion_id` BIGINT UNSIGNED NOT NULL,
    `ultima_modificacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `usuario_modificacion_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`sesion_id`),
    INDEX `idx_sesion_paciente_id` (`paciente_id`),
    INDEX `idx_fecha_sesion` (`fecha_sesion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Sesion_Profesional` (
    `sesion_id` BIGINT UNSIGNED NOT NULL,
    `profesional_id` BIGINT UNSIGNED NOT NULL,
    `rol_en_sesion` VARCHAR(100) NULL,
    `es_principal` BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (`sesion_id`, `profesional_id`),
    INDEX `idx_sp_profesional_id` (`profesional_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ObjetivosTerapeuticos` (
    `objetivo_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `paciente_id` BIGINT UNSIGNED NOT NULL,
    `descripcion` TEXT NOT NULL,
    `estado` ENUM('Activo', 'Completado', 'Suspendido', 'Revisado') NOT NULL DEFAULT 'Activo',
    `fecha_establecimiento` DATE NOT NULL,
    `fecha_revision` DATE NULL,
    `profesional_id` BIGINT UNSIGNED NULL,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ultima_modificacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`objetivo_id`),
    INDEX `idx_objetivo_paciente_id` (`paciente_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Consentimientos` (
    `consentimiento_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `solicitante_id` BIGINT UNSIGNED NOT NULL,
    `paciente_id` BIGINT UNSIGNED NULL,
    `tipo_consentimiento_id` SMALLINT UNSIGNED NOT NULL,
    `fecha_otorgamiento` DATETIME NOT NULL,
    `fecha_revocacion` DATETIME NULL,
    `estado` ENUM('Activo', 'Revocado', 'Expirado') NOT NULL DEFAULT 'Activo',
    `documento_url` VARCHAR(512) NULL,
    `observaciones` TEXT NULL,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `usuario_creacion_id` BIGINT UNSIGNED NOT NULL,
    `ultima_modificacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `usuario_modificacion_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`consentimiento_id`),
    INDEX `idx_consentimiento_solicitante_id` (`solicitante_id`),
    INDEX `idx_consentimiento_paciente_id` (`paciente_id`),
    INDEX `idx_consentimiento_tipo_id` (`tipo_consentimiento_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `InteraccionesSolicitante` (
    `interaccion_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `solicitante_id` BIGINT UNSIGNED NOT NULL,
    `profesional_id` BIGINT UNSIGNED NULL,
    `fecha_interaccion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `tipo_interaccion` ENUM('Llamada', 'Reunión', 'Email', 'Mensaje', 'Otro') NOT NULL,
    `motivo` TEXT NULL,
    `observaciones` TEXT NULL,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `usuario_creacion_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`interaccion_id`),
    INDEX `idx_interaccion_solicitante_id` (`solicitante_id`),
    INDEX `idx_interaccion_profesional_id` (`profesional_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `NotasAdicionales` (
    `nota_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `entidad_id` BIGINT UNSIGNED NOT NULL,
    `tipo_entidad` ENUM('Paciente', 'Profesional', 'Solicitante', 'Sesion') NOT NULL,
    `contenido` TEXT NOT NULL,
    `profesional_id` BIGINT UNSIGNED NULL,
    `fecha_nota` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `usuario_creacion_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`nota_id`),
    INDEX `idx_nota_entidad` (`entidad_id`, `tipo_entidad`),
    INDEX `idx_nota_profesional_id` (`profesional_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLAS DE SEGURIDAD / AUDITORÍA

CREATE TABLE `Usuarios` (
    `usuario_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `persona_id` BIGINT UNSIGNED NULL UNIQUE,
    `nombre_usuario` VARCHAR(100) NOT NULL UNIQUE,
    `contrasena_hash` VARCHAR(255) NOT NULL,
    `rol` ENUM('Admin', 'Profesional', 'Paciente', 'Solicitante', 'Recepcionista') NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT TRUE,
    `fecha_ultimo_login` DATETIME NULL,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ultima_modificacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`usuario_id`),
    UNIQUE INDEX `idx_nombre_usuario` (`nombre_usuario`),
    UNIQUE INDEX `idx_usuario_persona_id` (`persona_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `AuditLogs` (
    `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `fecha_evento` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `usuario_id` BIGINT UNSIGNED NULL,
    `tipo_evento` ENUM('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'ACCESS', 'ERROR', 'CUSTOM') NOT NULL,
    `tabla_afectada` VARCHAR(100) NULL,
    `registro_id_afectado` BIGINT UNSIGNED NULL,
    `campo_afectado` VARCHAR(255) NULL,
    `valor_antiguo` TEXT NULL,
    `valor_nuevo` TEXT NULL,
    `descripcion_evento` TEXT NULL,
    `direccion_ip` VARCHAR(45) NULL,
    PRIMARY KEY (`log_id`),
    INDEX `idx_audit_fecha` (`fecha_evento`),
    INDEX `idx_audit_usuario` (`usuario_id`),
    INDEX `idx_audit_tabla_registro` (`tabla_afectada`, `registro_id_afectado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. CONFIGURACIÓN DE CLAVES FORÁNEAS

ALTER TABLE `Personas`
    ADD CONSTRAINT `fk_personas_usuario_creacion` FOREIGN KEY (`usuario_creacion_id`) REFERENCES `Usuarios` (`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_personas_usuario_modificacion` FOREIGN KEY (`usuario_modificacion_id`) REFERENCES `Usuarios` (`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Direcciones`
    ADD CONSTRAINT `fk_direcciones_persona` FOREIGN KEY (`persona_id`) REFERENCES `Personas` (`persona_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Contactos`
    ADD CONSTRAINT `fk_contactos_persona` FOREIGN KEY (`persona_id`) REFERENCES `Personas` (`persona_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Pacientes`
    ADD CONSTRAINT `fk_pacientes_persona` FOREIGN KEY (`persona_id`) REFERENCES `Personas` (`persona_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_pacientes_usuario_creacion` FOREIGN KEY (`usuario_creacion_id`) REFERENCES `Usuarios` (`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_pacientes_usuario_modificacion` FOREIGN KEY (`usuario_modificacion_id`) REFERENCES `Usuarios` (`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Solicitantes`
    ADD CONSTRAINT `fk_solicitantes_persona` FOREIGN KEY (`persona_id`) REFERENCES `Personas` (`persona_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_solicitantes_usuario_creacion` FOREIGN KEY (`usuario_creacion_id`) REFERENCES `Usuarios` (`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_solicitantes_usuario_modificacion` FOREIGN KEY (`usuario_modificacion_id`) REFERENCES `Usuarios` (`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Profesionales`
    ADD CONSTRAINT `fk_profesionales_persona` FOREIGN KEY (`persona_id`) REFERENCES `Personas` (`persona_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_profesionales_usuario_creacion` FOREIGN KEY (`usuario_creacion_id`) REFERENCES `Usuarios` (`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_profesionales_usuario_modificacion` FOREIGN FOREIGN KEY (`usuario_modificacion_id`) REFERENCES `Usuarios` (`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Paciente_Solicitante`
    ADD CONSTRAINT `fk_ps_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `Pacientes` (`paciente_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_ps_solicitante` FOREIGN KEY (`solicitante_id`) REFERENCES `Solicitantes` (`solicitante_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Profesional_Especialidad`
    ADD CONSTRAINT `fk_pe_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `Profesionales` (`profesional_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_pe_especialidad` FOREIGN KEY (`especialidad_id`) REFERENCES `Especialidades` (`especialidad_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `EducacionProfesional`
    ADD CONSTRAINT `fk_ep_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `Profesionales` (`profesional_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ExperienciasLaborales`
    ADD CONSTRAINT `fk_el_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `Profesionales` (`profesional_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `CertificacionesAcreditaciones`
    ADD CONSTRAINT `fk_ca_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `Profesionales` (`profesional_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ResenasProfesional`
    ADD CONSTRAINT `fk_rp_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `Profesionales` (`profesional_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_rp_persona_reseña` FOREIGN KEY (`persona_reseña_id`) REFERENCES `Personas` (`persona_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Paciente_Diagnostico`
    ADD CONSTRAINT `fk_pd_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `Pacientes` (`paciente_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_pd_diagnostico` FOREIGN KEY (`diagnostico_id`) REFERENCES `Diagnosticos` (`diagnostico_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_pd_profesional_diagnostico` FOREIGN KEY (`profesional_diagnostico_id`) REFERENCES `Profesionales` (`profesional_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Paciente_Medicacion`
    ADD CONSTRAINT `fk_pm_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `Pacientes` (`paciente_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_pm_medicamento` FOREIGN KEY (`medicamento_id`) REFERENCES `Medicamentos` (`medicamento_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_pm_profesional_prescriptor` FOREIGN KEY (`profesional_prescriptor_id`) REFERENCES `Profesionales` (`profesional_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Sesiones`
    ADD CONSTRAINT `fk_sesiones_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `Pacientes` (`paciente_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_sesiones_usuario_creacion` FOREIGN KEY (`usuario_creacion_id`) REFERENCES `Usuarios` (`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_sesiones_usuario_modificacion` FOREIGN KEY (`usuario_modificacion_id`) REFERENCES `Usuarios` (`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Sesion_Profesional`
    ADD CONSTRAINT `fk_sp_sesion` FOREIGN KEY (`sesion_id`) REFERENCES `Sesiones` (`sesion_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_sp_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `Profesionales` (`profesional_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ObjetivosTerapeuticos`
    ADD CONSTRAINT `fk_ot_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `Pacientes` (`paciente_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_ot_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `Profesionales` (`profesional_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Consentimientos`
    ADD CONSTRAINT `fk_consentimientos_solicitante` FOREIGN KEY (`solicitante_id`) REFERENCES `Solicitantes` (`solicitante_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_consentimientos_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `Pacientes` (`paciente_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_consentimientos_tipo_consentimiento` FOREIGN KEY (`tipo_consentimiento_id`) REFERENCES `TiposConsentimiento` (`tipo_consentimiento_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_consentimientos_usuario_creacion` FOREIGN KEY (`usuario_creacion_id`) REFERENCES `Usuarios` (`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_consentimientos_usuario_modificacion` FOREIGN KEY (`usuario_modificacion_id`) REFERENCES `Usuarios` (`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `InteraccionesSolicitante`
    ADD CONSTRAINT `fk_is_solicitante` FOREIGN KEY (`solicitante_id`) REFERENCES `Solicitantes` (`solicitante_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_is_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `Profesionales` (`profesional_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_is_usuario_creacion` FOREIGN KEY (`usuario_creacion_id`) REFERENCES `Usuarios` (`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `NotasAdicionales`
    ADD CONSTRAINT `fk_na_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `Profesionales` (`profesional_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_na_usuario_creacion` FOREIGN KEY (`usuario_creacion_id`) REFERENCES `Usuarios` (`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `AuditLogs`
    ADD CONSTRAINT `fk_al_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `Usuarios` (`usuario_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Usuarios`
    ADD CONSTRAINT `fk_usuarios_persona` FOREIGN KEY (`persona_id`) REFERENCES `Personas` (`persona_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. INSERCIÓN DE DATOS DE EJEMPLO

-- 7.1. Insertar un Usuario Administrador (necesario para auditoría de creación)
INSERT INTO `Usuarios` (`nombre_usuario`, `contrasena_hash`, `rol`, `activo`) VALUES
('admin.sistema', 'hashsegurodeladmin', 'Admin', TRUE);

-- Recuperar el ID del usuario recién creado para usarlo en otras inserciones
SET @admin_usuario_id = LAST_INSERT_ID();

-- 7.2. Profesional con todos los datos

-- 7.2.1. Persona para el Profesional
INSERT INTO `Personas` (`uuid`, `nombre`, `apellido`, `documento_identidad`, `fecha_nacimiento`, `genero`, `nacionalidad`, `ocupacion`, `estado_civil`, `usuario_creacion_id`, `usuario_modificacion_id`) VALUES
(UUID(), 'Ana', 'García Pérez', '12345678A', '1980-05-15', 'Femenino', 'Española', 'Psicóloga Clínica', 'Casado/a', @admin_usuario_id, @admin_usuario_id);

SET @persona_profesional_id = LAST_INSERT_ID();

-- 7.2.2. Usuario para el Profesional
INSERT INTO `Usuarios` (`persona_id`, `nombre_usuario`, `contrasena_hash`, `rol`, `activo`) VALUES
(@persona_profesional_id, 'ana.garcia', 'hashsegurodeana', 'Profesional', TRUE);

SET @usuario_profesional_id = LAST_INSERT_ID();

-- Actualizar los usuarios de creación/modificación en la tabla Personas del profesional
UPDATE `Personas` SET `usuario_creacion_id` = @usuario_profesional_id, `usuario_modificacion_id` = @usuario_profesional_id WHERE `persona_id` = @persona_profesional_id;

-- 7.2.3. Profesional
INSERT INTO `Profesionales` (`persona_id`, `numero_matricula`, `sobre_mi`, `idiomas`, `disponibilidad_horaria`, `usuario_creacion_id`, `usuario_modificacion_id`) VALUES
(@persona_profesional_id, 'PSI-45678', 'Soy una psicóloga clínica con más de 15 años de experiencia en terapia cognitivo-conductual y EMDR.', 'Español, Inglés', 'Lunes a Viernes: 09:00-18:00', @usuario_profesional_id, @usuario_profesional_id);

SET @profesional_id = LAST_INSERT_ID();

-- 7.2.4. Direccion del Profesional
INSERT INTO `Direcciones` (`persona_id`, `calle`, `numero`, `piso`, `departamento`, `ciudad`, `provincia`, `codigo_postal`, `pais`) VALUES
(@persona_profesional_id, 'Calle Falsa', '123', '3', 'B', 'Madrid', 'Madrid', '28001', 'España');

-- 7.2.5. Contacto del Profesional
INSERT INTO `Contactos` (`persona_id`, `telefono_principal`, `email`) VALUES
(@persona_profesional_id, '+34600112233', 'ana.garcia@clinicapsi.com');

-- 7.2.6. Especialidad del Profesional (primero la insertamos si no existe)
INSERT IGNORE INTO `Especialidades` (`nombre_especialidad`, `descripcion`) VALUES
('Psicología Clínica', 'Diagnóstico y tratamiento de trastornos mentales.'),
('Psicoterapia', 'Técnicas terapéuticas para problemas emocionales y psicológicos.');

-- Asociar Especialidades al Profesional
INSERT INTO `Profesional_Especialidad` (`profesional_id`, `especialidad_id`) VALUES
(@profesional_id, (SELECT `especialidad_id` FROM `Especialidades` WHERE `nombre_especialidad` = 'Psicología Clínica')),
(@profesional_id, (SELECT `especialidad_id` FROM `Especialidades` WHERE `nombre_especialidad` = 'Psicoterapia'));

-- 7.2.7. Educación Profesional
INSERT INTO `EducacionProfesional` (`profesional_id`, `institucion`, `titulo_obtenido`, `fecha_inicio`, `fecha_fin`, `observaciones`) VALUES
(@profesional_id, 'Universidad Complutense de Madrid', 'Licenciatura en Psicología', '1998-09-01', '2003-06-30', 'Especialización en Psicología Clínica.'),
(@profesional_id, 'Colegio Oficial de Psicólogos', 'Máster en Terapia Cognitivo-Conductual', '2004-10-01', '2006-07-31', NULL);

-- 7.2.8. Experiencias Laborales
INSERT INTO `ExperienciasLaborales` (`profesional_id`, `empresa_institucion`, `puesto`, `fecha_inicio`, `fecha_fin`, `descripcion_logros`) VALUES
(@profesional_id, 'Clínica Salud Mental Integral', 'Psicóloga Clínica Senior', '2008-01-15', NULL, 'Tratamiento de más de 500 pacientes con diversos trastornos. Supervisión de practicantes.');

-- 7.2.9. Certificaciones
INSERT INTO `CertificacionesAcreditaciones` (`profesional_id`, `nombre_certificacion`, `entidad_emisora`, `fecha_emision`, `fecha_expiracion`) VALUES
(@profesional_id, 'Certificación EMDR Nivel II', 'Asociación EMDR España', '2015-03-20', NULL);



-- 7.3. Paciente que es él mismo el Solicitante

-- 7.3.1. Persona para el Paciente/Solicitante
INSERT INTO `Personas` (`uuid`, `nombre`, `apellido`, `documento_identidad`, `fecha_nacimiento`, `genero`, `nacionalidad`, `ocupacion`, `estado_civil`, `usuario_creacion_id`, `usuario_modificacion_id`) VALUES
(UUID(), 'Carlos', 'Ruiz Soto', '98765432B', '1995-11-20', 'Masculino', 'Argentina', 'Diseñador Gráfico', 'Soltero/a', @admin_usuario_id, @admin_usuario_id);

SET @persona_carlos_id = LAST_INSERT_ID();

-- 7.3.2. Usuario para el Paciente/Solicitante
INSERT INTO `Usuarios` (`persona_id`, `nombre_usuario`, `contrasena_hash`, `rol`, `activo`) VALUES
(@persona_carlos_id, 'carlos.ruiz', 'hashsegurodecarlos', 'Paciente', TRUE);

SET @usuario_carlos_id = LAST_INSERT_ID();

-- Actualizar los usuarios de creación/modificación en la tabla Personas del paciente/solicitante
UPDATE `Personas` SET `usuario_creacion_id` = @usuario_carlos_id, `usuario_modificacion_id` = @usuario_carlos_id WHERE `persona_id` = @persona_carlos_id;

-- 7.3.3. Paciente (Carlos)
INSERT INTO `Pacientes` (`persona_id`, `fecha_primera_consulta`, `riesgo_actual`, `observaciones_generales`, `usuario_creacion_id`, `usuario_modificacion_id`) VALUES
(@persona_carlos_id, '2023-01-10', 'Bajo', 'Paciente autoderivado con síntomas de ansiedad leve.', @usuario_carlos_id, @usuario_carlos_id);

SET @paciente_carlos_id = LAST_INSERT_ID();

-- 7.3.4. Solicitante (Carlos, siendo él mismo)
INSERT INTO `Solicitantes` (`persona_id`, `es_tutor_legal`, `observaciones_solicitante`, `usuario_creacion_id`, `usuario_modificacion_id`) VALUES
(@persona_carlos_id, FALSE, 'Es el propio paciente solicitando su atención.', @usuario_carlos_id, @usuario_carlos_id);

SET @solicitante_carlos_id = LAST_INSERT_ID();

-- 7.3.5. Relación Paciente_Solicitante (Carlos como su propio solicitante)
INSERT INTO `Paciente_Solicitante` (`paciente_id`, `solicitante_id`, `parentesco_especifico`, `es_solicitante_principal`, `autorizacion_tratamiento`) VALUES
(@paciente_carlos_id, @solicitante_carlos_id, 'Propio paciente', TRUE, TRUE);

-- 7.3.6. Contacto de Carlos
INSERT INTO `Contactos` (`persona_id`, `telefono_principal`, `email`) VALUES
(@persona_carlos_id, '+5491155551234', 'carlos.ruiz@ejemplo.com');



-- 7.4. Un solicitante que tenga dos pacientes

-- 7.4.1. Persona para el Solicitante (Madre)
INSERT INTO `Personas` (`uuid`, `nombre`, `apellido`, `documento_identidad`, `fecha_nacimiento`, `genero`, `nacionalidad`, `ocupacion`, `estado_civil`, `usuario_creacion_id`, `usuario_modificacion_id`) VALUES
(UUID(), 'Laura', 'Martínez', '30999888C', '1975-03-25', 'Femenino', 'Mexicana', 'Ama de Casa', 'Casado/a', @admin_usuario_id, @admin_usuario_id);

SET @persona_laura_id = LAST_INSERT_ID();

-- 7.4.2. Usuario para el Solicitante
INSERT INTO `Usuarios` (`persona_id`, `nombre_usuario`, `contrasena_hash`, `rol`, `activo`) VALUES
(@persona_laura_id, 'laura.martinez', 'hashsegurodelaura', 'Solicitante', TRUE);

SET @usuario_laura_id = LAST_INSERT_ID();

-- Actualizar los usuarios de creación/modificación en la tabla Personas del solicitante
UPDATE `Personas` SET `usuario_creacion_id` = @usuario_laura_id, `usuario_modificacion_id` = @usuario_laura_id WHERE `persona_id` = @persona_laura_id;

-- 7.4.3. Solicitante (Laura)
INSERT INTO `Solicitantes` (`persona_id`, `es_tutor_legal`, `observaciones_solicitante`, `usuario_creacion_id`, `usuario_modificacion_id`) VALUES
(@persona_laura_id, TRUE, 'Madre de dos pacientes menores de edad.', @usuario_laura_id, @usuario_laura_id);

SET @solicitante_laura_id = LAST_INSERT_ID();

-- 7.4.4. Contacto de Laura
INSERT INTO `Contactos` (`persona_id`, `telefono_principal`, `email`) VALUES
(@persona_laura_id, '+5215512345678', 'laura.martinez@ejemplo.com');

-- 7.4.5. Primer Paciente asociado a Laura (Hijo 1)
INSERT INTO `Personas` (`uuid`, `nombre`, `apellido`, `documento_identidad`, `fecha_nacimiento`, `genero`, `nacionalidad`, `ocupacion`, `estado_civil`, `usuario_creacion_id`, `usuario_modificacion_id`) VALUES
(UUID(), 'Diego', 'Pérez Martínez', '10111222D', '2010-08-01', 'Masculino', 'Mexicana', NULL, 'Soltero/a', @admin_usuario_id, @admin_usuario_id);

SET @persona_diego_id = LAST_INSERT_ID();

-- 7.4.6. Paciente (Diego)
INSERT INTO `Pacientes` (`persona_id`, `fecha_primera_consulta`, `riesgo_actual`, `observaciones_generales`, `usuario_creacion_id`, `usuario_modificacion_id`) VALUES
(@persona_diego_id, '2024-02-15', 'Moderado', 'Paciente derivado por la escuela, con dificultades de adaptación social.', @admin_usuario_id, @admin_usuario_id);

SET @paciente_diego_id = LAST_INSERT_ID();

-- 7.4.7. Relación Paciente_Solicitante (Diego - Laura)
INSERT INTO `Paciente_Solicitante` (`paciente_id`, `solicitante_id`, `parentesco_especifico`, `es_solicitante_principal`, `autorizacion_tratamiento`) VALUES
(@paciente_diego_id, @solicitante_laura_id, 'Madre', TRUE, TRUE);

-- 7.4.8. Segundo Paciente asociado a Laura (Hijo 2)
INSERT INTO `Personas` (`uuid`, `nombre`, `apellido`, `documento_identidad`, `fecha_nacimiento`, `genero`, `nacionalidad`, `ocupacion`, `estado_civil`, `usuario_creacion_id`, `usuario_modificacion_id`) VALUES
(UUID(), 'Sofía', 'Pérez Martínez', '13141516E', '2012-04-10', 'Femenino', 'Mexicana', NULL, 'Soltero/a', @admin_usuario_id, @admin_usuario_id);

SET @persona_sofia_id = LAST_INSERT_ID();

-- 7.4.9. Paciente (Sofía)
INSERT INTO `Pacientes` (`persona_id`, `fecha_primera_consulta`, `riesgo_actual`, `observaciones_generales`, `usuario_creacion_id`, `usuario_modificacion_id`) VALUES
(@persona_sofia_id, '2024-03-01', 'Bajo', 'Paciente con ansiedad de separación.', @admin_usuario_id, @admin_usuario_id);

SET @paciente_sofia_id = LAST_INSERT_ID();

-- 7.4.10. Relación Paciente_Solicitante (Sofía - Laura)
INSERT INTO `Paciente_Solicitante` (`paciente_id`, `solicitante_id`, `parentesco_especifico`, `es_solicitante_principal`, `autorizacion_tratamiento`) VALUES
(@paciente_sofia_id, @solicitante_laura_id, 'Madre', TRUE, TRUE);