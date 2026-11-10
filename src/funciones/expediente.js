const { descifrar } = require("./cifrado");
const { calcularEdad } = require("./edad");

function presentarExpediente(expediente) {
  return {
    ...expediente,
    identificacion: descifrar(expediente.identificacion),
    nombre: descifrar(expediente.nombre),
    edad: calcularEdad(expediente.fecha_nacimiento),
    visitas: (expediente.visitas || []).map((visita) =>
      visita.comentarios_medico
        ? { ...visita, comentarios_medico: descifrar(visita.comentarios_medico) }
        : visita
    ),
  };
}

module.exports = { presentarExpediente };
