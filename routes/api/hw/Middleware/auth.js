const isLoggedIn=(req,res,next)=>{
    if(req.user){
    next();
   res.status(200).json({"msg":"Eureka, funciona Facebook"});
}else{
    res.status(401).send('No estas logueado');
}}

module.exports=isLoggedIn;