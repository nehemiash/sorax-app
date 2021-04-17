const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let etapaSchema = new Schema({
    sigla: String,
    color: String,
    descripcion: String,
}, { versionKey: false });

module.exports = mongoose.model("Etapa", etapaSchema);