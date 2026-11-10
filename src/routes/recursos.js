const { crearRouterCrud } = require("./crudBase");
const {
  CentroSalud, PersonalMedico, Paciente, Medicamento, Visita, Prescripcion,
} = require("../models");
const { prepararPaciente, presentarPaciente, filtroPaciente } = require("../funciones/pacientes");
const { prepararVisita, presentarVisita } = require("../funciones/visitas");

const filtrarPor = (...nombres) => (consulta) => {
  const filtro = {};
  nombres.forEach((nombre) => {
    if (consulta[nombre] !== undefined) filtro[nombre] = String(consulta[nombre]);
  });
  return filtro;
};

module.exports = {
  centros: crearRouterCrud(CentroSalud, {
    nombre: "Centro de salud",
    campos: ["nombre", "ubicacion", "servicios"],
  }),
  personal: crearRouterCrud(PersonalMedico, {
    nombre: "Funcionario",
    campos: ["nombre", "especialidad", "rol", "centro_id"],
    construirFiltro: filtrarPor("centro_id", "rol"),
  }),
  pacientes: crearRouterCrud(Paciente, {
    nombre: "Paciente",
    campos: ["identificacion", "nombre", "fecha_nacimiento", "sexo"],
    preparar: prepararPaciente,
    presentar: presentarPaciente,
    construirFiltro: filtroPaciente,
  }),
  medicamentos: crearRouterCrud(Medicamento, {
    nombre: "Medicamento",
    campos: ["codigo", "nombre_generico", "presentacion", "via_administracion"],
    construirFiltro: filtrarPor("codigo", "nombre_generico"),
  }),
  visitas: crearRouterCrud(Visita, {
    nombre: "Visita",
    campos: [
      "paciente_id", "medico_id", "centro_id", "fecha", "motivo", "formulario_ingreso",
      "signos_vitales", "diagnosticos", "comentarios_medico",
    ],
    preparar: prepararVisita,
    presentar: presentarVisita,
    construirFiltro: filtrarPor("paciente_id", "centro_id", "medico_id"),
  }),
  prescripciones: crearRouterCrud(Prescripcion, {
    nombre: "Prescripción",
    campos: [
      "paciente_id", "visita_id", "medico_id", "medicamento_id", "codigo_medicamento",
      "nombre_generico", "dosis", "frecuencia", "duracion_dias", "fecha_emision",
    ],
    construirFiltro: filtrarPor("paciente_id", "visita_id", "medicamento_id"),
  }),
};
