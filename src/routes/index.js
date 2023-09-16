const express= require('express');
const router = express.Router();

router.get('/',(req,res)=>{
    res.render('index');
} );

router.get('/pagina_aux1',(req,res)=>{
    res.render('pagina_aux1');
} );

router.get('/pagina_aux2',(req,res)=>{
    res.render('pagina_aux2');
} );



module.exports=router;