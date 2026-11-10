const mongoose = require("mongoose");
const conectarDB = require("../config/db");
const ESQUEMAS = require("./esquemas");
const INDICES = require("./indices");

async function crearColecciones() {
  try {
    await conectarDB();
    const db = mongoose.connection.db;
    const existentes = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name);

    for (const [nombre, esquema] of Object.entries(ESQUEMAS)) {
      const opciones = {
        validator: { $jsonSchema: esquema },
        validationLevel: "strict",
        validationAction: "error",
      };
      if (existentes.includes(nombre)) {
        await db.command({ collMod: nombre, ...opciones });
        console.log(`Colección actualizada: ${nombre}`);
      } else {
        await db.createCollection(nombre, opciones);
        console.log(`Colección creada: ${nombre}`);
      }
      for (const { campos, opciones: opcionesIndice } of INDICES[nombre] || []) {
        await db.collection(nombre).createIndex(campos, opcionesIndice);
      }
    }
    console.log(`${Object.keys(ESQUEMAS).length} colecciones listas`);
  } catch (error) {
    console.error("Error al crear las colecciones:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

crearColecciones();
