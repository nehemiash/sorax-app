const express = require("express");

const { verificaToken } = require("../middlewares/autenticacion");

const parteappleCtrl = require("../controller/parteAppleController");
let app = express();

app.get("/parteapple", verificaToken, parteappleCtrl.listar);
app.get("/parteapple/vpn", verificaToken, parteappleCtrl.mostrarPorParte);
app.get("/parteapple/:id", verificaToken, parteappleCtrl.mostrarPorId);
app.get("/parteapple/buscar/:termino", verificaToken, parteappleCtrl.buscar);
app.post("/parteapple", verificaToken, parteappleCtrl.crear);
app.put("/parteapple/:id", verificaToken, parteappleCtrl.actualizar);

module.exports = app;