const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.Types.ObjectId;
const opciones = { versionKey: false, autoCreate: false, autoIndex: false };
const req = (campo) => [true, `El campo ${campo} es obligatorio`];

const CentroSalud = mongoose.model(
  "CentroSalud",
  new Schema({
    nombre: { type: String, required: req("nombre"), trim: true },
    ubicacion: { type: String, required: req("ubicacion"), trim: true },
    servicios: [{ type: String, trim: true }],
  }, opciones),
  "centros_salud"
);

const PersonalMedico = mongoose.model(
  "PersonalMedico",
  new Schema({
    nombre: { type: String, required: req("nombre"), trim: true },
    especialidad: { type: String, required: req("especialidad"), trim: true },
    rol: {
      type: String,
      required: req("rol"),
      enum: { values: ["medico", "enfermeria", "laboratorio", "administrativo"], message: "Rol inválido" },
    },
    centro_id: { type: ObjectId, required: req("centro_id"), ref: "CentroSalud" },
  }, opciones),
  "personal_medico"
);

const Paciente = mongoose.model(
  "Paciente",
  new Schema({
    identificacion: { type: String, required: req("identificacion") },
    nombre: { type: String, required: req("nombre") },
    fecha_nacimiento: { type: Date, required: req("fecha_nacimiento") },
    sexo: {
      type: String,
      required: req("sexo"),
      enum: { values: ["Femenino", "Masculino", "Otro"], message: "Sexo inválido" },
    },
  }, opciones),
  "pacientes"
);

const Medicamento = mongoose.model(
  "Medicamento",
  new Schema({
    codigo: { type: String, required: req("codigo"), trim: true },
    nombre_generico: { type: String, required: req("nombre_generico"), trim: true },
    presentacion: { type: String, required: req("presentacion"), trim: true },
    via_administracion: { type: String, required: req("via_administracion"), trim: true },
  }, opciones),
  "medicamentos"
);

const Visita = mongoose.model(
  "Visita",
  new Schema({
    paciente_id: { type: ObjectId, required: req("paciente_id"), ref: "Paciente" },
    medico_id: { type: ObjectId, required: req("medico_id"), ref: "PersonalMedico" },
    centro_id: { type: ObjectId, required: req("centro_id"), ref: "CentroSalud" },
    fecha: { type: Date, default: Date.now },
    motivo: { type: String, required: req("motivo"), trim: true },
    formulario_ingreso: {
      sintomas: [{ type: String, trim: true }],
      antecedentes: { type: String, trim: true },
      alergias: [{ type: String, trim: true }],
    },
    signos_vitales: {
      temperatura_c: Number,
      frecuencia_cardiaca: Number,
      presion_sistolica: Number,
      presion_diastolica: Number,
      saturacion_oxigeno: Number,
      peso_kg: Number,
    },
    diagnosticos: [{
      _id: false,
      codigo: { type: String, required: req("codigo del diagnostico") },
      descripcion: { type: String, required: req("descripcion del diagnostico") },
    }],
    comentarios_medico: String,
  }, opciones),
  "visitas"
);

const Prescripcion = mongoose.model(
  "Prescripcion",
  new Schema({
    paciente_id: { type: ObjectId, required: req("paciente_id"), ref: "Paciente" },
    visita_id: { type: ObjectId, required: req("visita_id"), ref: "Visita" },
    medico_id: { type: ObjectId, required: req("medico_id"), ref: "PersonalMedico" },
    medicamento_id: { type: ObjectId, required: req("medicamento_id"), ref: "Medicamento" },
    codigo_medicamento: { type: String, trim: true },
    nombre_generico: { type: String, trim: true },
    dosis: { type: String, required: req("dosis"), trim: true },
    frecuencia: { type: String, required: req("frecuencia"), trim: true },
    duracion_dias: { type: Number, required: req("duracion_dias"), min: [1, "La duración mínima es de 1 día"] },
    fecha_emision: { type: Date, default: Date.now },
  }, opciones),
  "prescripciones"
);

module.exports = { CentroSalud, PersonalMedico, Paciente, Medicamento, Visita, Prescripcion };
