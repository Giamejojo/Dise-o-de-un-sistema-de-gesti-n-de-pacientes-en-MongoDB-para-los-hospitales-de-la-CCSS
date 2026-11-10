const express = require("express");
const mongoose = require("mongoose");
const conectarDB = require("./config/db");

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

conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
});
