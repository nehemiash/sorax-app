const express = require("express");

let { verificaToken } = require("../middlewares/autenticacion");

let app = express();

const etapaCtrl = require("../controller/etapaController");

app.get("/etapa", verificaToken, etapaCtrl.listar);
app.get("/etapa/:id", verificaToken, etapaCtrl.mostrarPorId);
app.post("/etapa", verificaToken, etapaCtrl.agregar);
app.put("/etapa/:id", verificaToken, etapaCtrl.actualizar);
app.delete("/etapa/:id", [verificaToken], etapaCtrl.eliminar);

module.exports = app;