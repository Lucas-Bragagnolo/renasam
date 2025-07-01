+-------------------+       +--------------------+       +-------------------+
|     Personas      |<-----|      Usuarios      |       |    Direcciones    |
+-------------------+       +--------------------+       +-------------------+
| - persona_id (PK) |       | - usuario_id (PK)  |       | - direccion_id (PK)
| - uuid            |       | - persona_id (FK)  |       | - persona_id (FK)
| - nombre          |       | - nombre_usuario   |       | - calle
| - apellido        |       | - contrasena_hash  |       | - numero
| - documento_ident |       | - rol              |       | - ciudad
| - fecha_nacimiento|       | - activo           |       | - provincia
| - genero          |       | - fecha_creacion   |       | ...
| - ...             |       | - ultima_mod       |       |
| - usr_creacion_id (FK) -> |                    |       |
| - usr_modificacion_id (FK)->|                    |       |
+-------------------+       +--------------------+       +-------------------+
          |                           ^
          |                           |
          |         +---------------------------+
          |         |                           |
          |         |    (Usuarios de creación/modificación en varias tablas)
          |         |                           |
          v         |                           v
+-------------------+       +-------------------+       +-------------------+
|     Pacientes     |<----->|   Solicitantes    |       |  Profesionales    |
+-------------------+       +-------------------+       +-------------------+
| - paciente_id (PK)|       | - solicitante_id (PK) |   | - profesional_id (PK)
| - persona_id (FK) |       | - persona_id (FK)     |   | - persona_id (FK)
| - fecha_primera_co|       | - es_tutor_legal      |   | - numero_matricula
| - riesgo_actual   |       | - obs_solicitante     |   | - sobre_mi
| - observaciones   |       | - ...                 |   | - idiomas
| - usr_creacion_id (FK) -> |                       |   | - ...
| - usr_modificacion_id (FK)->|                       |   |
+-------------------+       +-------------------+       +-------------------+
          |                             ^                           |
          |                             |                           |
          | +-----------------------------------------------------+ |
          | |               Paciente_Solicitante                  | |
          | +-----------------------------------------------------+ |
          | | - paciente_id (FK)                                  | |
          | | - solicitante_id (FK)                               | |
          | | - parentesco_especifico                             | |
          | | - es_solicitante_principal                          | |
          | | - autorizacion_tratamiento                          | |
          | | - ...                                               | |
          | +-----------------------------------------------------+ |
          |                                                       |
          | +-----------------------------------------------------+ |
          | |               Paciente_Diagnostico                  | |
          | +-----------------------------------------------------+ |
          | | - paciente_diagnostico_id (PK)                      | |
          | | - paciente_id (FK)                                  | |
          | | - diagnostico_id (FK) (ref. Diagnosticos)           | |
          | | - fecha_inicio                                      | |
          | | - profesional_diagnostico_id (FK) (ref. Profesionales) |
          | | - ...                                               | |
          | +-----------------------------------------------------+ |
          |                                                       |
          | +-----------------------------------------------------+ |
          | |               Paciente_Medicacion                   | |
          | +-----------------------------------------------------+ |
          | | - paciente_medicacion_id (PK)                       | |
          | | - paciente_id (FK)                                  | |
          | | - medicamento_id (FK) (ref. Medicamentos)          | |
          | | - dosis                                             | |
          | | - frecuencia                                        | |
          | | - profesional_prescriptor_id (FK) (ref. Profesionales) |
          | | - ...                                               | |
          | +-----------------------------------------------------+ |
          |                                                       |
          | +-----------------------------------------------------+ |
          | |                  Sesiones                           | |
          | +-----------------------------------------------------+ |
          | | - sesion_id (PK)                                    | |
          | | - paciente_id (FK)                                  | |
          | | - fecha_sesion                                      | |
          | | - tipo_sesion                                       | |
          | | - ...                                               | |
          | | - usr_creacion_id (FK)                              | |
          | | - usr_modificacion_id (FK)                          | |
          | +-----------------------------------------------------+ |
          |                                                       |
          | +-----------------------------------------------------+ |
          | |            ObjetivosTerapeuticos                    | |
          | +-----------------------------------------------------+ |
          | | - objetivo_id (PK)                                  | |
          | | - paciente_id (FK)                                  | |
          | | - descripcion                                       | |
          | | - estado                                            | |
          | | - profesional_id (FK) (ref. Profesionales)          | |
          | | - ...                                               | |
          | +-----------------------------------------------------+ |
          |                                                       |
          | +-----------------------------------------------------+ |
          | |                  Consentimientos                    | |
          | +-----------------------------------------------------+ |
          | | - consentimiento_id (PK)                            | |
          | | - solicitante_id (FK)                               | |
          | | - paciente_id (FK) (puede ser NULL)                 | |
          | | - tipo_consentimiento_id (FK) (ref. TiposConsentimiento) |
          | | - fecha_otorgamiento                                | |
          | | - ...                                               | |
          | | - usr_creacion_id (FK)                              | |
          | | - usr_modificacion_id (FK)                          | |
          | +-----------------------------------------------------+ |
          |                                                       |
          +-------------------------------------------------------+