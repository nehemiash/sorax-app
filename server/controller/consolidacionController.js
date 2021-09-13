const Consolidacion = require("../models/consolidacionModel");
const Kbb = require("../models/kbbModel");

const { QueryOpts } = require("../controller/dbconfig");

let listar = async(req, res) => {
    let pagina = Number(req.query.pagina) || 1;
    let limite = Number(req.query.limite) || 15;
    let sort = req.query.sort || "-numero";
    let tipo = req.query.tipo || "consolidacion";

    let skip = pagina - 1;
    skip = skip * limite;
    let total_paginas;
    let total_cons;

    const opts = { activa: true, tipo: tipo };

    await Consolidacion.countDocuments(opts, (err, numOfDocs) => {
        if (err) throw err;
        total_paginas = Math.ceil(numOfDocs / limite);
        total_cons = numOfDocs;
    });

    Consolidacion.find(opts)
        .skip(skip)
        .limit(limite)
        .sort(sort)
        .select("numero tipo cobertura courier guia fecha retornada creada activa status cantidad ids")
        .exec((err, consolidaciones) => {
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
                total_cons,
                consolidaciones,
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

    Consolidacion.findById(id, (err, consolidacionDB) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (!consolidacionDB) {
            return res.json({
                ok: false,
                err: {
                    message: "El ID no es correcto",
                },
            });
        }

        res.json({
            ok: true,
            consolidacion: consolidacionDB,
        });
    });
    //}) .populate("usuario", "nombre -_id");
};

let crear = async(req, res) => {
    let body = req.body;
    let tipo = req.body.tipo;

    let numero;
    // trae el ultimo registro de la DB
    let ultimo = await Consolidacion.find({ tipo }, "-_id numero").sort({ $natural: -1 }).limit(1).exec();

    // convierte a numero e incrementa
    if (ultimo.length > 0) {
        ultimo = ultimo.toString(); // convierte el objeto a string
        ultimo = parseInt(ultimo.replace(/\D/g, ""));
        numero = ultimo + 1;
    }
    // si no hay ultimo registro comienza en 1
    if (ultimo.length === 0) {
        numero = 1;
    }

    let consolidacion = new Consolidacion({
        numero: numero,
        tipo: body.tipo,
        cobertura: body.cobertura,
        courier: body.courier,
        guia: body.guia,
        cantidad: body.cantidad,
        ids: body.ids,
        creada: Date.now(),
        status: body.status,
    });

    consolidacion.save(async(err, consolidacionDB) => {
        // await consolidacion.populate("ids").execPopulate();
        // await nota.populate("orden", "numero").execPopulate();

        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }
        if (!consolidacionDB) {
            return res.json({
                ok: false,
                err,
            });
        }

        res.json({
            ok: true,
            consolidacion: consolidacionDB,
        });
    });
};

let actualizar = (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let consolidacionAct = {
        tipo: body.tipo,
        cobertura: body.cobertura,
        courier: body.courier,
        guia: body.guia,
        ids: body.ids,
        retornada: body.retornada,
        cantidad: body.cantidad,
        status: body.status,
        activa: body.activa,
    };

    Consolidacion.findByIdAndUpdate(id, consolidacionAct, QueryOpts, (err, consolidacionActualizada) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (!consolidacionActualizada) {
            return res.json({
                ok: false,
                err: {
                    message: "Consolidacion No encontrada",
                },
            });
        }

        res.json({
            ok: true,
            consolidacion: consolidacionActualizada,
        });
    });
};

let eliminar = (req, res) => {
    let id = req.params.id;

    let cambiaEstado = {
        activa: false,
    };

    Consolidacion.findByIdAndUpdate(id, cambiaEstado, QueryOpts, (err, consBorrada) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (!consBorrada) {
            return res.json({
                ok: false,
                err: {
                    message: "El ID no existe",
                },
            });
        }

        res.json({
            ok: true,
            message: "Consolidacion Borrada",
            consolidacion: consBorrada,
        });
    });
};

let buscar = (req, res) => {
    let termino = req.params.termino;

    Consolidacion.find({ estado: true, $or: [{ numero: termino }, { guia: termino }] }).exec((err, consolidacion) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (Object.entries(consolidacion).length === 0) {
            return res.json({
                ok: false,

                message: "No se encontraron registros",
            });
        }

        res.json({
            ok: true,
            consolidacion,
        });
    });
};

module.exports = {
    crear,
    actualizar,
    listar,
    eliminar,
    mostrarPorId,
    buscar,
};