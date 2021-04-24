const _ = require("underscore");
const { QueryOpts } = require("../controller/dbconfig");

const Kbb = require("../models/kbbModel");

let listar = async(req, res) => {
    let pagina = Number(req.query.pagina) || 1;
    let limite = Number(req.query.limite) || 15;
    let sort = req.query.sort || "entrada";

    let skip = pagina - 1;
    skip = skip * limite;
    let total_paginas;
    let total_kbbs;

    await Kbb.countDocuments({ estado: true }, (err, numOfDocs) => {
        if (err) throw err;
        total_paginas = Math.ceil(numOfDocs / limite);
        total_kbbs = numOfDocs;
    });

    await Kbb.find({ estado: true })
        .skip(skip)
        .limit(limite)
        .sort(sort)
        .populate("parte", "vpn descripcion sku precioReg coreValue precioStock precioExch")
        .populate("usuario", "nombre")
        .exec((err, kbbs) => {
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
                total_kbbs,
                kbbs,
            });
        });
};

let mostrarPorId = async(req, res) => {
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

    await Kbb.findById(id)
        .populate("parte", "vpn descripcion sku precioStock precioExch precioReg coreValue")
        .populate("usuario", "nombre")
        .exec((err, kbbDB) => {
            if (err) {
                return res.json({
                    ok: false,
                    err,
                });
            }

            if (!kbbDB) {
                return res.json({
                    ok: false,
                    err: {
                        message: "El ID no es correcto",
                    },
                });
            }

            res.json({
                ok: true,
                kbb: kbbDB,
            });
        });
};

let crear = async(req, res) => {
    let body = req.body;
    let usuario = req.usuario._id;

    let kbb = new Kbb({
        gsxNum: body.gsxNum,
        sro: body.sro,
        parte: body.parte,
        orden: body.orden,
        ordenId: body.ordenId,
        pedido: body.pedido,
        kgb: body.kgb,
        kbb: body.kbb,
        guiaExp: body.guiaExp,
        guiaImp: body.guiaImp,
        situacion: "recepcionado",
        invoice: body.invoice,
        cobertura: body.cobertura,
        costo: body.costo,
        usuario: usuario,
        centro: body.centro,
        factura: body.factura,
        fechaInv: body.fechaInv,
        entrada: Date.now(),
        servicio: body.servicio,
        obs: body.obs,
    });

    kbb.save((err, kbbDB) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }
        if (!kbbDB) {
            return res.json({
                ok: false,
                err,
            });
        }

        res.json({
            ok: true,
            kbb: kbbDB,
        });
    });
};

let actualizar = (req, res) => {
    let id = req.params.id;

    let body = _.pick(req.body, [
        "sro",
        "gsxNum",
        "pedido",
        "orden",
        "ordenId",
        "parte",
        "kbb",
        "kgb",
        "guiaImp",
        "guiaExp",
        "consolidado",
        "cobertura",
        "situacion",
        "estado",
        "invoice",
        "factura",
        "centro",
        "fechaInv",
        "costo",
        "servicio",
        "obs",
    ]);

    Kbb.findByIdAndUpdate(id, body, QueryOpts).exec((err, kbbAct) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (!kbbAct) {
            return res.json({
                ok: false,
                err: {
                    message: "Kbb no encontrada",
                },
            });
        }

        res.json({
            ok: true,
            kbb: kbbAct,
        });
    });
};

let retornar = (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let retornar = {
        situacion: "retornado",
        estado: false,
        salida: Date.now(),
    };

    Kbb.findByIdAndUpdate(id, retornar, QueryOpts).exec((err, kbbAct) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (!kbbAct) {
            return res.json({
                ok: false,
                err: {
                    message: "Kbb no encontrada",
                },
            });
        }

        res.json({
            ok: true,
        });
    });
};

let buscar = async(req, res) => {
    let termino = req.params.termino;
    let pagina = Number(req.query.pagina) || 1;
    let limite = Number(req.query.limite) || 15;
    let sort = req.query.sort || "entrada";

    let skip = pagina - 1;
    skip = skip * limite;
    let total_paginas;
    let total_kbbs;

    await Kbb.countDocuments((err, numOfDocs) => {
        if (err) throw err;
        total_paginas = Math.ceil(numOfDocs / limite);
        total_kbbs = numOfDocs;
    });

    let regex = new RegExp(termino, "i");

    if (isNaN(termino)) {
        nan = 0;
    } else {
        nan = termino;
    }

    await Kbb.find({
            $or: [
                { sro: termino },
                { gsxNum: termino },
                { orden: nan },
                { kbb: termino },
                { kgb: termino },
                { guiaImp: termino },
                { guiaExp: termino },
            ],
        })
        .populate("parte", "vpn descripcion sku precioReg coreValue")
        .populate("usuario", "nombre")
        .sort(sort)
        .exec((err, kbbs) => {
            if (err) {
                return res.json({
                    ok: false,
                    err,
                });
            }

            if (Object.entries(kbbs).length === 0) {
                return res.json({
                    ok: false,
                    message: "No se encontraron Kbbs",
                });
            }

            res.json({
                ok: true,
                kbbs,
                pagina,
                total_paginas,
                total_kbbs,
            });
        });
};

module.exports = {
    listar,
    mostrarPorId,
    crear,
    actualizar,
    buscar,
    retornar,
};