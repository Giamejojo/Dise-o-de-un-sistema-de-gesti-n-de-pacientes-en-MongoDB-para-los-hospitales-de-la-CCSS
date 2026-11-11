const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.Types.ObjectId;
const req = (campo) => [true, `El campo ${campo} es obligatorio`];

const BitacoraAcceso = mongoose.model(
  "BitacoraAcceso",
  new Schema({
    usuario_id: { type: ObjectId, required: req("usuario_id"), ref: "PersonalMedico" },
    paciente_id: { type: ObjectId, required: req("paciente_id"), ref: "Paciente" },
    accion: {
      type: String,
      required: req("accion"),
      enum: { values: ["consultar", "crear", "actualizar", "eliminar"], message: "Acción inválida" },
    },
    fecha_hora: { type: Date, default: Date.now },
    origen: { type: String, required: req("origen"), trim: true },
  }, { versionKey: false, autoCreate: false, autoIndex: false }),
  "bitacora_accesos"
);

module.exports = { BitacoraAcceso };
