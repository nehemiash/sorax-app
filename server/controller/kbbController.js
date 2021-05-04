const _ = require("underscore");
const { QueryOpts } = require("../controller/dbconfig");
const moment = require("moment");

const Kbb = require("../models/kbbModel");

let status = async(req, res) => {
    let sin_devolver;

    let formato = "YYYY-MM-DD";
    let hoy = moment().format(formato);

    let inicio_de_este_mes = moment().startOf("month").format(formato); // inicio de este mes
    let fin_de_este_mes = moment(moment().startOf("month")).endOf("month").format(formato); // fin de este mes
    let inicio_de_esta_semana = moment().startOf("week").format(formato); // inicio de esta semana
    let fin_de_esta_semana = moment(moment().startOf("week")).endOf("week").format(formato);
    let inicio_de_este_anio = moment().startOf("year").format(formato); // inicio de este año
    let fin_de_este_anio = moment(moment().startOf("year")).endOf("year").format(formato);

    let hace_una_semana = moment().subtract(7, "days").format(formato);
    let hace_quince = moment().subtract(15, "days").format(formato);
    let hace_un_mes = moment().subtract(1, "M").format(formato);

    let esta_semana = { entrada: { $gte: inicio_de_esta_semana, $lte: fin_de_esta_semana } };
    let este_mes = { entrada: { $gte: inicio_de_este_mes, $lte: fin_de_este_mes } };
    let este_anio = { entrada: { $gte: inicio_de_este_anio, $lte: fin_de_este_anio } };

    let mas_de_una_semana = ({ estado: true }, { entrada: { $lte: hace_una_semana } });
    let mas_de_quince = ({ estado: true }, { entrada: { $lte: hace_quince } });
    let mas_de_un_mes = ({ estado: true }, { entrada: { $lte: hace_un_mes } });

    let estasemana;
    let estemes;
    let esteanio;
    let masdeunasemana;
    let masdequince;
    let masdeunmes;

    await Kbb.countDocuments(esta_semana, (err, numOfDocs) => {
        if (err) throw err;
        estasemana = numOfDocs;
    });

    await Kbb.countDocuments(este_mes, (err, numOfDocs) => {
        if (err) throw err;
        estemes = numOfDocs;
    });

    await Kbb.countDocuments(este_anio, (err, numOfDocs) => {
        if (err) throw err;
        esteanio = numOfDocs;
    });

    await Kbb.countDocuments(mas_de_una_semana, (err, numOfDocs) => {
        if (err) throw err;
        masdeunasemana = numOfDocs;
    });

    await Kbb.countDocuments(mas_de_quince, (err, numOfDocs) => {
        if (err) throw err;
        masdequince = numOfDocs;
    });

    await Kbb.countDocuments(mas_de_un_mes, (err, numOfDocs) => {
        if (err) throw err;
        masdeunmes = numOfDocs;
    });

    await res.json({
        ok: true,
        conteo: {
            estasemana,
            estemes,
            esteanio,
        },
        pendientes: {
            masdeunasemana,
            masdequince,
            masdeunmes,
        },
    });
};

let listar = async(req, res) => {
    let pagina = Number(req.query.pagina) || 1;
    let limite = Number(req.query.limite) || 15;
    let sort = req.query.sort || "-entrada";

    let skip = pagina - 1;
    skip = skip * limite;
    let total_paginas;
    let total_kbbs;

    opts = { estado: true };

    await Kbb.countDocuments(opts, (err, numOfDocs) => {
        if (err) throw err;
        total_paginas = Math.ceil(numOfDocs / limite);
        total_kbbs = numOfDocs;
    });

    Kbb.find(opts)
        .skip(skip)
        .limit(limite)
        .sort(sort)
        .populate("parte", "vpn descripcion -_id")
        .select("sro parte orden entrada cobertura")
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

let buscarMultiple = async(req, res) => {
    let ids = req.body.ids;
    let sort = req.query.sort || "entrada";

    Kbb.find({ _id: { $in: ids } })
        .populate("parte", "vpn descripcion sku precioReg coreValue precioStock precioExch")
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
            });
        });
};

let listarTodo = async(req, res) => {
    let sort = "orden";

    await Kbb.find({ estado: true })
        .sort(sort)
        .populate("parte", "vpn descripcion -_id")
        .select("sro parte orden centro entrada")
        .exec((err, kbbs) => {
            if (err) {
                return res.json({
                    ok: false,
                    err,
                });
            }
            res.json({
                ok: true,
                kbbs,
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
    buscarMultiple,
    listarTodo,
    status,
};