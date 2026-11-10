const express = require("express");
const { exportarPrescripcionesCsv } = require("../cursores/exportarPrescripciones");

const router = express.Router();

router.get("/prescripciones.csv", async (req, res) => {
  try {
    res.set({
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="prescripciones.csv"',
    });
    await exportarPrescripcionesCsv(res);
    res.end();
  } catch (error) {
    console.error("Error:", error.message);
    if (res.headersSent) return res.end();
    res.status(500).json({ mensaje: "No se pudo generar el reporte" });
  }
});

module.exports = router;
