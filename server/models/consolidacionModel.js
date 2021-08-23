const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let consolidacionSchema = new Schema({
    numero: Number,
    tipo: String,
    cobertura: String,
    courier: String,
    guia: String,
    ids: [{
        type: Schema.Types.ObjectId,
        ref: "Kbb",
    }, ],
    creada: Date,
    retornada: Date,
    cantidad: String,
    activa: {
        type: Boolean,
        default: true,
    },
    status: String,
}, { versionKey: false });

module.exports = mongoose.model("Consolidacion", consolidacionSchema);