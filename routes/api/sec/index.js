const express=require("express");
let router = express.Router();
const jwt = require("jsonwebtoken");
let secModelClass=new require('./sec.model.js');
let secModel=new secModelClass();
const mailSender = require('../../../utils/mailer');
const {v4:uuidv4}=require('uuid');
const {WriteConcernError}=require("mongodb");



router.get('/passrecovery',async(req,res,next)=>{
    try{
    const {email}=req.body;
    let userLogged=await secModel.getByEmail(email);
    if(userLogged){
        const uuid=uuidv4();
        mailSender(
            email,
            "Restablecer contraseña",
            '<h1>Solicitud de restablecimiento de contraseña</h1><p>Hemos recibido una solicitud para restablecer su contraseña, si no ha sido usted ignore este correo.</p><h2>UUID: '+uuid+' (se muestra con fines ilustrativos)</h2><p><a style="background-color: #0000;border: none;color: white;padding: 15px 32px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;" href="http://localhost:3000/api/sec/passrecovery/{'+email+'}/{'+uuid+'}">RESTABLECER</></p>'
            );
        let settoken=await secModel.Token(email,uuid);
        res.status(200).json({"msg":"Correo enviado"});
    }else{
        res.status(200).json({"msg":"usuario no registrado"});
    }
    }catch(ex){
        console.log(ex);
        res.status(500).json({"msg":"Error"});
    }
    
});
router.get('/recovery/:email/:uuid', async (req,res,next)=>{
    try{
    const {email,uuid}=req.params; 
    const new_p=req.body;
    let validatetoken=await secModel.ValidarToken(email,uuid);
    if(validatetoken){
        let validatetokn = await secModel.NewPassword(email,new_p);
        let unsettoken=await secModel.UnToken(email);
        res.status(200).json({"msg":"Token válida, contraseña actualizada"});
    }else{
        let unsettoken=await secModel.UnToken(email);
        res.status(200).json({"msg":"Token inválio o ha expirado"});
    }
    }catch(ex){
        console.log(ex);
        res.status(500).json({"msg":"Error"});
    }
});

router.post('/login',async(req,res,next)=>{
try{
    const {email,pswd}=req.body;
    let userLogged=await secModel.getByEmail(email);
    if(userLogged){
        const isPaswdOk=await secModel.comparePassword(pswd, userLogged.password);
        if(isPaswdOk){
            delete userLogged.password;
            delete userLogged.oldpasswords;
            delete userLogged.lastlogin;
            delete userLogged.lastpasswordchang;
            delete userLogged.passwordexpires;
            let payload={
                jwt:jwt.sign(
                    {email:userLogged.email,
                    _id:userLogged._id,
                    roles:userLogged.roles},
                    process.env.JWT_SECRET,
                    {expiresIn:'1d'}
                ),
                user:userLogged
            };
            return res.status(200).json(payload);
        }
    }

    console.log({email,userLogged});
    return res.status(400).json({msg:"Credenciales no válidas"});
}catch(ex){
    console.log(ex);
    res.status(500).json({"msg":"Error"});
}
});

router.post('/signin',async(req,res,next)=>{
    try{
        const {email,pswd}=req.body;
        let userAdded=secModel.createNewUser(email,pswd);
        delete userAdded.password;
        console.log(userAdded);
        res.status(200).json({"msg":"Usuario creado sastifactoriamente"});

    }catch{
        res.status(500).json({"msg":"Error"});
    }
    });

    module.exports=router;