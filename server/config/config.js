// puerto

process.env.PORT = process.env.PORT || 3000;

//Entorno

process.env.NODE_ENV = process.env.NODE_ENV || "dev";

// Base de Datos
let urlDB;

// vencimiento del token
process.env.CADUCIDAD_TOKEN = "48h";

// SEED DE AUTENTICACION
process.env.SEED = process.env.SEED || "este-es-el-seed-desarrollo";

if (process.env.NODE_ENV === "dev") {
    urlDB = "mongodb+srv://nemod:ulMgSH1Pk5nj1lsp@cluster0.rte5z.mongodb.net/sorax?retryWrites=true&w=majority";
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

// google client id

process.env.CLIENT_ID =
    process.env.CLIENT_ID || "286810902370-5k7npn4hn32j6auulua1omg4einuj012.apps.googleusercontent.com";