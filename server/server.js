const express = require('express');
const app = express();
const usuario = require('./routes/usuario');

require('./config/config');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use( usuario );

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    'useCreateIndex': true
}

mongoose.connect(process.env.urlDB, options,(err) =>
    { if(err) throw err;
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto' , process.env.PORT)
})