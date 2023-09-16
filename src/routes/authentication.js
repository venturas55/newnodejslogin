const express = require('express');
const { Passport } = require('passport');
const router = express.Router();
const passport=require('passport');

const funciones = require('../lib/funciones');

router.get('/signup',funciones.isNotAuthenticated,(req,res)=>{
    res.render('auth/signup')
});

router.post('/signup', passport.authenticate('local.signup',{
        successRedirect: '/profile',
        failureRedirect: '/signup',
        passReqToCallback: true,
        failureFlash: true
    })
);

router.get('/signin',funciones.isNotAuthenticated,(req,res)=>{
    res.render('auth/signin');
});

router.post('/signin',(req,res,next)=>{
   passport.authenticate('local.signin',{
       successRedirect: '/profile',
       failureRedirect: '/signin',
       failureFlash:true

   })(req,res,next);
});

router.get('/profile',funciones.isAuthenticated ,(req,res)=>{
    res.render('profile');
});

router.get('/profile/edit',funciones.isAuthenticated ,(req,res)=>{
    res.render('profileEdit');
});
router.post('/profile/edit/',funciones.isAuthenticated ,async (req,res)=>{
     const newUser = {
        usuario:    req.body.usuario,
        contrasena: req.body.contrasena,
        email:      req.body.email,
        full_name:  req.body.fullname,
        privilegio: "san",
    }; 
    //newUser.contrasena = await funciones.encryptPass(password);
    console.log("guardando en la BBDD");
    //console.log(user);
    res.render('profile');
});

router.get('/logout',funciones.isAuthenticated ,(req,res)=>{
    req.logOut();
    res.redirect('/');
})

//TODO: Añadir posibilidad de cambio de contraseña del usuario

module.exports = router;