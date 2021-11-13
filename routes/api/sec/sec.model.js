var conn = require('../../../utils/dao');
var ObjectID= require('mongodb').ObjectId; //Libreria para pasar los id 
const bcrypt = require('bcryptjs');

//Los id son binarios por lo tanto se necesita la libreria ObjectId

var _db;
class Sec{
    secColl=null;
    constructor(){
        this.initModel();
    }

    //Establecer la coleccion
    async initModel(){
        try{
            _db=await conn.getDB();
            this.secColl=await _db.collection("usuarios");
        }catch(ex){
            console.log(ex);
            process.exit(1);
        }
    }

    async recover_password(email,password,code){
        try {
        
            console.log(result);
            return result;
        } catch (ex) {
            console.log(ex);
            throw(ex);  
        }
    }

    async createNewUser(email,password){
        try{
            let user={
                email:email,
                password:await bcrypt.hash(password,10),
                lastlogin:null,
                lastpasswordchang:null,
                passwordexpires:new Date().getTime()+(90*24*60*60*1000),
                oldpasswords:[],
                roles:["public"]
            }
            let result= await this.secColl.insertOne(user);
            console.log(result);
            return result;
        }
        catch(ex){
            console.log(ex);
            throw(ex);//función de lanzar una excepción. Función nativa de javascript
        }
    }
    async getByEmail(email){
        const filter={"email":email};
        return await this.secColl.findOne(filter);
    }
    async comparePassword(rawPassword,dbPassword){
        return await bcrypt.compare(rawPassword,dbPassword);
    }

    async NewPassword(email,n_password){
        try{
            const filtro={"email":email};
            let password_old= await this.secColl.findOne(filtro,{"password":1});
            let cambiar_contra ={
                "$push":{"oldpasswords": password_old}
            }; 
            let result=await this. secColl.updateOne(filtro, cambiar_contra);

            const actualizar={
                "$set":{
                    password:await bcrypt.hash(n_password,10),
                    lastpasswordchang:new Date().getTime(),
                }
            };

            let result_= await this.secColl.updateOne(filter, actualizar);
            return result_;
        }catch(ex){
            console.log(ex);
            throw(ex);

        }

    }

    async InsertOldPass(email){
        const filtro={"email":email};
        let projection={
            "projection":{password:1,_id:0}
        }
        let oldpasswords= await this.secColl.updateOne(filtro,projection);
        let updateJSON ={
            "$push":{"oldpasswords":oldpasswords}
        };
    }

    async Token(email,uuid){
        try{
            const filtro={"email":email};
            const Actualizar={ "$set":
            {"resettooken":uuid,
            "tokenexpires":new Date().getTime()+(30*60*1000*50)    
        }};
        let result= await this.secColl.updateOne(filtro,Actualizar);
        return result;
        }catch(ex){
            console.log(ex);
            throw(ex);
        }
    }

    async UnToken(email){
        try {
            const filtro={"email":email};
            const modificar={"$unset":{
                resetoken:"",
                tokenexpires:""
            }};
            let result = await this.secColl.updateOne(filtro,modificar);
            return result;
        } catch (ex) {
            console.log(ex);
            throw(ex);
            
        }
    }

    async ValidarToken(email,uuid){
        try {
            const filtro={
                "email":email,
                "resettooken":uuid,
                "tokenexpires":{$gte:(new Date().getTime())}
            };
            return await this.secColl.findOne(filtro);
        } catch (ex) {
            console.log(ex);
            throw(ex);
            
        }
    }

}

module.exports=Sec;