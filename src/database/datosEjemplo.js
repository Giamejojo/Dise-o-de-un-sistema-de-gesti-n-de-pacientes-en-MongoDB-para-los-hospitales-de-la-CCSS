const mongoose = require("mongoose");
const conectarDB = require("../config/db");
const {
  CentroSalud, PersonalMedico, Paciente, Medicamento, Visita, Prescripcion,
} = require("../models");
const { prepararPaciente } = require("../funciones/pacientes");
const { prepararVisita } = require("../funciones/visitas");

const dia = (texto) => new Date(`${texto}T14:00:00Z`);

const COLECCIONES = [
  "bitacora_accesos", "cirugias", "estudios_imagen", "resultados_laboratorio",
  "prescripciones", "visitas", "medicamentos", "pacientes", "personal_medico", "centros_salud",
];

async function cargarDatos() {
  try {
    await conectarDB();
    const db = mongoose.connection.db;
    for (const nombre of COLECCIONES) {
      await db.collection(nombre).deleteMany({});
    }

    const centros = await CentroSalud.insertMany([
      { nombre: "Hospital Calderón Guardia", ubicacion: "San José, San José, Merced", servicios: ["Urgencias", "Medicina interna", "Laboratorio"] },
      { nombre: "Hospital San Juan de Dios", ubicacion: "San José, San José, Catedral", servicios: ["Cirugía", "Pediatría", "Imagenología"] },
    ]);

    const medicos = await PersonalMedico.insertMany([
      { nombre: "Luis Vargas Solís", especialidad: "Medicina interna", rol: "medico", centro_id: centros[0]._id },
      { nombre: "Carmen Solano Rojas", especialidad: "Pediatría", rol: "medico", centro_id: centros[1]._id },
      { nombre: "Jorge Araya Mora", especialidad: "Cirugía general", rol: "medico", centro_id: centros[1]._id },
      { nombre: "Marta Quesada León", especialidad: "Enfermería", rol: "enfermeria", centro_id: centros[0]._id },
    ]);

    const pacientes = await Paciente.insertMany([
      { identificacion: "1-0234-0567", nombre: "Ana Mora Jiménez", fecha_nacimiento: dia("1990-05-14"), sexo: "Femenino" },
      { identificacion: "2-0456-0789", nombre: "Carlos Rojas Castro", fecha_nacimiento: dia("1978-11-02"), sexo: "Masculino" },
      { identificacion: "1-0987-0654", nombre: "María Fernanda Solís", fecha_nacimiento: dia("2001-03-21"), sexo: "Femenino" },
      { identificacion: "3-0123-0456", nombre: "José Pablo Vargas", fecha_nacimiento: dia("1965-07-30"), sexo: "Masculino" },
      { identificacion: "4-0222-0111", nombre: "Daniel Jiménez Mora", fecha_nacimiento: dia("2016-09-17"), sexo: "Masculino" },
    ].map(prepararPaciente));

    const medicamentos = await Medicamento.insertMany([
      { codigo: "MED-0001", nombre_generico: "Paracetamol", presentacion: "Tabletas de 500 mg", via_administracion: "Oral" },
      { codigo: "MED-0002", nombre_generico: "Ibuprofeno", presentacion: "Tabletas de 400 mg", via_administracion: "Oral" },
      { codigo: "MED-0003", nombre_generico: "Amoxicilina", presentacion: "Cápsulas de 500 mg", via_administracion: "Oral" },
      { codigo: "MED-0004", nombre_generico: "Losartán", presentacion: "Tabletas de 50 mg", via_administracion: "Oral" },
      { codigo: "MED-0005", nombre_generico: "Metformina", presentacion: "Tabletas de 850 mg", via_administracion: "Oral" },
      { codigo: "MED-0006", nombre_generico: "Omeprazol", presentacion: "Cápsulas de 20 mg", via_administracion: "Oral" },
    ]);

    const datosVisitas = [
      [0, 0, 0, "2026-10-05", "Dolor de cabeza persistente", ["G43.9", "Migraña, no especificada"], "Se recomienda reposo y control en dos semanas"],
      [1, 0, 0, "2026-10-12", "Control de presión arterial", ["I10", "Hipertensión esencial"], "Presión estable, continuar tratamiento"],
      [2, 1, 1, "2026-10-18", "Dolor de garganta y fiebre", ["J03.9", "Amigdalitis aguda"], "Se indica reposo e hidratación"],
      [3, 0, 0, "2026-10-22", "Control de diabetes", ["E11.9", "Diabetes mellitus tipo 2"], "Glucosa controlada, mantener dieta"],
      [4, 1, 1, "2026-10-29", "Fiebre y malestar general", ["J06.9", "Infección aguda de vías respiratorias superiores"], "Control en tres días si persiste la fiebre"],
      [0, 0, 0, "2026-11-02", "Seguimiento de migraña", ["G43.9", "Migraña, no especificada"], "Mejoría parcial, ajustar tratamiento"],
      [1, 0, 0, "2026-11-04", "Dolor abdominal", ["K29.7", "Gastritis, no especificada"], "Evitar irritantes y comidas pesadas"],
      [3, 2, 1, "2026-11-06", "Dolor en el costado derecho del abdomen", ["K35.8", "Apendicitis aguda"], "Se programa cirugía de urgencia"],
    ];

    const visitas = await Visita.insertMany(
      datosVisitas.map(([p, m, c, fecha, motivo, dx, comentario]) =>
        prepararVisita({
          paciente_id: pacientes[p]._id,
          medico_id: medicos[m]._id,
          centro_id: centros[c]._id,
          fecha: dia(fecha),
          motivo,
          diagnosticos: [{ codigo: dx[0], descripcion: dx[1] }],
          comentarios_medico: comentario,
        })
      )
    );

    const datosRecetas = [
      [0, 0, "500 mg", "Cada 8 horas", 5],
      [1, 3, "50 mg", "Cada 24 horas", 30],
      [2, 2, "500 mg", "Cada 8 horas", 7],
      [2, 0, "500 mg", "Cada 8 horas", 3],
      [3, 4, "850 mg", "Cada 12 horas", 30],
      [4, 0, "250 mg", "Cada 6 horas", 3],
      [4, 2, "250 mg", "Cada 8 horas", 7],
      [5, 1, "400 mg", "Cada 8 horas", 5],
      [5, 0, "500 mg", "Cada 8 horas", 5],
      [6, 5, "20 mg", "Cada 24 horas", 14],
      [7, 1, "400 mg", "Cada 8 horas", 3],
      [7, 0, "500 mg", "Cada 8 horas", 3],
    ];

    await Prescripcion.insertMany(
      datosRecetas.map(([v, m, dosis, frecuencia, dias]) => ({
        paciente_id: visitas[v].paciente_id,
        visita_id: visitas[v]._id,
        medico_id: visitas[v].medico_id,
        medicamento_id: medicamentos[m]._id,
        codigo_medicamento: medicamentos[m].codigo,
        nombre_generico: medicamentos[m].nombre_generico,
        dosis,
        frecuencia,
        duracion_dias: dias,
        fecha_emision: visitas[v].fecha,
      }))
    );

    await db.collection("resultados_laboratorio").insertOne({
      paciente_id: pacientes[3]._id,
      visita_id: visitas[3]._id,
      fecha: dia("2026-10-22"),
      pruebas: [
        { nombre: "Glucosa en ayunas", valor: 112, unidad: "mg/dL", rango_referencia: "70-100" },
        { nombre: "Hemoglobina glicosilada", valor: 6.8, unidad: "%", rango_referencia: "menor a 5.7" },
      ],
    });

    await db.collection("estudios_imagen").insertOne({
      paciente_id: pacientes[3]._id,
      visita_id: visitas[7]._id,
      tipo: "Ultrasonido abdominal",
      fecha: dia("2026-11-06"),
      interpretacion: "Apéndice engrosado con signos de inflamación",
      archivo_uri: "almacenamiento-externo://imagenes/us-abdominal-0001",
    });

    await db.collection("cirugias").insertOne({
      paciente_id: pacientes[3]._id,
      visita_id: visitas[7]._id,
      procedimiento: "Apendicectomía laparoscópica",
      fecha: dia("2026-11-07"),
      etapas: [
        { orden: 1, descripcion: "Anestesia general" },
        { orden: 2, descripcion: "Extirpación del apéndice" },
        { orden: 3, descripcion: "Cierre y recuperación" },
      ],
      equipo: [
        { medico_id: medicos[2]._id, rol: "Cirujano principal" },
        { medico_id: medicos[3]._id, rol: "Enfermería de apoyo" },
      ],
    });

    for (const nombre of COLECCIONES.slice().reverse()) {
      const total = await db.collection(nombre).countDocuments();
      console.log(`${nombre}: ${total}`);
    }
    console.log("Datos de ejemplo cargados");
  } catch (error) {
    console.error("Error al cargar los datos:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

cargarDatos();
