const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let kbbSchema = new Schema({
    sro: String,
    gsxNum: String,
    pedido: String,
    orden: String,
    ordenId: {
        type: Schema.Types.ObjectId,
        ref: "Orden",
    },
    parte: {
        type: Schema.Types.ObjectId,
        ref: "ParteApple",
    },
    kbb: String,
    kgb: String,
    guiaImp: String,
    guiaExp: String,
    consolidado: {
        type: Boolean,
        default: false,
    },
    cobertura: String,
    estado: {
        type: Boolean,
        default: true,
    },
    situacion: String,
    invoice: String,
    fechaInv: Date,
    factura: String,
    costo: Number,
    servicio: Number,
    centro: String,
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
    },
    entrada: Date,
    salida: Date,
    financiero: {
        type: Boolean,
        default: false,
    },
    financieroFec: Date,
    obs: String,
    tecnico: {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
    },
}, { versionKey: false });
module.exports = mongoose.model("Kbb", kbbSchema);