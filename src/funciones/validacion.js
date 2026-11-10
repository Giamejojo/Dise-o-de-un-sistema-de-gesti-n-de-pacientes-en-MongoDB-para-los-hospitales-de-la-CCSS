function errorValidacion(mensaje) {
  const error = new Error(mensaje);
  error.name = "ValidationError";
  return error;
}

function exigirTexto(valor, campo) {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw errorValidacion(`El campo ${campo} es obligatorio`);
  }
  return valor.trim();
}

module.exports = { errorValidacion, exigirTexto };
