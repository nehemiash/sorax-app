const express = require("express");

let { verificaToken } = require("../middlewares/autenticacion");

let app = express();

const logCtrl = require("../controller/logController");

app.get("/log", verificaToken, logCtrl.listarPorOrdenId);
app.get("/log/:id", verificaToken, logCtrl.listarPorOrdenId);
app.post("/log", verificaToken, logCtrl.agregar);

module.exports = app;