const { cifrarAleatorio, descifrar } = require("./cifrado");
const { errorValidacion } = require("./validacion");

function prepararVisita(datos) {
  const resultado = { ...datos };
  if (resultado.comentarios_medico !== undefined) {
    if (typeof resultado.comentarios_medico !== "string") {
      throw errorValidacion("El campo comentarios_medico debe ser texto");
    }
    resultado.comentarios_medico = cifrarAleatorio(resultado.comentarios_medico);
  }
  return resultado;
}

function presentarVisita(documento) {
  const visita = documento.toObject();
  if (visita.comentarios_medico) {
    visita.comentarios_medico = descifrar(visita.comentarios_medico);
  }
  return visita;
}

module.exports = { prepararVisita, presentarVisita };
