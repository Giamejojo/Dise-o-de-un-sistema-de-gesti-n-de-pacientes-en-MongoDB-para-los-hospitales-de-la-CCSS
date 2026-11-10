const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const conectarDB = require("../config/db");

const TIPOS = {
  objectId: "ObjectId",
  string: "texto",
  date: "fecha",
  object: "objeto",
  number: "número",
};

function nombreTipo(def) {
  if (!def || !def.bsonType) return "mixto";
  if (def.bsonType === "number" && def.multipleOf === 1) return "entero";
  if (def.bsonType === "array") return `arreglo de ${nombreTipo(def.items)}`;
  return TIPOS[def.bsonType] || def.bsonType;
}

function describir(def) {
  const partes = [def.description || ""];
  if (def.enum) partes.push(`Valores permitidos: ${def.enum.join(", ")}.`);
  return partes.filter(Boolean).join(" ");
}

function aplanar(esquema, prefijo = "") {
  const filas = [];
  const requeridos = esquema.required || [];
  for (const [campo, def] of Object.entries(esquema.properties || {})) {
    const ruta = prefijo + campo;
    filas.push({
      ruta,
      tipo: nombreTipo(def),
      requerido: requeridos.includes(campo) ? "Sí" : "No",
      descripcion: describir(def),
    });
    if (def.bsonType === "object") filas.push(...aplanar(def, `${ruta}.`));
    if (def.bsonType === "array" && def.items && def.items.bsonType === "object") {
      filas.push(...aplanar(def.items, `${ruta}[].`));
    }
  }
  return filas;
}

async function generarDiccionario() {
  try {
    await conectarDB();
    const db = mongoose.connection.db;
    const infos = await db.listCollections().toArray();
    infos.sort((a, b) => a.name.localeCompare(b.name));

    const lineas = ["# Diccionario de datos", "", `Base de datos: \`${db.databaseName}\``, ""];

    for (const info of infos) {
      const esquema = info.options && info.options.validator && info.options.validator.$jsonSchema;
      if (!esquema) continue;
      const filas = aplanar(esquema);
      const indices = await db.collection(info.name).indexes();

      lineas.push(`## ${info.name}`, "", esquema.description || "", "");
      lineas.push("| Campo | Tipo | Obligatorio | Descripción |", "|---|---|---|---|");
      filas.forEach((f) => lineas.push(`| ${f.ruta} | ${f.tipo} | ${f.requerido} | ${f.descripcion} |`));
      lineas.push("", "Índices:", "");
      indices.forEach((i) => {
        const claves = Object.entries(i.key).map(([k, v]) => `${k}: ${v}`).join(", ");
        lineas.push(`- ${i.name} (${claves})${i.unique ? ", único" : ""}`);
      });
      lineas.push("");
      console.log(`${info.name}: ${filas.length} campos, ${indices.length} índices`);
    }

    const destino = path.join(__dirname, "..", "..", "docs", "diccionario-de-datos.md");
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, lineas.join("\n"), "utf8");
    console.log("Diccionario generado en docs/diccionario-de-datos.md");
  } catch (error) {
    console.error("Error al generar el diccionario:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

generarDiccionario();
