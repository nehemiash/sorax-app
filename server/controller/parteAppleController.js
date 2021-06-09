const ParteApple = require("../models/parteApple");
const _ = require("underscore");
const { QueryOpts } = require("../controller/dbconfig");

let listar = (req, res) => {
    let pagina = Number(req.query.pagina) || 1;
    let limite = Number(req.query.limite) || 15;
    let sort = req.query.sort || "descripcion";

    let skip = pagina - 1;
    skip = skip * limite;
    let total_paginas;
    let total_parteapple;

    ParteApple.countDocuments({}, (err, numOfDocs) => {
        if (err) throw err;
        total_paginas = Math.ceil(numOfDocs / limite);
        total_parteapple = numOfDocs;
    });

    ParteApple.find({})
        .skip(skip)
        .limit(limite)

    .sort(sort)
        .exec((err, partes_apple) => {
            if (err) {
                return res.json({
                    ok: false,
                    err,
                });
            }
            res.json({
                ok: true,
                pagina,
                total_paginas,
                total_parteapple,
                partes_apple,
            });
        });
};

let mostrarPorParte = (req, res) => {
    let termino = req.query.parte;

    ParteApple.findOne({ vpn: termino }).exec((err, parteapple) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }
        res.json({
            ok: true,
            parteapple,
        });
    });
};

let mostrarPorId = (req, res) => {
    let id = req.params.id;

    // para validar si el ID ingresado es correcto
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.json({
            ok: false,
            err: {
                message: "ID incorrecto",
            },
        });
    }

    ParteApple.findById(id).exec((err, parteappleDB) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (!parteappleDB) {
            return res.json({
                ok: false,
                err: {
                    message: "ID no existe",
                },
            });
        }

        res.json({
            ok: true,
            parteappleDB,
        });
    });
};

let buscar = (req, res) => {
    let termino = req.params.termino;
    let pagina = Number(req.query.pagina) || 1;
    let limite = Number(req.query.limite) || 15;

    let skip = pagina - 1;
    skip = skip * limite;

    let total_paginas;
    let total_parteapple;
    let regex = new RegExp(termino, "i");

    ParteApple.countDocuments({ $or: [{ descripcion: regex }, { vpn: termino }, { sku: termino }] }, (err, numOfDocs) => {
        if (err) throw err;
        total_paginas = Math.ceil(numOfDocs / limite);
        total_parteapple = numOfDocs;
    });

    ParteApple.find({ $or: [{ descripcion: regex }, { vpn: termino }, { sku: termino }] })
        .skip(skip)
        .limit(limite)
        .sort("descripcion")
        .exec((err, partes_apple) => {
            if (err) {
                return res.json({
                    ok: false,
                    err,
                });
            }

            if (Object.entries(partes_apple).length === 0) {
                return res.json({
                    ok: false,
                    message: "No se encontraron ParteApples",
                });
            }

            res.json({
                ok: true,
                pagina,
                total_paginas,
                total_parteapple,
                partes_apple,
            });
        });
};

let crear = async(req, res) => {
    let body = req.body;

    let parteapple = new ParteApple({
        vpn: body.vpn,
        descripcion: body.descripcion,
        sku: body.sku,
        precioStock: body.precioStock,
        precioExch: body.precioExch,
        precioReg: body.precioReg,
        coreValue: body.coreValue,
    });

    parteapple.save((err, parteappleDB) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }
        if (!parteappleDB) {
            return res.json({
                ok: false,
                err,
            });
        }

        res.json({
            ok: true,
            parteappleDB,
        });
    });
};

let actualizar = (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ["vpn", "descripcion", "sku", "precioStock", "precioExch", "precioReg", "coreValue"]);

    ParteApple.findByIdAndUpdate(id, body, QueryOpts, (err, parteappleAct) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (!parteappleAct) {
            return res.json({
                ok: false,
                err: {
                    message: "Parte No encontrado",
                },
            });
        }

        res.json({
            ok: true,
            parteapple: parteappleAct,
        });
    });
};

module.exports = {
    listar,
    mostrarPorId,
    buscar,
    crear,
    actualizar,
    mostrarPorParte,
};