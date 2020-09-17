const express = require('express');
const fileUpload = require('express-fileupload');
const {verificaToken} = require("../middleware/autenticacion");
const Usuario = require('../models/usuario')
const fs = require('fs');
const path = require('path');
const Producto = require ( '../models/productos' );

const app = express();

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}))

app.put('/upload/:tipo/:id', verificaToken, ({files, params}, res)=>{

    let tipo = params.tipo;
    let id = params.id;
    console.log (tipo)

    if(!files){
        return res.status(400).json({
            ok: false,
            err: {
                message: `No se ha seleccionado ningún archivo`
            }
        });
    }

    let tiposValidos = ['products', 'users'];

    if(tiposValidos.indexOf(tipo)< 0){
        res.status(400).json({
            ok: false,
            err: {
                message: `Los tipos validos son ${tiposValidos.join(', ')}`,
                tipo: tipo
            }
        })
    }

    let archivo = files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension =nombreCortado[nombreCortado.length -1 ];
    //Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif','jpeg'];
    if (extensionesValidas.indexOf(extension) < 0 ){
        return res.status(400).json({
            ok: false,
            err: {
                message: `Archivo no cargado, las extensiones permitidas son ${ extensionesValidas.join(', ')}`,
                ext: extension
            }
        })
    }
    //cambiar nombre de archivo
    let nombreArchivo =  `${id}-${new Date().getMilliseconds()}.${extension}`
    archivo.mv(`uploads/${ tipo }/${nombreArchivo}`, (err)=>{
        if(err)
            return res.status(500).json({
                ok: false,
                err
            });

        if (tipo === 'users') {
            imagenUsuario ( id , res , nombreArchivo );
        }else if(tipo === 'products'){
            imagenProducto( id , res , nombreArchivo );
        }
    })
})


const imagenUsuario = (id , res, nombreArchivo) => {

    Usuario.findById(id, (err, usuarioDb)=>{
      if (err){
          borraArchivo(usuarioDb.img, 'users');
          return res.status(500).json({
              ok: false,
              err
          });
      }
      if(!usuarioDb) {
          borraArchivo(usuarioDb.img, 'users');
          return res.status ( 400 ).json ( {
              ok: false ,
              err: {
                  message: 'El usuario no existe'
              }
          });
      }

      borraArchivo(usuarioDb.img, 'users');


          usuarioDb.img = nombreArchivo;

          usuarioDb.save((err, usuarioDb)=>{
              res.json({
                  ok: true,
                  usuario: usuarioDb,
                  img: nombreArchivo
              });
          });

    });
}

const imagenProducto = (id , res, nombreArchivo) => {

    Producto.findById(id, (err, productoDb) => {
        if (err){
            borraArchivo(productoDb.img, 'products');
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!productoDb) {
            borraArchivo(productoDb.img, 'products');
            return res.status ( 400 ).json ( {
                ok: false ,
                err: {
                    message: 'El usuario no existe'
                }
            });
        }

        borraArchivo(productoDb.img, 'products');

        productoDb.img = nombreArchivo;

        productoDb.save((err, productoGuardado)=>{
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });

    });
}

const borraArchivo = (nombreImagen, tipo)=>{
    let pathURL = path.resolve(__dirname,`../../uploads/${tipo}/${ nombreImagen }`)
    if(fs.existsSync(pathURL)){
        fs.unlinkSync(pathURL);
    }
}

module.exports = app;
