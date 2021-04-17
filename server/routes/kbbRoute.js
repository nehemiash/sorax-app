const express = require("express");

const { verificaToken } = require("../middlewares/autenticacion");

const kbbCtrl = require("../controller/kbbController");

let app = express();

app.get("/kbb", verificaToken, kbbCtrl.listar);
app.get("/kbb/:id", verificaToken, kbbCtrl.mostrarPorId);
app.get("/kbb/buscar/:termino", verificaToken, kbbCtrl.buscar);
app.post("/kbb", verificaToken, kbbCtrl.crear);
app.put("/kbb/:id", verificaToken, kbbCtrl.actualizar);
app.put("/retornarkbb/:id", verificaToken, kbbCtrl.retornar);

module.exports = app;