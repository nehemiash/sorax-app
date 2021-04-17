const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let parteAppleSchema = new Schema({
    vpn: String,
    descripcion: String,
    sku: String,
    precioStock: Number,
    precioExch: Number,
    precioReg: Number,
    coreValue: Number,
}, { versionKey: false });

module.exports = mongoose.model("ParteApple", parteAppleSchema);