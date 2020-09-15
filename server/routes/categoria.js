const express = require('express');
const Categoria = require('../models/categoria');

const { verificaToken, verificaAdminRole } = require('../middleware/autenticacion')

const app = express();

const updateOptions = {
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
    new: true ,
    context: 'query'
};

app.get('/categoria', (req, res) => {

    let desde = req.query.desde || 0;
    let limite = req.query.limite || 5;
    desde = Number(desde);
    limite = Number(limite);

    let query = {};

    const options = {
        select: 'descripcion usuario',
        page: desde,
        limit: limite,
        sort: 'descripcion',
        populate: ({ path:'usuario', select: 'nombre email' })
    }

    Categoria.paginate(query,options).then(async (data) => {
        let cuenta = await Categoria.countDocuments(query);
        res.json({
            ok: true,
            count: cuenta,
            data});
    }).catch( (err) => {
        res.status(400).json({
            ok: false,
            err
        });
    })

})

app.get('/categoria/:id', verificaToken ,(req, res) => {

    let id = req.params.id;

    Categoria.findById(id,(err, categoriaDB)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El Id no existe'
                }
            })
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })


})

app.post('/categoria', verificaToken ,  (req, res) => {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
                return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    })
})

app.put('/categoria/:id', (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, updateOptions, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

})

app.delete('/categoria/:id', [verificaToken , verificaAdminRole] , (req, res) => {

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB)=>{
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El Id no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria Borrada'
        });
    })
})

module.exports  = app;




