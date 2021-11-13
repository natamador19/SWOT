const express=require("express");
let router = express.Router();
const cookieSession = require('cookie-session');
const passport=require('passport');
require('./passport');
const isLoggedIn=require('./Middleware/auth');

router.use(cookieSession({
    name:'facebook-auth-session',
    keys:['key1','key2']
}));
router.use(passport.initialize());
router.use(passport.session());

router.get('/',isLoggedIn,(req,res,next)=>{
res.send(`Hello world ${req.user.displayName}`)
});

router.get('/logout',(req,res)=>{
   req.session=null;
   req.logout();
   res.redirect('/'); 
});
router.get('/auth/error',(req,res,next)=>{
    res.send('unknown error');
});
router.get('/auth/facebook',passport.authenticate('facebook'));
router.get('/auth/facebook/callback',passport.authenticate('facebook',
{failureRedirect:'/login'}),
function(req, res){
res.redirect('/');
res.status(200).json({"msg":"Estas Logueado"});
});

module.exports=router; 