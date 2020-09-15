require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const path  = require('path')

const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.static( path.resolve(__dirname,  '../public')))

app.use(require('./routes/index'))


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