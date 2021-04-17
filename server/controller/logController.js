const _ = require("underscore");

const Log = require("../models/logModel");

let listarPorOrdenId = (req, res) => {
    let id = req.query.ordenId;
    Log.find({ orden: id })
        .populate("usuario", "nombre")
        .populate("orden", "numero")
        .exec((err, logs) => {
            if (err) {
                return res.json({
                    ok: false,
                    err,
                });
            }
            res.json({
                logs,
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

    Log.findById(id, (err, logDB) => {
            if (err) {
                return res.json({
                    ok: false,
                    err,
                });
            }

            if (!logDB) {
                return res.json({
                    ok: false,
                    err: {
                        message: "El ID no es correcto",
                    },
                });
            }

            res.json({
                ok: true,
                log: logDB,
            });
        })
        .populate("usuario", "nombre")
        .populate("orden", "numero");
};

let agregar = (req, res) => {
    let body = req.body;
    let usuario = req.usuario._id;
    let log = new Log({
        orden: body.orden,
        fecha: Date.now(),
        descripcion: body.descripcion,
        icono: body.icono,
        usuario,
    });

    log.save(async(err, logDB) => {
        await log.populate("usuario", "nombre").execPopulate();
        await log.populate("orden", "numero").execPopulate();
        if (err) {
            return res.json({
                ok: false,
                err,
            });
        }

        if (!logDB) {
            return res.json({
                ok: false,
                err,
            });
        }

        res.json({
            ok: true,
            logs: logDB,
        });
    });
};

function crearLog(orden, descripcion, icono, usuario) {
    let log = new Log({
        orden,
        fecha: Date.now(),
        descripcion,
        icono,
        usuario,
    });

    log.save(async(err, logDB) => {});
}

module.exports = {
    listarPorOrdenId,
    mostrarPorId,
    agregar,
    crearLog,
};