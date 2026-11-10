const texto = (descripcion, extra = {}) => ({ bsonType: "string", description: descripcion, ...extra });
const numero = (descripcion, extra = {}) => ({ bsonType: "number", description: descripcion, ...extra });
const entero = (descripcion, extra = {}) => ({ bsonType: "number", multipleOf: 1, minimum: 0, description: descripcion, ...extra });
const fecha = (descripcion) => ({ bsonType: "date", description: descripcion });
const idRef = (descripcion) => ({ bsonType: "objectId", description: descripcion });
const lista = (descripcion, items) => ({ bsonType: "array", description: descripcion, items });

function objeto(descripcion, propiedades, requeridos = []) {
  const esquema = { bsonType: "object", description: descripcion, properties: propiedades };
  if (requeridos.length > 0) esquema.required = requeridos;
  return esquema;
}

function coleccion(descripcion, requeridos, propiedades) {
  return objeto(
    descripcion,
    { _id: idRef("Identificador único del documento"), ...propiedades },
    requeridos
  );
}

const ESQUEMAS = {
  centros_salud: coleccion("Centros de salud de la CCSS", ["nombre", "ubicacion"], {
    nombre: texto("Nombre del centro de salud", { minLength: 1 }),
    ubicacion: texto("Ubicación del centro (provincia, cantón y distrito)"),
    servicios: lista("Servicios que ofrece el centro (embebido)", texto("Nombre del servicio")),
  }),

  personal_medico: coleccion("Personal que atiende en los centros de salud", ["nombre", "especialidad", "rol", "centro_id"], {
    nombre: texto("Nombre completo del funcionario", { minLength: 1 }),
    especialidad: texto("Especialidad del funcionario"),
    rol: texto("Rol dentro del centro de salud", {
      enum: ["medico", "enfermeria", "laboratorio", "administrativo"],
    }),
    centro_id: idRef("Referencia al centro de salud donde labora"),
  }),

  pacientes: coleccion("Pacientes registrados en el sistema", ["identificacion", "nombre", "fecha_nacimiento", "sexo"], {
    identificacion: texto("Número de identificación del paciente. Se guarda cifrado de forma determinística en la aplicación", { minLength: 1 }),
    nombre: texto("Nombre completo del paciente. Se guarda cifrado de forma aleatoria en la aplicación", { minLength: 1 }),
    fecha_nacimiento: fecha("Fecha de nacimiento del paciente"),
    sexo: texto("Sexo del paciente. No se cifra por su baja cardinalidad", {
      enum: ["Femenino", "Masculino", "Otro"],
    }),
  }),

  visitas: coleccion("Visitas médicas de los pacientes", ["paciente_id", "medico_id", "centro_id", "fecha", "motivo"], {
    paciente_id: idRef("Referencia al paciente atendido"),
    medico_id: idRef("Referencia al funcionario que atendió"),
    centro_id: idRef("Referencia al centro de salud de la visita"),
    fecha: fecha("Fecha y hora de la visita"),
    motivo: texto("Motivo de la consulta", { minLength: 1 }),
    formulario_ingreso: objeto("Formulario de ingreso (embebido)", {
      sintomas: lista("Síntomas reportados por el paciente", texto("Síntoma")),
      antecedentes: texto("Antecedentes médicos relevantes"),
      alergias: lista("Alergias conocidas del paciente", texto("Alergia")),
    }),
    signos_vitales: objeto("Signos vitales registrados en la visita (embebido)", {
      temperatura_c: numero("Temperatura corporal en grados Celsius"),
      frecuencia_cardiaca: numero("Frecuencia cardíaca en latidos por minuto", { minimum: 0 }),
      presion_sistolica: numero("Presión arterial sistólica en mmHg", { minimum: 0 }),
      presion_diastolica: numero("Presión arterial diastólica en mmHg", { minimum: 0 }),
      saturacion_oxigeno: numero("Saturación de oxígeno en porcentaje", { minimum: 0, maximum: 100 }),
      peso_kg: numero("Peso del paciente en kilogramos", { minimum: 0 }),
    }),
    diagnosticos: lista(
      "Diagnósticos de la visita (embebido)",
      objeto("Diagnóstico", {
        codigo: texto("Código del diagnóstico (por ejemplo, CIE-10)"),
        descripcion: texto("Descripción del diagnóstico"),
      }, ["codigo", "descripcion"])
    ),
    comentarios_medico: texto("Comentarios del médico. Se guardan cifrados de forma aleatoria en la aplicación"),
  }),

  resultados_laboratorio: coleccion("Resultados de laboratorio de una visita", ["paciente_id", "visita_id", "fecha", "pruebas"], {
    paciente_id: idRef("Referencia al paciente"),
    visita_id: idRef("Referencia a la visita que originó el estudio"),
    fecha: fecha("Fecha del resultado"),
    pruebas: lista(
      "Pruebas realizadas (embebido)",
      objeto("Prueba de laboratorio", {
        nombre: texto("Nombre de la prueba"),
        valor: numero("Valor obtenido"),
        unidad: texto("Unidad de medida"),
        rango_referencia: texto("Rango de referencia del valor"),
      }, ["nombre", "valor"])
    ),
  }),

  estudios_imagen: coleccion("Estudios de imagen médica. Solo se guardan sus metadatos", ["paciente_id", "visita_id", "tipo", "fecha", "archivo_uri"], {
    paciente_id: idRef("Referencia al paciente"),
    visita_id: idRef("Referencia a la visita que originó el estudio"),
    tipo: texto("Tipo de estudio (por ejemplo, rayos X o ultrasonido)"),
    fecha: fecha("Fecha del estudio"),
    interpretacion: texto("Interpretación del especialista"),
    archivo_uri: texto("Ubicación del archivo en el almacenamiento externo"),
  }),

  cirugias: coleccion("Cirugías realizadas a los pacientes", ["paciente_id", "visita_id", "procedimiento", "fecha"], {
    paciente_id: idRef("Referencia al paciente"),
    visita_id: idRef("Referencia a la visita asociada"),
    procedimiento: texto("Nombre del procedimiento quirúrgico", { minLength: 1 }),
    fecha: fecha("Fecha de la cirugía"),
    etapas: lista(
      "Etapas de la cirugía (embebido)",
      objeto("Etapa", {
        orden: entero("Posición de la etapa dentro de la cirugía", { minimum: 1 }),
        descripcion: texto("Descripción de la etapa"),
      }, ["orden", "descripcion"])
    ),
    equipo: lista(
      "Equipo que participó en la cirugía (embebido)",
      objeto("Integrante", {
        medico_id: idRef("Referencia al funcionario"),
        rol: texto("Rol dentro del equipo quirúrgico"),
      }, ["medico_id", "rol"])
    ),
  }),

  prescripciones: coleccion(
    "Prescripciones de medicamentos",
    ["paciente_id", "visita_id", "medico_id", "medicamento_id", "dosis", "frecuencia", "duracion_dias", "fecha_emision"],
    {
      paciente_id: idRef("Referencia al paciente"),
      visita_id: idRef("Referencia a la visita en que se recetó"),
      medico_id: idRef("Referencia al funcionario que recetó"),
      medicamento_id: idRef("Referencia al medicamento del catálogo"),
      codigo_medicamento: texto("Código del medicamento, copiado del catálogo para leerlo sin otra consulta"),
      nombre_generico: texto("Nombre genérico, copiado del catálogo para leerlo sin otra consulta"),
      dosis: texto("Dosis indicada", { minLength: 1 }),
      frecuencia: texto("Frecuencia de administración", { minLength: 1 }),
      duracion_dias: entero("Duración del tratamiento en días", { minimum: 1 }),
      fecha_emision: fecha("Fecha de emisión de la receta"),
    }
  ),

  medicamentos: coleccion("Catálogo de medicamentos", ["codigo", "nombre_generico", "presentacion", "via_administracion"], {
    codigo: texto("Código único del medicamento", { minLength: 1 }),
    nombre_generico: texto("Nombre genérico del medicamento", { minLength: 1 }),
    presentacion: texto("Presentación (por ejemplo, tabletas de 500 mg)"),
    via_administracion: texto("Vía de administración"),
  }),

  bitacora_accesos: coleccion("Auditoría de los accesos a la información de los pacientes", ["usuario_id", "paciente_id", "accion", "fecha_hora", "origen"], {
    usuario_id: idRef("Referencia al funcionario que realizó el acceso"),
    paciente_id: idRef("Referencia al paciente cuya información se accedió"),
    accion: texto("Acción realizada", { enum: ["consultar", "crear", "actualizar", "eliminar"] }),
    fecha_hora: fecha("Fecha y hora del acceso"),
    origen: texto("Origen del acceso (equipo o dirección)"),
  }),
};

module.exports = ESQUEMAS;
