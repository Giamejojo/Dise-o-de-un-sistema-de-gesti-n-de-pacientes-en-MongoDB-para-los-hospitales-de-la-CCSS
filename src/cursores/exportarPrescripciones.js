const { Prescripcion } = require("../models");

const ENCABEZADOS = [
  "fecha_emision", "codigo_medicamento", "nombre_generico", "dosis",
  "frecuencia", "duracion_dias", "paciente_id", "medico_id",
];

function aCsv(valor) {
  const texto = valor instanceof Date ? valor.toISOString() : String(valor ?? "");
  return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

async function exportarPrescripcionesCsv(salida) {
  const cursor = Prescripcion.find().sort({ fecha_emision: -1 }).batchSize(100).lean().cursor();
  let total = 0;
  salida.write(ENCABEZADOS.join(",") + "\n");
  for await (const prescripcion of cursor) {
    salida.write(ENCABEZADOS.map((campo) => aCsv(prescripcion[campo])).join(",") + "\n");
    total += 1;
  }
  return total;
}

module.exports = { exportarPrescripcionesCsv };
