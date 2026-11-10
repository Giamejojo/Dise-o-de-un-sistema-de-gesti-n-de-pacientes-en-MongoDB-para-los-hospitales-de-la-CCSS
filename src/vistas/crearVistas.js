const mongoose = require("mongoose");
const conectarDB = require("../config/db");
const VISTAS = require("./definiciones");

async function crearVistas() {
  try {
    await conectarDB();
    const db = mongoose.connection.db;
    const existentes = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name);

    for (const vista of VISTAS) {
      if (existentes.includes(vista.nombre)) {
        await db.dropCollection(vista.nombre);
      }
      await db.createCollection(vista.nombre, { viewOn: vista.origen, pipeline: vista.pipeline });
      console.log(`Vista creada: ${vista.nombre} (sobre ${vista.origen})`);
    }
    console.log(`${VISTAS.length} vistas listas`);
  } catch (error) {
    console.error("Error al crear las vistas:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

crearVistas();
