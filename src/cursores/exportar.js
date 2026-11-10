const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const conectarDB = require("../config/db");
const { exportarPrescripcionesCsv } = require("./exportarPrescripciones");

async function exportar() {
  try {
    await conectarDB();
    const carpeta = path.join(__dirname, "..", "..", "reportes");
    fs.mkdirSync(carpeta, { recursive: true });
    const archivo = fs.createWriteStream(path.join(carpeta, "prescripciones.csv"), { encoding: "utf8" });
    const total = await exportarPrescripcionesCsv(archivo);
    await new Promise((resolver) => archivo.end(resolver));
    console.log(`${total} prescripciones exportadas a reportes/prescripciones.csv`);
  } catch (error) {
    console.error("Error al exportar las prescripciones:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

exportar();
