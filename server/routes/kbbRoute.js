const express = require("express");

const { verificaToken } = require("../middlewares/autenticacion");

const kbbCtrl = require("../controller/kbbController");

let app = express();

app.get("/kbb", verificaToken, kbbCtrl.listar);
app.get("/kbbcentro", verificaToken, kbbCtrl.listarCentro);
app.get("/kbbstatus", verificaToken, kbbCtrl.status);
app.get("/kbb/:id", verificaToken, kbbCtrl.mostrarPorId);
app.get("/kbb/buscar/:termino", verificaToken, kbbCtrl.buscar);
app.get("/kbb/buscarfiltrado/:termino", verificaToken, kbbCtrl.buscarFiltrado);
app.post("/kbb", verificaToken, kbbCtrl.crear);
app.put("/kbb/:id", verificaToken, kbbCtrl.actualizar);
app.put("/retornarkbb/:id", verificaToken, kbbCtrl.retornar);
app.post("/kbbarchivo", verificaToken, kbbCtrl.buscarMultiple);
app.put("/retornartodo", verificaToken, kbbCtrl.retornarMultiple);
app.put("/retirada", verificaToken, kbbCtrl.retiradaMultiple);
app.get("/kbbtodo", verificaToken, kbbCtrl.listarTodo);

module.exports = app;