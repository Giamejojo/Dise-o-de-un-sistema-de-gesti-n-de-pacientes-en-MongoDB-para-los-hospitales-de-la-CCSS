const mongoose = require("mongoose");
const { errorValidacion } = require("../funciones/validacion");

const OPCIONES_TRANSACCION = {
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" },
};

function ejecutarTransaccion(operacion) {
  return mongoose.connection.transaction(operacion, OPCIONES_TRANSACCION);
}

async function exigirExistente(Modelo, id, nombre, session = null) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    throw errorValidacion(`Identificador inválido de ${nombre}`);
  }
  const existe = await Modelo.exists({ _id: id }).session(session);
  if (!existe) throw errorValidacion(`${nombre} no encontrado`);
}

module.exports = { ejecutarTransaccion, exigirExistente };
