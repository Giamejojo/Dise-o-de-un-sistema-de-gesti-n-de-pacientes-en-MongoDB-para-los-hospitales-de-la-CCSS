const express = require("express");
const { manejarError } = require("./crudBase");
const { BitacoraAcceso } = require("../models/bitacora");
const { registrarVisitaCompleta } = require("../procedimientos/registrarVisitaCompleta");
const { eliminarVisitaConPrescripciones } = require("../procedimientos/eliminarVisitaConPrescripciones");
const { consultarExpedienteAuditado } = require("../procedimientos/consultarExpedienteAuditado");

const router = express.Router();

router.post("/registrar-visita", async (req, res) => {
  try {
    const resultado = await registrarVisitaCompleta(req.body || {}, req.ip);
    res.status(201).json(resultado);
  } catch (error) {
    manejarError(res, error);
  }
});

router.delete("/visitas/:id", async (req, res) => {
  try {
    const resultado = await eliminarVisitaConPrescripciones(req.params.id, req.query.usuario_id, req.ip);
    if (!resultado) return res.status(404).json({ mensaje: "Visita no encontrada" });
    res.json(resultado);
  } catch (error) {
    manejarError(res, error);
  }
});

router.get("/expediente/:pacienteId", async (req, res) => {
  try {
    const expediente = await consultarExpedienteAuditado(req.params.pacienteId, req.query.usuario_id, req.ip);
    res.json(expediente);
  } catch (error) {
    manejarError(res, error);
  }
});

router.get("/bitacora", async (req, res) => {
  try {
    const registros = await BitacoraAcceso.find().sort({ fecha_hora: -1 }).limit(50).lean();
    res.json(registros);
  } catch (error) {
    manejarError(res, error);
  }
});

module.exports = router;
