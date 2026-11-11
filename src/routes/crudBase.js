const express = require("express");
const mongoose = require("mongoose");

function manejarError(res, error) {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ mensaje: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ mensaje: "Ya existe un registro con ese valor único" });
  }
  if (error.code === 121) {
    return res.status(400).json({ mensaje: "El documento no cumple la validación de la colección" });
  }
  console.error("Error:", error);
  res.status(500).json({ mensaje: "Error interno del servidor" });
}

function crearRouterCrud(Modelo, opciones) {
  const {
    nombre,
    campos,
    preparar = (datos) => datos,
    presentar = (documento) => documento.toObject(),
    construirFiltro = () => ({}),
  } = opciones;

  const router = express.Router();

  router.param("id", (req, res, next, id) => {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ mensaje: "Identificador inválido" });
    }
    next();
  });

  function extraerCampos(cuerpo = {}) {
    const datos = {};
    campos.forEach((campo) => {
      if (cuerpo[campo] !== undefined) datos[campo] = cuerpo[campo];
    });
    return datos;
  }

  router.post("/", async (req, res) => {
    try {
      const documento = await Modelo.create(preparar(extraerCampos(req.body)));
      res.status(201).json(presentar(documento));
    } catch (error) {
      manejarError(res, error);
    }
  });

  router.get("/", async (req, res) => {
    try {
      const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 50, 1), 200);
      const documentos = await Modelo.find(construirFiltro(req.query)).sort({ _id: -1 }).limit(limite);
      res.json(documentos.map((documento) => presentar(documento)));
    } catch (error) {
      manejarError(res, error);
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const documento = await Modelo.findById(req.params.id);
      if (!documento) return res.status(404).json({ mensaje: `${nombre} no encontrado` });
      res.json(presentar(documento));
    } catch (error) {
      manejarError(res, error);
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      const documento = await Modelo.findByIdAndUpdate(
        req.params.id,
        preparar(extraerCampos(req.body)),
        { new: true, runValidators: true }
      );
      if (!documento) return res.status(404).json({ mensaje: `${nombre} no encontrado` });
      res.json(presentar(documento));
    } catch (error) {
      manejarError(res, error);
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const documento = await Modelo.findByIdAndDelete(req.params.id);
      if (!documento) return res.status(404).json({ mensaje: `${nombre} no encontrado` });
      res.json({ mensaje: `${nombre} eliminado` });
    } catch (error) {
      manejarError(res, error);
    }
  });

  return router;
}

module.exports = { crearRouterCrud, manejarError };


