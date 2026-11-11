# Sistema de gestión de pacientes de la CCSS

Proyecto final del curso Bases de Datos NoSQL (Universidad Fidélitas), Avance 2. Implementa en Node.js, Express y Mongoose el modelo de datos de diez colecciones diseñado en el Avance 1 para MongoDB.

Los datos de ejemplo son ficticios.

## Requisitos

- Node.js 22 o superior.
- MongoDB configurado como replica set, necesario para las transacciones. La cadena de conexión por defecto es `mongodb://127.0.0.1:27017/ccss_pacientes?replicaSet=rs0`.

## Instalación y ejecución

1. Instalar las dependencias:
npm install

2. Crear el archivo `.env` con una clave de cifrado de 32 bytes (no se sube al repositorio):
CLAVE_CIFRADO=<64 caracteres hexadecimales>

Se puede generar con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. El archivo `.env.example` muestra el formato.

3. Preparar la base de datos, en este orden:
npm run bd-crear
npm run bd-datos
npm run bd-vistas

4. Iniciar el servidor en `http://localhost:3000`:
npm run dev

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor con reinicio automático |
| `npm start` | Inicia el servidor |
| `npm run bd-crear` | Crea las 10 colecciones con validación de esquema e índices |
| `npm run bd-datos` | Carga datos de ejemplo (borra los datos existentes) |
| `npm run bd-vistas` | Crea las vistas de MongoDB |
| `npm run bd-diccionario` | Genera `docs/diccionario-de-datos.md` a partir de la base de datos |
| `npm run cursor-exportar` | Exporta las prescripciones a `reportes/prescripciones.csv` con un cursor |

## Estructura del proyecto

| Elemento | Ubicación | Descripción |
|---|---|---|
| Conexión | `src/config/db.js` | Conexión a MongoDB con Mongoose |
| Tablas | `src/database/esquemas.js`, `indices.js`, `crearColecciones.js` | Colecciones con validación `$jsonSchema` e índices |
| Diccionario de datos | `docs/diccionario-de-datos.md` | Campos, tipos, reglas e índices de cada colección |
| Funciones | `src/funciones/` | Cifrado AES-256-GCM, cálculo de edad, validaciones y presentación de pacientes, visitas y expedientes |
| CRUD | `src/routes/crudBase.js`, `src/routes/recursos.js` | Operaciones de las seis colecciones principales |
| Vistas | `src/vistas/` | Expediente del paciente, visitas con detalle, medicamentos más recetados y resumen por centro |
| Cursores | `src/cursores/` | Reporte CSV de prescripciones recorrido con un cursor |
| Procedimientos | `src/procedimientos/` | Operaciones transaccionales con bitácora de accesos |

## API

Todas las rutas empiezan con `/api`.

| Recurso | Ruta | Operaciones |
|---|---|---|
| Centros de salud | `/centros-salud` | CRUD |
| Personal médico | `/personal-medico` | CRUD, filtros `centro_id` y `rol` |
| Pacientes | `/pacientes` | CRUD, filtro `identificacion` |
| Medicamentos | `/medicamentos` | CRUD, filtros `codigo` y `nombre_generico` |
| Visitas | `/visitas` | CRUD, filtros `paciente_id`, `centro_id` y `medico_id` |
| Prescripciones | `/prescripciones` | CRUD, filtros `paciente_id`, `visita_id` y `medicamento_id` |

Cada recurso ofrece `POST /`, `GET /`, `GET /:id`, `PUT /:id` y `DELETE /:id`.

| Ruta | Descripción |
|---|---|
| `GET /salud` | Estado del servidor y de la conexión |
| `GET /vistas/expediente/:pacienteId` | Expediente completo de un paciente, con los datos descifrados |
| `GET /vistas/visitas-detalle` | Visitas con el nombre del centro y del médico |
| `GET /vistas/medicamentos-mas-recetados` | Medicamentos ordenados por prescripciones |
| `GET /vistas/resumen-centros` | Visitas y pacientes por centro |
| `GET /reportes/prescripciones.csv` | Reporte de prescripciones en CSV |
| `POST /procedimientos/registrar-visita` | Registra una visita con sus prescripciones y su bitácora en una transacción |
| `DELETE /procedimientos/visitas/:id?usuario_id=` | Elimina una visita y sus prescripciones en una transacción |
| `GET /procedimientos/expediente/:pacienteId?usuario_id=` | Consulta un expediente y registra el acceso antes de entregarlo |
| `GET /procedimientos/bitacora` | Últimos accesos registrados |

## Seguridad

- La identificación del paciente se cifra de forma determinística, lo que permite buscarla por igualdad. El nombre y los comentarios médicos se cifran de forma aleatoria.
- La clave de cifrado se lee de la variable `CLAVE_CIFRADO` y no se versiona.
- Las colecciones rechazan los documentos que no cumplen su esquema.
- Los accesos a la información de los pacientes quedan registrados en la colección `bitacora_accesos`.
- Los procedimientos validan las referencias entre colecciones, porque MongoDB no tiene llaves foráneas.

## Autor

Giancarlo Orozco Durán. Universidad Fidélitas, Facultad de Ciencias de la Computación.
