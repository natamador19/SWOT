var conn = require('../../../utils/dao');
var ObjectID= require('mongodb').ObjectId; //Libreria para pasar los id 

//Los id son binarios por lo tanto se necesita la libreria ObjectId

var _db;
class Swot{
    swotColl=null;
    constructor(){
        this.initModel();
    }

    //Establecer la coleccion
    async initModel(){
        try{
            _db=await conn.getDB();
            this.swotColl=await _db.collection("SWOT");
        }catch(ex){
            console.log(ex);
            process.exit(1);
        }
    }

    // TRAER TODOS LOS DATOS DE LA COLECCION
    async getAll(id){
        const filter={"user_id": new ObjectID(id)}
        let swots=await this.swotColl.find(filter);
        return swots.toArray();
    }

    //QUERY (SELECT NOM,MKO FROM KOKO )
    async getWithFilterAndProjection(filter,projection){
        //SELECT {projection} from SWOT where {filter};
        //SELECT _id,swotRelevance from SWOT; 
        let p={
            "projection":projection
        }
        let swots=await this.swotColl.find(filter,p);
        return swots.toArray();
    }
    //UPDATE DE RELEVANCE
    async updateRelevanceRandom(id){
        const filter={"_id":new ObjectID(id)};
        const updateAction={"$set":{swotRelevance:Math.round(Math.random()*100)/100}};
        let result = await this.swotColl.updateOne(filter,updateAction);
        return result;
    }

    async getByFacer(TextToSearch, page, itemsPerPage,userId){
        const filter={swotDesc:RegExp(TextToSearch,'g'),"user_id": new ObjectID(userId)};
        console.log(filter);
        /*const options ={
            projection:{},
            limit:itemsPerPage,
            skip:(itemsPerPage*(page-1))

        };*/
        //let cursor = await this.swotColl.find(filter,options);
        let cursor = await this.swotColl.find(filter);
        let docsMatched= await cursor.count();
        cursor.skip((itemsPerPage*(page-1)));
        cursor.limit(itemsPerPage);

        let documents = cursro.toArray();
        return{
            docsMatched,
            documents,
            page,
            itemsPerPage
        }
        //SELECT column1, column2, from TABLE where column1 like '%SoText%';
        //Se ocupa dos datos parahacer el paginado, cuantos items y en que pagina

    }
    async getAggregateData(userId){
        //count,sum,mean, avg, max,min,stdev
        const PipeLine=[
            {
                '$match':{
                    'user_id': new ObjectID(userId)
                }
            },{
                '$group':{
                    '_id':'$swotType',
                    'swotTypeCount':{
                        '$sum':1
                    }
                }
            },{
                '$sort':{
                    '_id':1
                }
            }
        ];
        //la -l | grep .jpg

        const cursor = this.swotColl.aggregate(PipeLine);
        return await cursor.toArray();
    }

    //OBTENER DOCS POR ID
    async getById(id){
        const filter={"_id":new ObjectID(id)};
        let swotDocument=await this.swotColl.FindOne(filter);
        return swotDocument;
    }
    //OBTENER BY TYPE OSEA "S","W","O","T"
    async getByType(type){
        //SELECT * FROM SWOT WHERE SWOTTYPE=?;
        const filter ={"swotType":type};
        let cursor=await this.swotColl.find(filter);
        return cursor.toArray();
    }

    //SELECTBY SWOTMETAKEY
    async getByMetaKey(key,userId){
        const filter={"swotMeta":Key, "user_id":new ObjectID(userId)};
        let cursor=await this.swotColl.find(filter);
        return cursor.toArray();
    }

    //AÑADIR NUEVO DOCUMENTO
    async addNew(swotType, swotDesc,swotMetaArray){
        let newSwot={
            swotType,
            swotDesc,
            swotMeta:swotMetaArray,
            swotDate:new Date().getTime(),
            user_id:new ObjectID(id)
        }
        let result= await this.swotColl.insertOne(newSwot);
        return result;
    }

    //AÑADIR UN METASWOT

    async addMetaToSwot(SwotMetaKey,id){
        //UPDATE SWOT set swotMeta='Nuevo Valor' where _id:id;
        let filter ={"_id":new ObjectID(id)};
        let updateJson={
            "$push":{"swotMeta":swotMetaKey}
        };
        let result = await this.swotColl.updateOne(filter,updateJson);
        return result;
    }

    //ELIMINAR 
    async deleteById(id){
        //DELETE FROM SWOT WHERE _id='aId';
        let filter ={_id:new ObjectID(id)};
        let result=await this.swotColl.deleteOne(filter);
        return result;
    }

}


module.exports=Swot;