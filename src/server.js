const express = require("express");
const mongoose = require("mongoose");
const conectarDB = require("./config/db");
const recursos = require("./routes/recursos");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/salud", (req, res) => {
  const conectada = mongoose.connection.readyState === 1;
  res.json({
    estado: "ok",
    baseDatos: mongoose.connection.name,
    conexion: conectada ? "conectada" : "desconectada",
  });
});

app.use("/api/centros-salud", recursos.centros);
app.use("/api/personal-medico", recursos.personal);
app.use("/api/pacientes", recursos.pacientes);
app.use("/api/medicamentos", recursos.medicamentos);
app.use("/api/visitas", recursos.visitas);
app.use("/api/prescripciones", recursos.prescripciones);

conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
});
