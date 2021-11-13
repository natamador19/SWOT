const passport=require('passport');
const FacebookStrategy=require('passport-facebook').Strategy;
var dotenv=require('dotenv');
dotenv.config();
var {
    FACEBOOK_APP_ID,FACEBOOK_APP_SECRET
}=process.env;

passport.serializeUser(function(user,done){
    done(null,user);
});

passport.deserializeUser(function(user,done){
    done(null,user);
});

// /auth/facebook redirecciona a el Login Page de Facebook
// /auth/facebook/callback  llamado si el login con Facebook fue exitoso
// /auth/error este saldra si ha ocurrido un error mediante la autentificacion con facebook
passport.use(new FacebookStrategy({
    clientID:FACEBOOK_APP_ID,
    clientSecret:FACEBOOK_APP_SECRET,
    callbackURL:"http://localhost:3000/api/hw/facebook/auth/facebook/callback"
},
function (accessToken, refreshToken, profile,done){
    return done(null,profile);
}));

