const express = require("express");
const mongoose = require("mongoose");
const { presentarExpediente } = require("../funciones/expediente");

const VISTAS = {
  "visitas-detalle": "vista_visitas_detalle",
  "medicamentos-mas-recetados": "vista_medicamentos_mas_recetados",
  "resumen-centros": "vista_resumen_centros",
};

const router = express.Router();

router.get("/expediente/:pacienteId", async (req, res) => {
  const { pacienteId } = req.params;
  if (!mongoose.isValidObjectId(pacienteId)) {
    return res.status(400).json({ mensaje: "Identificador inválido" });
  }
  try {
    const expediente = await mongoose.connection.db
      .collection("vista_expediente_paciente")
      .findOne({ _id: new mongoose.Types.ObjectId(pacienteId) });
    if (!expediente) return res.status(404).json({ mensaje: "Paciente no encontrado" });
    res.json(presentarExpediente(expediente));
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

router.get("/:nombre", async (req, res) => {
  const vista = VISTAS[req.params.nombre];
  if (!vista) {
    return res.status(404).json({
      mensaje: `Vista no disponible. Opciones: ${Object.keys(VISTAS).join(", ")}`,
    });
  }
  try {
    const filas = await mongoose.connection.db.collection(vista).find().limit(100).toArray();
    res.json(filas);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

module.exports = router;
