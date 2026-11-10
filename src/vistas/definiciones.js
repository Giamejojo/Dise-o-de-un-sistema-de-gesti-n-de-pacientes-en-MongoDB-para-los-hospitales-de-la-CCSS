const enlazar = (desde, campoLocal, campoForaneo, como) => ({
  $lookup: { from: desde, localField: campoLocal, foreignField: campoForaneo, as: como },
});

const VISTAS = [
  {
    nombre: "vista_expediente_paciente",
    origen: "pacientes",
    descripcion: "Expediente completo de cada paciente en un solo documento",
    pipeline: [
      enlazar("visitas", "_id", "paciente_id", "visitas"),
      enlazar("prescripciones", "_id", "paciente_id", "prescripciones"),
      enlazar("resultados_laboratorio", "_id", "paciente_id", "resultados_laboratorio"),
      enlazar("estudios_imagen", "_id", "paciente_id", "estudios_imagen"),
      enlazar("cirugias", "_id", "paciente_id", "cirugias"),
    ],
  },
  {
    nombre: "vista_visitas_detalle",
    origen: "visitas",
    descripcion: "Visitas con el nombre del centro y del médico, sin los comentarios cifrados",
    pipeline: [
      enlazar("centros_salud", "centro_id", "_id", "centro"),
      enlazar("personal_medico", "medico_id", "_id", "medico"),
      { $unwind: "$centro" },
      { $unwind: "$medico" },
      {
        $project: {
          paciente_id: 1,
          fecha: 1,
          motivo: 1,
          diagnosticos: 1,
          centro: "$centro.nombre",
          medico: "$medico.nombre",
          especialidad: "$medico.especialidad",
        },
      },
      { $sort: { fecha: -1 } },
    ],
  },
  {
    nombre: "vista_medicamentos_mas_recetados",
    origen: "prescripciones",
    descripcion: "Medicamentos ordenados por cantidad de prescripciones",
    pipeline: [
      {
        $group: {
          _id: "$medicamento_id",
          codigo: { $first: "$codigo_medicamento" },
          nombre_generico: { $first: "$nombre_generico" },
          prescripciones: { $sum: 1 },
          dias_tratamiento: { $sum: "$duracion_dias" },
          pacientes: { $addToSet: "$paciente_id" },
        },
      },
      {
        $project: {
          codigo: 1,
          nombre_generico: 1,
          prescripciones: 1,
          dias_tratamiento: 1,
          pacientes_distintos: { $size: "$pacientes" },
        },
      },
      { $sort: { prescripciones: -1, nombre_generico: 1 } },
    ],
  },
  {
    nombre: "vista_resumen_centros",
    origen: "visitas",
    descripcion: "Visitas, pacientes atendidos y última visita por centro de salud",
    pipeline: [
      {
        $group: {
          _id: "$centro_id",
          visitas: { $sum: 1 },
          pacientes: { $addToSet: "$paciente_id" },
          ultima_visita: { $max: "$fecha" },
        },
      },
      enlazar("centros_salud", "_id", "_id", "centro"),
      { $unwind: "$centro" },
      {
        $project: {
          centro: "$centro.nombre",
          ubicacion: "$centro.ubicacion",
          visitas: 1,
          pacientes_atendidos: { $size: "$pacientes" },
          ultima_visita: 1,
        },
      },
      { $sort: { visitas: -1 } },
    ],
  },
];

module.exports = VISTAS;
