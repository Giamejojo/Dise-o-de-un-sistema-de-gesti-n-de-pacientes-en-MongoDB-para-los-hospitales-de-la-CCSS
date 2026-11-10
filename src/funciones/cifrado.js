const crypto = require("crypto");

const CLAVE_DESARROLLO = "clave-solo-para-desarrollo-no-usar-en-produccion";

function obtenerClaveMaestra() {
  const valor = process.env.CLAVE_CIFRADO;
  if (!valor) {
    console.warn("Advertencia: CLAVE_CIFRADO no está definida; se usa una clave de desarrollo");
    return crypto.createHash("sha256").update(CLAVE_DESARROLLO).digest();
  }
  const clave = Buffer.from(valor, "hex");
  if (clave.length !== 32) {
    throw new Error("CLAVE_CIFRADO debe tener 64 caracteres hexadecimales (32 bytes)");
  }
  return clave;
}

const MAESTRA = obtenerClaveMaestra();

function derivar(etiqueta) {
  return crypto.createHmac("sha256", MAESTRA).update(etiqueta).digest();
}

const CLAVE_DATOS = derivar("datos");
const CLAVE_IV = derivar("iv");

function cifrarConIv(texto, iv) {
  const cifrador = crypto.createCipheriv("aes-256-gcm", CLAVE_DATOS, iv);
  const cifrado = Buffer.concat([cifrador.update(String(texto), "utf8"), cifrador.final()]);
  return Buffer.concat([iv, cifrador.getAuthTag(), cifrado]).toString("base64");
}

function cifrarAleatorio(texto) {
  return cifrarConIv(texto, crypto.randomBytes(12));
}

function cifrarDeterministico(texto) {
  const iv = crypto.createHmac("sha256", CLAVE_IV).update(String(texto)).digest().subarray(0, 12);
  return cifrarConIv(texto, iv);
}

function descifrar(token) {
  const datos = Buffer.from(token, "base64");
  const iv = datos.subarray(0, 12);
  const etiqueta = datos.subarray(12, 28);
  const cifrado = datos.subarray(28);
  const descifrador = crypto.createDecipheriv("aes-256-gcm", CLAVE_DATOS, iv);
  descifrador.setAuthTag(etiqueta);
  return Buffer.concat([descifrador.update(cifrado), descifrador.final()]).toString("utf8");
}

module.exports = { cifrarAleatorio, cifrarDeterministico, descifrar };
