const INDICES = {
  personal_medico: [
    { campos: { centro_id: 1 }, opciones: { name: "ix_personal_centro" } },
  ],
  pacientes: [
    { campos: { identificacion: 1 }, opciones: { name: "ux_pacientes_identificacion", unique: true } },
  ],
  visitas: [
    { campos: { paciente_id: 1, fecha: -1 }, opciones: { name: "ix_visitas_paciente_fecha" } },
    { campos: { centro_id: 1, fecha: -1 }, opciones: { name: "ix_visitas_centro_fecha" } },
  ],
  resultados_laboratorio: [
    { campos: { paciente_id: 1, fecha: -1 }, opciones: { name: "ix_laboratorio_paciente_fecha" } },
  ],
  estudios_imagen: [
    { campos: { paciente_id: 1, fecha: -1 }, opciones: { name: "ix_imagen_paciente_fecha" } },
  ],
  cirugias: [
    { campos: { paciente_id: 1, fecha: -1 }, opciones: { name: "ix_cirugias_paciente_fecha" } },
  ],
  prescripciones: [
    { campos: { paciente_id: 1, fecha_emision: -1 }, opciones: { name: "ix_prescripciones_paciente_fecha" } },
    { campos: { medicamento_id: 1 }, opciones: { name: "ix_prescripciones_medicamento" } },
  ],
  medicamentos: [
    { campos: { codigo: 1 }, opciones: { name: "ux_medicamentos_codigo", unique: true } },
    { campos: { nombre_generico: 1 }, opciones: { name: "ix_medicamentos_nombre" } },
  ],
  bitacora_accesos: [
    { campos: { paciente_id: 1, fecha_hora: -1 }, opciones: { name: "ix_bitacora_paciente_fecha" } },
  ],
};

module.exports = INDICES;
