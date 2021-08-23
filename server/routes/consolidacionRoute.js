const express = require("express");

let { verificaToken } = require("../middlewares/autenticacion");

const consolidacionCtrl = require("../controller/consolidacionController");

let app = express();

app.get("/consolidacion", verificaToken, consolidacionCtrl.listar);
app.get("/consolidacion/:id", verificaToken, consolidacionCtrl.mostrarPorId);
app.post("/consolidacion", verificaToken, consolidacionCtrl.crear);
app.put("/consolidacion/:id", verificaToken, consolidacionCtrl.actualizar);
app.delete("/consolidacion/:id", verificaToken, consolidacionCtrl.eliminar);
app.get("/consolidacion/buscar/:termino", verificaToken, consolidacionCtrl.buscar);

module.exports = app;