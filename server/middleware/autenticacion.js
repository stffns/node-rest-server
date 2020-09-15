const jwt = require('jsonwebtoken');
const SEED = process.env.SEED;

//
//Verificar Token
//

let verificaToken = (req, res, next)=>{

    console.log(req)
    let token = req.get('token');

    jwt.verify(token, SEED, (err, decoded) => {
        if(err){
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            })
        }
        req.usuario = decoded.usuario;
        next();
    })
}

//
//Verificar AdminRole
//

let verificaAdminRole = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role !== 'ADMIN_ROLE'){
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }else{
        next();
    }
}

module.exports = {
    verificaToken,
    verificaAdminRole
};