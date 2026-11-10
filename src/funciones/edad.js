function calcularEdad(fechaNacimiento, referencia = new Date()) {
  const nacimiento = new Date(fechaNacimiento);
  let edad = referencia.getUTCFullYear() - nacimiento.getUTCFullYear();
  const meses = referencia.getUTCMonth() - nacimiento.getUTCMonth();
  if (meses < 0 || (meses === 0 && referencia.getUTCDate() < nacimiento.getUTCDate())) {
    edad -= 1;
  }
  return edad;
}

module.exports = { calcularEdad };
