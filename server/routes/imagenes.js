const express = require('express');
const fs = require('fs');
let app = express();
const path = require('path')
const {verificaToken, verificaTokenImg} = require ( "../middleware/autenticacion" );

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;
    let pathImg = `./uploads/${tipo}/${img}`;

    let pathURL = path.resolve(__dirname,`../../uploads/${tipo}/${ img }`)
        if(fs.existsSync( pathURL)){
        res.sendFile(pathURL)
    }else {
        let noImagePath = path.resolve(__dirname,'../assets/no-image.jpg');
        res.sendFile ( noImagePath );
    }
})

module.exports = app;