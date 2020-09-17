const express = require('express');
let Producto = require('../models/productos');

const {verificaToken} = require('../middleware/autenticacion')

let app = express();

const updateOptions = {
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
    new: true,
    context: 'query'
};

let query = {};

app.get('/productos', (req, res) => {
    //Trae todos los producto usando populate y paginado

    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 5;

    query = {disponible: true};

    const options = {
        select: 'nombre descripcion precioUni usuario disponible',
        page: desde,
        limit: limite,
        sort: 'descripcion',
        populate: ([{path: 'usuario', select: 'nombre email'},
            {path: 'categoria', select: 'descripcion'}])

    }

    Producto.paginate(query, options).then(async (data) => {
        let cuenta = await Producto.countDocuments(query);
        res.json({
            ok: true,
            count: cuenta,
            data
        });
    }).catch((err) => {
        res.status(400).json({
            ok: false,
            err
        });
    })


})
app.get('/productos/:id', (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El Id no existe'
                    }
                })
            }
            res.json({
                ok: true,
                producto: productoDB
            });
        })
})
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = RegExp(termino, 'i');

    query = {descripcion: regex};

    Producto.find(query)
        .populate('categoria', 'nombre')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El Id no existe'
                    }
                })
            }
            res.json({
                ok: true,
                producto: productoDB
            });

        })
});
app.post('/productos', verificaToken, (req, res) => {

    let body = req.body;

    //let categoria = Categoria.get()

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    })


})
app.put('/productos/:id', (req, res) => {

    let id = req.params.id;
    let {categoria , descripcion , disponible , img , nombre , precioUni} = req.body;

    Producto.findById(id, updateOptions, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        productoDB.nombre = nombre;
        productoDB.descripcion = descripcion;
        productoDB.categoria = categoria;
        productoDB.disponible = disponible;
        productoDB.img = img;
        productoDB.precioUni = precioUni;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.status(202).json({
                ok: true,
                producto: productoGuardado
            })

        })

    });


})
app.delete('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    let cambiaEstado = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, cambiaEstado, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El Id no existe'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB,
            message: 'Producto Borrado'
        });
    })


})

module.exports = app;

