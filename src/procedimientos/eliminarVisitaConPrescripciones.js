const mongoose = require("mongoose");
const { Visita, Prescripcion, PersonalMedico } = require("../models");
const { BitacoraAcceso } = require("../models/bitacora");
const { errorValidacion } = require("../funciones/validacion");
const { ejecutarTransaccion, exigirExistente } = require("./comun");

const COLECCIONES_ASOCIADAS = ["resultados_laboratorio", "estudios_imagen", "cirugias"];

async function eliminarVisitaConPrescripciones(visitaId, usuarioId, origen = "api") {
  await exigirExistente(PersonalMedico, usuarioId, "Funcionario");
  if (!mongoose.isObjectIdOrHexString(visitaId)) {
    throw errorValidacion("Identificador inválido de visita");
  }

  return ejecutarTransaccion(async (session) => {
    const visita = await Visita.findById(visitaId).session(session);
    if (!visita) return null;

    for (const nombre of COLECCIONES_ASOCIADAS) {
      const total = await mongoose.connection.db
        .collection(nombre)
        .countDocuments({ visita_id: visita._id }, { session });
      if (total > 0) {
        throw errorValidacion(`La visita tiene registros en ${nombre} y no puede eliminarse`);
      }
    }

    const { deletedCount } = await Prescripcion.deleteMany({ visita_id: visita._id }, { session });
    await Visita.deleteOne({ _id: visita._id }, { session });
    await BitacoraAcceso.create(
      [{ usuario_id: usuarioId, paciente_id: visita.paciente_id, accion: "eliminar", origen }],
      { session }
    );

    return { visita_id: visita._id, prescripciones_eliminadas: deletedCount };
  });
}

module.exports = { eliminarVisitaConPrescripciones };
