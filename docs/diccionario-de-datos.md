# Diccionario de datos

Base de datos: `ccss_pacientes`

## bitacora_accesos

Auditoría de los accesos a la información de los pacientes

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| _id | ObjectId | No | Identificador único del documento |
| usuario_id | ObjectId | Sí | Referencia al funcionario que realizó el acceso |
| paciente_id | ObjectId | Sí | Referencia al paciente cuya información se accedió |
| accion | texto | Sí | Acción realizada Valores permitidos: consultar, crear, actualizar, eliminar. |
| fecha_hora | fecha | Sí | Fecha y hora del acceso |
| origen | texto | Sí | Origen del acceso (equipo o dirección) |

Índices:

- _id_ (_id: 1)
- ix_bitacora_paciente_fecha (paciente_id: 1, fecha_hora: -1)

## centros_salud

Centros de salud de la CCSS

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| _id | ObjectId | No | Identificador único del documento |
| nombre | texto | Sí | Nombre del centro de salud |
| ubicacion | texto | Sí | Ubicación del centro (provincia, cantón y distrito) |
| servicios | arreglo de texto | No | Servicios que ofrece el centro (embebido) |

Índices:

- _id_ (_id: 1)

## cirugias

Cirugías realizadas a los pacientes

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| _id | ObjectId | No | Identificador único del documento |
| paciente_id | ObjectId | Sí | Referencia al paciente |
| visita_id | ObjectId | Sí | Referencia a la visita asociada |
| procedimiento | texto | Sí | Nombre del procedimiento quirúrgico |
| fecha | fecha | Sí | Fecha de la cirugía |
| etapas | arreglo de objeto | No | Etapas de la cirugía (embebido) |
| etapas[].orden | entero | Sí | Posición de la etapa dentro de la cirugía |
| etapas[].descripcion | texto | Sí | Descripción de la etapa |
| equipo | arreglo de objeto | No | Equipo que participó en la cirugía (embebido) |
| equipo[].medico_id | ObjectId | Sí | Referencia al funcionario |
| equipo[].rol | texto | Sí | Rol dentro del equipo quirúrgico |

Índices:

- _id_ (_id: 1)
- ix_cirugias_paciente_fecha (paciente_id: 1, fecha: -1)

## estudios_imagen

Estudios de imagen médica. Solo se guardan sus metadatos

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| _id | ObjectId | No | Identificador único del documento |
| paciente_id | ObjectId | Sí | Referencia al paciente |
| visita_id | ObjectId | Sí | Referencia a la visita que originó el estudio |
| tipo | texto | Sí | Tipo de estudio (por ejemplo, rayos X o ultrasonido) |
| fecha | fecha | Sí | Fecha del estudio |
| interpretacion | texto | No | Interpretación del especialista |
| archivo_uri | texto | Sí | Ubicación del archivo en el almacenamiento externo |

Índices:

- _id_ (_id: 1)
- ix_imagen_paciente_fecha (paciente_id: 1, fecha: -1)

## medicamentos

Catálogo de medicamentos

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| _id | ObjectId | No | Identificador único del documento |
| codigo | texto | Sí | Código único del medicamento |
| nombre_generico | texto | Sí | Nombre genérico del medicamento |
| presentacion | texto | Sí | Presentación (por ejemplo, tabletas de 500 mg) |
| via_administracion | texto | Sí | Vía de administración |

Índices:

- _id_ (_id: 1)
- ux_medicamentos_codigo (codigo: 1), único
- ix_medicamentos_nombre (nombre_generico: 1)

## pacientes

Pacientes registrados en el sistema

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| _id | ObjectId | No | Identificador único del documento |
| identificacion | texto | Sí | Número de identificación del paciente. Se guarda cifrado de forma determinística en la aplicación |
| nombre | texto | Sí | Nombre completo del paciente. Se guarda cifrado de forma aleatoria en la aplicación |
| fecha_nacimiento | fecha | Sí | Fecha de nacimiento del paciente |
| sexo | texto | Sí | Sexo del paciente. No se cifra por su baja cardinalidad Valores permitidos: Femenino, Masculino, Otro. |

Índices:

- _id_ (_id: 1)
- ux_pacientes_identificacion (identificacion: 1), único

## personal_medico

Personal que atiende en los centros de salud

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| _id | ObjectId | No | Identificador único del documento |
| nombre | texto | Sí | Nombre completo del funcionario |
| especialidad | texto | Sí | Especialidad del funcionario |
| rol | texto | Sí | Rol dentro del centro de salud Valores permitidos: medico, enfermeria, laboratorio, administrativo. |
| centro_id | ObjectId | Sí | Referencia al centro de salud donde labora |

Índices:

- _id_ (_id: 1)
- ix_personal_centro (centro_id: 1)

## prescripciones

Prescripciones de medicamentos

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| _id | ObjectId | No | Identificador único del documento |
| paciente_id | ObjectId | Sí | Referencia al paciente |
| visita_id | ObjectId | Sí | Referencia a la visita en que se recetó |
| medico_id | ObjectId | Sí | Referencia al funcionario que recetó |
| medicamento_id | ObjectId | Sí | Referencia al medicamento del catálogo |
| codigo_medicamento | texto | No | Código del medicamento, copiado del catálogo para leerlo sin otra consulta |
| nombre_generico | texto | No | Nombre genérico, copiado del catálogo para leerlo sin otra consulta |
| dosis | texto | Sí | Dosis indicada |
| frecuencia | texto | Sí | Frecuencia de administración |
| duracion_dias | entero | Sí | Duración del tratamiento en días |
| fecha_emision | fecha | Sí | Fecha de emisión de la receta |

Índices:

- _id_ (_id: 1)
- ix_prescripciones_paciente_fecha (paciente_id: 1, fecha_emision: -1)
- ix_prescripciones_medicamento (medicamento_id: 1)

## resultados_laboratorio

Resultados de laboratorio de una visita

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| _id | ObjectId | No | Identificador único del documento |
| paciente_id | ObjectId | Sí | Referencia al paciente |
| visita_id | ObjectId | Sí | Referencia a la visita que originó el estudio |
| fecha | fecha | Sí | Fecha del resultado |
| pruebas | arreglo de objeto | Sí | Pruebas realizadas (embebido) |
| pruebas[].nombre | texto | Sí | Nombre de la prueba |
| pruebas[].valor | número | Sí | Valor obtenido |
| pruebas[].unidad | texto | No | Unidad de medida |
| pruebas[].rango_referencia | texto | No | Rango de referencia del valor |

Índices:

- _id_ (_id: 1)
- ix_laboratorio_paciente_fecha (paciente_id: 1, fecha: -1)

## visitas

Visitas médicas de los pacientes

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| _id | ObjectId | No | Identificador único del documento |
| paciente_id | ObjectId | Sí | Referencia al paciente atendido |
| medico_id | ObjectId | Sí | Referencia al funcionario que atendió |
| centro_id | ObjectId | Sí | Referencia al centro de salud de la visita |
| fecha | fecha | Sí | Fecha y hora de la visita |
| motivo | texto | Sí | Motivo de la consulta |
| formulario_ingreso | objeto | No | Formulario de ingreso (embebido) |
| formulario_ingreso.sintomas | arreglo de texto | No | Síntomas reportados por el paciente |
| formulario_ingreso.antecedentes | texto | No | Antecedentes médicos relevantes |
| formulario_ingreso.alergias | arreglo de texto | No | Alergias conocidas del paciente |
| signos_vitales | objeto | No | Signos vitales registrados en la visita (embebido) |
| signos_vitales.temperatura_c | número | No | Temperatura corporal en grados Celsius |
| signos_vitales.frecuencia_cardiaca | número | No | Frecuencia cardíaca en latidos por minuto |
| signos_vitales.presion_sistolica | número | No | Presión arterial sistólica en mmHg |
| signos_vitales.presion_diastolica | número | No | Presión arterial diastólica en mmHg |
| signos_vitales.saturacion_oxigeno | número | No | Saturación de oxígeno en porcentaje |
| signos_vitales.peso_kg | número | No | Peso del paciente en kilogramos |
| diagnosticos | arreglo de objeto | No | Diagnósticos de la visita (embebido) |
| diagnosticos[].codigo | texto | Sí | Código del diagnóstico (por ejemplo, CIE-10) |
| diagnosticos[].descripcion | texto | Sí | Descripción del diagnóstico |
| comentarios_medico | texto | No | Comentarios del médico. Se guardan cifrados de forma aleatoria en la aplicación |

Índices:

- _id_ (_id: 1)
- ix_visitas_paciente_fecha (paciente_id: 1, fecha: -1)
- ix_visitas_centro_fecha (centro_id: 1, fecha: -1)
