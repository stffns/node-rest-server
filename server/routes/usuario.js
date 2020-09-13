const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require("bcrypt");
const _ = require('underscore')

const { verificaToken, verificaAdminRole } = require('../middleware/autenticacion')

const app = express();

app.get('/usuario', [verificaToken, verificaAdminRole] ,(req, res) => {

    let desde = req.query.desde || 0;
    let limite = req.query.limite || 5;
    desde = Number(desde);
    limite = Number(limite);

    let query = { estado: true };
    const options = {
        select: 'nombre email role estado img',
        page: desde,
        limit: limite
    }

    Usuario.paginate(query,options).then(async (data) => {
        let cuenta = await Usuario.countDocuments(query);
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


app.post('/usuario', [verificaToken, verificaAdminRole], function (req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        img: body.img,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    })
});


app.put('/usuario/:id', verificaToken, function (req, res) {

    let id = req.params.id;
    let body = _.pick( req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body , {new: true , runValidators: true} , (err, usuario)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            usuario: usuario
        });
    })



});

app.delete('/usuario/:id', [verificaToken, verificaAdminRole], function (req, res) {

    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    }

    Usuario.findByIdAndUpdate(id, cambiaEstado , (err, usuario)=>{
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuario: usuario
        });
    })
})

module.exports = app;
