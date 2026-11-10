const { cifrarAleatorio, cifrarDeterministico, descifrar } = require("./cifrado");
const { calcularEdad } = require("./edad");
const { exigirTexto } = require("./validacion");

function normalizarIdentificacion(identificacion) {
  return String(identificacion).replace(/[\s-]/g, "");
}

function prepararPaciente(datos) {
  const resultado = { ...datos };
  if (resultado.identificacion !== undefined) {
    const identificacion = exigirTexto(resultado.identificacion, "identificacion");
    resultado.identificacion = cifrarDeterministico(normalizarIdentificacion(identificacion));
  }
  if (resultado.nombre !== undefined) {
    resultado.nombre = cifrarAleatorio(exigirTexto(resultado.nombre, "nombre"));
  }
  return resultado;
}

function presentarPaciente(documento) {
  const paciente = documento.toObject();
  paciente.identificacion = descifrar(paciente.identificacion);
  paciente.nombre = descifrar(paciente.nombre);
  paciente.edad = calcularEdad(paciente.fecha_nacimiento);
  return paciente;
}

function filtroPaciente(consulta) {
  if (consulta.identificacion === undefined) return {};
  return { identificacion: cifrarDeterministico(normalizarIdentificacion(consulta.identificacion)) };
}

module.exports = { normalizarIdentificacion, prepararPaciente, presentarPaciente, filtroPaciente };
