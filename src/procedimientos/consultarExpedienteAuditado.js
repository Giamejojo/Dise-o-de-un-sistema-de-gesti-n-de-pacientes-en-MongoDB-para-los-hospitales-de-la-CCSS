const mongoose = require("mongoose");
const { Paciente, PersonalMedico } = require("../models");
const { BitacoraAcceso } = require("../models/bitacora");
const { presentarExpediente } = require("../funciones/expediente");
const { exigirExistente } = require("./comun");

async function consultarExpedienteAuditado(pacienteId, usuarioId, origen = "api") {
  await exigirExistente(PersonalMedico, usuarioId, "Funcionario");
  await exigirExistente(Paciente, pacienteId, "Paciente");

  await BitacoraAcceso.create({
    usuario_id: usuarioId,
    paciente_id: pacienteId,
    accion: "consultar",
    origen,
  });

  const expediente = await mongoose.connection.db
    .collection("vista_expediente_paciente")
    .findOne({ _id: new mongoose.Types.ObjectId(pacienteId) });

  return presentarExpediente(expediente);
}

module.exports = { consultarExpedienteAuditado };
