const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let LogSchema = new Schema({
    orden: {
        type: Schema.Types.ObjectId,
        ref: "Orden",
    },
    fecha: Date,
    descripcion: String,
    icono: String,
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
    },
}, { versionKey: false });

module.exports = mongoose.model("Log", LogSchema);