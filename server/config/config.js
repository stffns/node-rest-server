
//============================
//Puerto
//============================
process.env.PORT = process.env.PORT || 3000;


//=============================
//Entorno
//=============================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//=============================
//Vencimiento
//=============================

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30

//=============================
//Seed
//=============================

process.env.SEED = process.env.SEED || 'este es el seed de desarrollo'

//=============================
//Base de datos
//=============================

if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    urlDB = process.env.MONGO_URL;
}

process.env.urlDB = urlDB

//=============================
//Google client id
//=============================

process.env.CLIENT_ID = process.env.CLIENT_ID || '562181210936-s4b008jkpob8vad0uliikpsr132kmgff.apps.googleusercontent.com';

