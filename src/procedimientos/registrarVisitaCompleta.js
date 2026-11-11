const { Visita, Prescripcion, Medicamento, Paciente, PersonalMedico, CentroSalud } = require("../models");
const { BitacoraAcceso } = require("../models/bitacora");
const { prepararVisita, presentarVisita } = require("../funciones/visitas");
const { errorValidacion } = require("../funciones/validacion");
const { ejecutarTransaccion, exigirExistente } = require("./comun");

async function registrarVisitaCompleta(datos, origen = "api") {
  const {
    prescripciones = [], paciente_id, medico_id, centro_id, fecha, motivo,
    formulario_ingreso, signos_vitales, diagnosticos, comentarios_medico,
  } = datos;
  const datosVisita = {
    paciente_id, medico_id, centro_id, fecha, motivo,
    formulario_ingreso, signos_vitales, diagnosticos, comentarios_medico,
  };

  if (!Array.isArray(prescripciones)) {
    throw errorValidacion("El campo prescripciones debe ser un arreglo");
  }

  return ejecutarTransaccion(async (session) => {
    await exigirExistente(Paciente, paciente_id, "Paciente", session);
    await exigirExistente(PersonalMedico, medico_id, "Funcionario", session);
    await exigirExistente(CentroSalud, centro_id, "Centro de salud", session);

    const [visita] = await Visita.create([prepararVisita(datosVisita)], { session });

    const recetas = [];
    for (const item of prescripciones) {
      if (!item || typeof item !== "object") {
        throw errorValidacion("Cada prescripción debe ser un objeto");
      }
      await exigirExistente(Medicamento, item.medicamento_id, "Medicamento", session);
      const medicamento = await Medicamento.findById(item.medicamento_id).session(session);
      recetas.push({
        paciente_id: visita.paciente_id,
        visita_id: visita._id,
        medico_id: visita.medico_id,
        medicamento_id: medicamento._id,
        codigo_medicamento: medicamento.codigo,
        nombre_generico: medicamento.nombre_generico,
        dosis: item.dosis,
        frecuencia: item.frecuencia,
        duracion_dias: item.duracion_dias,
      });
    }
    const creadas = recetas.length > 0 ? await Prescripcion.create(recetas, { session, ordered: true }) : [];

    await BitacoraAcceso.create(
      [{ usuario_id: visita.medico_id, paciente_id: visita.paciente_id, accion: "crear", origen }],
      { session }
    );

    return {
      visita: presentarVisita(visita),
      prescripciones: creadas.map((receta) => receta.toObject()),
    };
  });
}

module.exports = { registrarVisitaCompleta };

