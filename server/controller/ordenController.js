const _ = require("underscore");
const { QueryOpts } = require("../controller/dbconfig");

const Orden = require("../models/ordenModel");
const { crearLog } = require("../controller/logController");

let listar = async(req, res) => {
    let pagina = Number(req.query.pagina) || 1;
    let limite = Number(req.query.limite) || 15;
    let sort = req.query.sort || "numero";
    let completada = req.query.completada || false;

    let skip = pagina - 1;
    skip = skip * limite;
    let total_paginas;
    let total_ordenes;

    await Orden.countDocuments({ completada: completada }, (err, numOfDocs) => {
        if (err) throw err;
        total_paginas = Math.ceil(numOfDocs / limite);
        total_ordenes = numOfDocs;
    });

    await Orden.find({ completada: completada })
        .skip(skip)
        .limit(limite)
        .sort(sort)
        .populate("producto", "codigo descripcion modelo marca numParte")
        .populate("cliente", "_id codigo nombre")
        .populate("problema1", "descripcion categoria")
        .populate("problema2", "descripcion categoria")
        .populate("notas", "_id descripcion")
        .populate("usuario", "_id nombre")
        .populate("etapa", "_id descripcion color sigla")
        .exec((err, ordenes) => {
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
                total_ordenes,
                ordenes,
            });
        });
};

let mostrarPorID = async(req, res) => {
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

    await Orden.findById(id)
        .populate("producto", "codigo descripcion modelo marca numParte")
        .populate("cliente", "codigo nombre direccion telefono celular email ciudad pais")
        .populate("problema1", "descripcion categoria")
        .populate("problema2", "descripcion categoria")
        .populate("notas", "descripcion")
        .populate("usuario", "nombre")
        .populate("tecnico", "nombre")
        .populate("etapa", "_id descripcion color sigla")
        .exec((err, ordenDB) => {
            if (err) {
                return res.json({
                    ok: false,
                    err,
                });
            }

            if (!ordenDB) {
                return res.json({
                    ok: false,
                    err: {
                        message: "El ID no es correcto",
                    },
                });
            }

            res.json({
                ok: true,
                orden: ordenDB,
            });
        });
};

let crear = async(req, res) => {
    let body = req.body;
    let usuario = req.usuario._id;

    let codigo;

    // trae el ultimo registro de la DB
    let ultimo = await Orden.find({}, "-_id numero").sort({ $natural: -1 }).limit(1).exec();

    // convierte a numero e incrementa
    if (ultimo.length > 0) {
        ultimo = ultimo.toString(); // convierte el objeto a string
        ultimo = parseInt(ultimo.replace(/\D/g, ""));
        codigo = ultimo + 1;
    }
    // si no hay ultimo registro comienza en 1
    if (ultimo.length === 0) {
        codigo = 1;
    }

    let orden = new Orden({
        numero: codigo,
        creado: Date.now(),
        serie1: body.serie1,
        serie2: body.serie2,
        producto: body.producto,
        fechaCompra: body.fechaCompra,
        cobertura: body.cobertura,
        cliente: body.cliente,
        problema1: body.problema1,
        ubicacion: body.ubicacion,
        accesorios: body.accesorios,
        notaCliente: body.notaCliente,
        problema2: body.problema2,
        notas: body.notas,
        obs: body.obs,
        aspecto: body.aspecto,
        reporte: body.reporte,
        tecnico: body.tecnico,
        usuario: usuario,
        repuestos: body.repuestos,
        presupuesto: body.presupuesto,
        aprobado: body.aprobado,
        fechaAprob: body.fechaAprob,
        valorPreapro: body.valorPreapro,
        valorPcs: body.valorPcs,
        valorMo: body.valorMo,
        costoFlete: body.costoFlete,
        valorTotal: body.valorTotal,
        descuento: body.descuento,
        etapa: body.etapa,
    });

    orden.save((err, ordenDB) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }
        if (!ordenDB) {
            return res.json({
                ok: false,
                err,
            });
        }

        crearLog(ordenDB._id, "Se ha creado la Orden", "enter", usuario);

        res.json({
            ok: true,
            orden: ordenDB,
        });
    });
};

let actualizar = (req, res) => {
    let id = req.params.id;
    let usuario = req.usuario._id;

    let body = _.pick(req.body, [
        "serie2",
        "fechaCompra",
        "cobertura",
        "problema1",
        "ubicacion",
        "accesorios",
        "notaCliente",
        "problema2",
        "notas",
        "obs",
        "aspecto",
        "reporte",
        "tecnico",
        "repuestos",
        "aprobado",
        "fechaAprob",
        "valorPreapro",
        "valorPcs",
        "valorMo",
        "costoFlete",
        "valorTotal",
        "descuento",
        "etapa",
    ]);

    Orden.findByIdAndUpdate(id, body, QueryOpts).exec((err, ordenAct) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (!ordenAct) {
            return res.json({
                ok: false,
                err: {
                    message: "Orden no encontrada",
                },
            });
        }

        crearLog(id, "Se ha modificado la orden", "pencil", usuario);

        res.json({
            ok: true,
            orden: ordenAct,
        });
    });
};

let entregar = (req, res) => {
    let id = req.params.id;
    let usuario = req.usuario._id;

    let entregar = {
        completada: true,
        entregada: Date.now(),
    };

    Orden.findByIdAndUpdate(id, entregar, QueryOpts, (err, ordenAct) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (!ordenAct) {
            return res.json({
                ok: false,
                err: {
                    message: "orden no encontrada",
                },
            });
        }

        crearLog(id, "La orden ha sido marcada como entregada", "log-out", usuario);

        res.json({
            ok: true,
            orden: ordenAct,
        });
    });
};

let buscar = async(req, res) => {
    let termino = req.params.termino;
    let pagina = Number(req.query.pagina) || 1;
    let limite = Number(req.query.limite) || 15;
    let sort = req.query.sort || "numero";

    let skip = pagina - 1;
    skip = skip * limite;
    let total_paginas;
    let total_ordenes;

    await Orden.countDocuments((err, numOfDocs) => {
        if (err) throw err;
        total_paginas = Math.ceil(numOfDocs / limite);
        total_ordenes = numOfDocs;
    });

    let regex = new RegExp(termino, "i");

    if (isNaN(termino)) {
        nan = 0;
    } else {
        nan = termino;
    }

    await Orden.find({
            $or: [{ numero: nan }, { serie1: termino }, { serie2: termino }],
        })
        .populate("producto", "codigo descripcion modelo marca numParte")
        .populate("cliente", "codigo nombre")
        .populate("problema1", "descripcion categoria")
        .populate("problema2", "descripcion categoria")
        .populate("notas", "-_id descripcion")
        .populate("usuario", "-_id nombre")
        .populate("etapa", "_id descripcion color sigla")
        .sort(sort)
        .exec((err, ordenes) => {
            if (err) {
                return res.json({
                    ok: false,
                    err,
                });
            }

            if (Object.entries(ordenes).length === 0) {
                return res.json({
                    ok: false,
                    message: "No se encontraron Productos",
                });
            }

            res.json({
                ok: true,
                ordenes,
                pagina,
                total_paginas,
                total_ordenes,
            });
        });
};

let aprobar = (req, res) => {
    let id = req.params.id;
    let usuario = req.usuario._id;

    let aprobar = {
        aprobado: true,
        fechaAprob: Date.now(),
    };

    Orden.findByIdAndUpdate(id, aprobar, QueryOpts, (err, ordenAct) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (!ordenAct) {
            return res.json({
                ok: false,
                err: {
                    message: "orden no encontrada",
                },
            });
        }

        crearLog(id, "El cliente ha aprobado el presupuesto", "checkmark", usuario);

        res.json({
            ok: true,
            orden: ordenAct,
        });
    });
};

let ubicar = (req, res) => {
    let id = req.params.id;
    let ubi = req.body.ubicacion;
    let usuario = req.usuario._id;

    let ubicar = {
        ubicacion: ubi,
    };

    Orden.findByIdAndUpdate(id, ubicar, QueryOpts, (err, ordenAct) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (!ordenAct) {
            return res.json({
                ok: false,
                err: {
                    message: "orden no encontrada",
                },
            });
        }

        crearLog(id, `El equipo ha sido ubicado en "${ubicar.ubicacion}"`, "location", usuario);

        res.json({
            ok: true,
            orden: ordenAct,
        });
    });
};

let moverEtapa = (req, res) => {
    let id = req.params.id;
    let etapa = req.body.etapa;
    let etapaDesc = req.body.etapaDesc;
    let usuario = req.usuario._id;

    let mover = {
        etapa: etapa,
    };

    Orden.findByIdAndUpdate(id, mover, QueryOpts, (err, ordenAct) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (!ordenAct) {
            return res.json({
                ok: false,
                err: {
                    message: "orden no encontrada",
                },
            });
        }

        crearLog(id, `El equipo ha sido movido a la Etapa "${etapaDesc}"`, "swap-horizontal", usuario);

        res.json({
            ok: true,
            orden: ordenAct,
        });
    });
};

module.exports = {
    listar,
    mostrarPorID,
    crear,
    actualizar,
    entregar,
    buscar,
    aprobar,
    ubicar,
    moverEtapa,
};