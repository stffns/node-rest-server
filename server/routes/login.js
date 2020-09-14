const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


const app = express();

app.post('/login',(req, res) => {

    let body = req.body;

    Usuario.findOne({email: body.email},(err, usuarioDb) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!usuarioDb){
            return res.status(400).json({
                ok: false,
                err:{
                    message: '(Usuario) o contraseña incorrectas'
                }
            });
        }
        if( !bcrypt.compareSync(body.password, usuarioDb.password)){
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'Usuario o (contraseña) incorrectas'
                }
            });
        }

        let token = jwt.sign(
            {usuario: usuarioDb},process.env.SEED,{ expiresIn: process.env.CADUCIDAD_TOKEN});

        res.json({
            ok: true,
            usuario: usuarioDb,
            token
        });
    });
});

//Configuraciones de google

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    });
    const payload = ticket.getPayload();

    return  {
        nombre: payload.name,
        email:payload.email,
        img: payload.picture,
        google: true
    }

}


app.post('/google', async (req, res) => {
    let token = req.body.idtoken;

    let googleUser = await verify(token).catch(e => {
        return  res.status(403).json({
            ok: false,
            err: e
        })
    });

    Usuario.findOne({email: googleUser.email},(err, usuarioDB)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(usuarioDB){
            if(usuarioDB.google === false){
                return res.status(500).json({
                    ok: false,
                    err:{
                        message: 'Debe usar su autenticación normal'
                    }
                });
            } else {
                let token = jwt.sign({
                    ususario: usuarioDB
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN})

                return res.json({
                        ok: true,
                        usuario: usuarioDB,
                        token
                    }
                )
            }
        } else {

            let usuario = new Usuario();

            usuario.nombre =  googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img =  googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) =>{
                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };

                let token = jwt.sign({
                    ususario: usuarioDB
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN})

                return res.json({
                        ok: true,
                        usuario: usuarioDB,
                        token
                    }
                )
            })
        }
    })
})






module.exports = app;
