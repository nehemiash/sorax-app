const jwt = require("jsonwebtoken");

//verificar el tocken

let verificaToken = (req, res, next) => {
    let token = req.get("token"); // busca el header en la peticion

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.json({
                ok: false,
                err: {
                    message: "Token NO valido",
                },
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
};

//verificar el tocken

let verificaAdmin_Role = (req, res, next) => {
    let token = req.get("token"); // busca el header en la peticion

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.json({
                ok: false,
                err: {
                    message: "Token NO valido",
                },
            });
        }
        req.usuario = decoded.usuario;

        if (decoded.usuario.role === "ADMIN_ROLE") {
            next();
        } else {
            return res.json({
                ok: false,
                err: {
                    message: "El Usuario no es administrador",
                },
            });
        }
    });
};

/* Verifica token para imagen por URL */

let verificaTokenImg = (req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.json({
                ok: false,
                err: {
                    message: "Token NO valido",
                },
            });
        }

        req.usuario = decoded.usuario;
        next();
    });
};

module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg,
};