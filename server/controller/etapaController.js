const _ = require("underscore");

const Etapa = require("../models/etapaModel");

const { QueryOpts } = require("../controller/dbconfig");

let listar = (req, res) => {
    Etapa.find()
        .sort("sigla")
        .exec((err, etapas) => {
            if (err) {
                return res.json({
                    ok: false,
                    err,
                });
            }
            res.json({
                ok: true,
                etapas,
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

    Etapa.findById(id, (err, etapaDB) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (!etapaDB) {
            return res.json({
                ok: false,
                err: {
                    message: "El ID no es correcto",
                },
            });
        }

        res.json({
            ok: true,
            etapa: etapaDB,
        });
    });
};

let agregar = (req, res) => {
    let body = req.body;
    let etapa = new Etapa({
        sigla: body.sigla,
        color: body.color,
        descripcion: body.descripcion,
    });

    etapa.save((err, etapaDB) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (!etapaDB) {
            return res.json({
                ok: false,
                err,
            });
        }

        res.json({
            ok: true,
            etapas: etapaDB,
        });
    });
};

let actualizar = (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ["sigla", "descripcion", "color"]);

    Etapa.findByIdAndUpdate(id, body, QueryOpts, (err, etapaActualizada) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (!etapaActualizada) {
            return res.json({
                ok: false,
                err: {
                    message: "Etapa no encontrada",
                },
            });
        }

        res.json({
            ok: true,
            etapa: etapaActualizada,
        });
    });
};

let eliminar = (req, res) => {
    let id = req.params.id;

    let cambiaEstado = {
        estado: false,
    };

    Etapa.findByIdAndDelete(id, (err, etapaBorrada) => {
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (!etapaBorrada) {
            return res.json({
                ok: false,
                err: {
                    message: "Etapa No encontrada",
                },
            });
        }

        res.json({
            ok: true,
            etapa: etapaBorrada,
        });
    });
};

module.exports = {
    listar,
    mostrarPorId,
    agregar,
    actualizar,
    eliminar,
};