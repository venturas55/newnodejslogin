const express = require("express");
const router = express.Router();
const { unlink } = require('fs-extra');
const path = require('path');

const funciones = require("../lib/funciones");

const db = require("../database"); //db hace referencia a la BBDD
//SETTINGS
 //TODO: DONDE columnaF es numeral //TODO:

//GESTION DEL CRUD
//CREATE
router.get("/add", funciones.isAuthenticated, (req, res) => {
  res.render("items1/add");
});
router.post("/add", funciones.isAuthenticated, async (req, res) => {
  const {
    columnaA,
    columnaB,
    columnaC,
    columnaD,
    columnaE,
    columnaF,
    columnaGnum,
  } = req.body;
  const item_1 = {
    columnaA,
    columnaB,
    columnaC,
    columnaD,
    columnaE,
    columnaF,
    columnaGnum,

  };

  await db.query("INSERT INTO items1 set ?", [item_1]);

  req.flash("success", "Item_1 insertada correctamente");
  res.redirect("/items1/list"); //te redirige una vez insertado el item
});
//READ
router.get("/list", async (req, res) => {
  const items1 = await db.query("SELECT * FROM items1 order by columnaA",);
  res.render("items1/list", { items1 });
  //res.render("items1/list", { items1: items1 });
  // NO FUNCIONA CON LA BARRA DELANTE res.render('/links/list');
});
router.get("/list/:busqueda", async (req, res) => {
  var { busqueda } = req.params;
  busqueda = "%" + busqueda + "%";
  const columnaX = "nombreColumnaAbuscar";
  const items1 = await db.query("SELECT * FROM items1 where ? like ? order by columnaA", columnaX, busqueda);
  //like is case insensitive por defecto. En caso de quererlo sensitivo hay que añadir solo "like binary"
  res.render("items1/list", { items1 });
  // NO FUNCIONA CON LA BARRA DELANTE res.render('/links/list');
});
router.get("/list/:filtro/:valor", async (req, res) => {
  var obj = req.params;
  var items1;
  //Añadimos porcentajes para busqueda SQL que contenga 'busqueda' y lo que sea por delante y por detras
  console.log(obj);
  console.log("=>" + obj.valor);
  if (obj.valor == "undefinidio") {
    console.log("por aqui");
    items1 = await db.query("SELECT * FROM items1  order by columnaA");
  } else {
    console.log("por alla");
    switch (obj.filtro) {
      case 'columnaA':

        items1 = await db.query("SELECT * FROM items1 where columnaA like ? order by columnaA", obj.valor);
        break;
      case 'columnaB':
        items1 = await db.query("SELECT * FROM items1 where columnaB like ? order by columnaA", obj.valor);
        break;
      case 'columnaC':
        items1 = await db.query("SELECT * FROM items1 where columnaC like ? order by columnaA", obj.valor);
        break;
      case 'columnaD':
        items1 = await db.query("SELECT * FROM items1 where columnaD like ? order by columnaA", obj.valor);
        break;
      case 'columnaE':
        items1 = await db.query("SELECT * FROM items1 where columnaE like ? order by columnaA", obj.valor);
        break;
      case 'columnaF':
        items1 = await db.query("SELECT * FROM items1 where columnaF like ? order by columnaA", obj.valor);
        break;
      case 'columnaGnum':
        items1 = await db.query("SELECT * FROM items1 where columnaGnum like ? order by columnaA", obj.valor);
        break;
    }
  }
  //like is case insensitive por defecto. En caso de quererlo sensitivo hay que añadir solo "like binary"
  res.render("items1/list", { items1 ,obj});
  // NO FUNCIONA CON LA BARRA DELANTE res.render('/links/list');
});
router.get("/plantilla/:columnaA", async (req, res) => {
  const { columnaA } = req.params;

  const item = await db.query('SELECT * FROM items1 where columnaA=?', [columnaA]);
  const observaciones = await db.query('SELECT * FROM observaciones_item1 where columnaA=?', [columnaA]);
  const mantenimiento = await db.query('SELECT * FROM mantenimientos_item1 where columnaA=? order by fecha desc', [columnaA]);

  var fotitos = funciones.listadoFotos(columnaA);
  console.log("==>" + fotitos);

  res.render("items1/plantilla", { layout: 'layoutPlantillaItem1', item: item[0], obs: observaciones, mant: mantenimiento, imagen: fotitos });
  // NO FUNCIONA CON LA BARRA DELANTE res.render('/links/list');
});
//UPDATE
router.get("/edit/:columnaA", funciones.isAuthenticated, async (req, res) => {
  const { columnaA } = req.params;
  const item = await db.query("SELECT * FROM items1 WHERE columnaA=?", [columnaA,]);
  //console.log(item[0]);
  res.render("items1/edit", { item: item[0] });
});
router.post("/edit/:columnaA", funciones.isAuthenticated, async (req, res) => {
  const columnaAviejo = req.params.columnaA;
  var {
    columnaA,
    columnaB,
    columnaC,
    columnaD,
    columnaE,
    columnaF,
    columnaGnum,
  } = req.body;
  //TODO: PARSEAR LAS COLUMNAS QUE SEAN INT/FLOAT eg: columnaF = parseInt(columnaF);
  const newItem = {
    columnaA,
    columnaB,
    columnaC,
    columnaD,
    columnaE,
    columnaF,
    columnaGnum,
  };
  //console.log(newItem);
  console.log("req.params " + req.params.columnaA);
  await db.query("UPDATE items1 set ? WHERE columnaA = ?", [newItem, columnaAviejo,]);
  req.flash("success", "Item1 modificado correctamente");
  res.redirect("/items1/plantilla/" + newItem.columnaA);
});
//DELETE
router.get("/delete/:columnaA", funciones.isAuthenticated, async (req, res) => {

  console.log(req.params.columnaA);
  const { columnaA } = req.params;
  await db.query("DELETE FROM mantenimientos_item1 WHERE columnaA=?", [columnaA]);
  await db.query("DELETE FROM observaciones_item1 WHERE columnaA=?", [columnaA]);
  await db.query("DELETE FROM items1 WHERE columnaA=?", [columnaA]);

  //TODO: faltaria borrar la carpeta con las fotos
  req.flash("success", "Item1 borrado correctamente");
  res.redirect("/items1/list");
});

//GESTION DE FOTOS
router.get("/fotos/:columnaA", async (req, res) => {
  const columnaA = req.params.columnaA;
  var fotos = funciones.listadoFotos(columnaA);
  res.render("items1/fotos", { fotos, columnaA });
});
router.get("/fotos/:columnaA/:src/delete", async (req, res) => {
  const columnaA = req.params.columnaA;
  const src = req.params.src;
  await unlink(path.resolve('src/public/img/imagenes/' + columnaA + "/" + src));
  req.flash("success", "Foto de baliza " + columnaA + " borrada correctamente.");
  res.redirect("/items1/fotos/" + columnaA);
});
router.post("/upload/:columnaA", async (req, res) => {
  const { columnaA } = req.params;
  const { user } = req.body;
  console.log(req.params);
  console.log(req.body);
  if (typeof user === 'undefined') {
    req.flash("success", "Foto de la baliza " + columnaA + " subida correctamente!");
    res.redirect("/items1/plantilla/" + columnaA);
  } else {
    //const oldUser = await pool.query("SELECT * FROM usuarios WHERE usuario=?", user);
    // var newUser=oldUser;
    //newUser.profilePicture = 
    // await db.query("UPDATE usuarios set ? WHERE usuario = ?", [ newUser,  oldUser, ]);
    req.flash("success", "La foto del perfil de usuario ha sido actualizada con exito");
    res.redirect("/profile");
  }

});
//GESTION DE OBSERVACIONES
router.post("/observaciones/add", funciones.isAuthenticated, async (req, res) => {
  const {
    columnaA,
    observaciones,
  } = req.body;
  const observa = {
    columnaA,
    observaciones,
  };
  console.log(observa);
  await db.query("INSERT INTO observaciones_item1 SET ?", [observa]);
  req.flash("success", "Observacion insertada correctamente");
  res.redirect("/items1/plantilla/" + columnaA);
});
router.get("/observaciones/delete/:idObs", funciones.isAuthenticated, async (req, res) => {
  console.log(req.params.idObs);
  const { idObs } = req.params;
  const resp = await db.query("select columnaA from observaciones_item1 where id_observacion=?", [idObs]);
  const columnaA = resp[0].columnaA;
  await db.query("delete from observaciones_item1 where id_observacion=?", [idObs]);
  req.flash("success", "Observacion de item1 " + columnaA + " borrada correctamente.");
  res.redirect("/items1/plantilla/" + columnaA);
});
router.get("/observaciones/edit/:idObs", funciones.isAuthenticated, async (req, res) => {
  const { idObs } = req.params;
  console.log("Que id es: " + idObs);
  const observacion = await db.query("SELECT * FROM observaciones_item1 WHERE id_observacion=?", [idObs,]);
  //console.log(baliza);
  //console.log(baliza[0]);
  res.render("items1/editObservaciones", { observacion: observacion[0] });
});
router.post("/observaciones/edit/:idObs", funciones.isAuthenticated, async (req, res) => {
  var {
    id_observacion,
    columnaA,
    observacionNueva,
  } = req.body;
  const newObservacion = {
    id_observacion,
    columnaA,
    observaciones: observacionNueva,
  };
  await db.query("UPDATE observaciones_item1 set ? WHERE id_observacion = ?", [
    newObservacion,
    id_observacion,
  ]);
  req.flash("success", "Observacion modificada correctamente en el Item " + columnaA);
  res.redirect("/items1/plantilla/" + columnaA);
});


//GESTION DE MANTENIMIENTOS
router.post("/mantenimiento/add", funciones.isAuthenticated, async (req, res) => {
  const {
    columnaA,
    fecha,
    mantenimiento,
  } = req.body;
  const mant = {
    columnaA,
    fecha,
    mantenimiento,
  };
  await db.query("INSERT INTO mantenimientos_item1 set ?", [mant]);
  req.flash("success", "Mantenimiento en baliza insertado correctamente");
  res.redirect("/items1/plantilla/" + columnaA);
});
router.get("/mantenimiento/delete/:idMan", funciones.isAuthenticated, async (req, res) => {
  console.log(req.params.idMan);
  const { idMan } = req.params;
  const resp = await db.query("select columnaA from mantenimientos_item1 where id_mantenimiento=?", [idMan]);
  const columnaA = resp[0].columnaA;
  await db.query("delete from mantenimientos_item1 where id_mantenimiento=?", [idMan]);
  req.flash("success", "mantenimiento de item1 " + columnaA + " borrado correctamente ");
  res.redirect("/items1/plantilla/" + columnaA);
});
router.get("/mantenimiento/edit/:idMan", funciones.isAuthenticated, async (req, res) => {
  const { idMan } = req.params;
  //console.log("Que id es: "+idMan);
  const mantenimient = await db.query("SELECT * FROM mantenimientos_item1 WHERE id_mantenimiento=?", [idMan,]);
  console.log(mantenimient[0]);
  res.render("items1/editMantenimiento", { mant: mantenimient[0] });

});
router.post("/mantenimiento/edit/:idMan", funciones.isAuthenticated, async (req, res) => {
  var {
    id_mantenimiento,
    columnaA,
    fechaNueva,
    mantenimientoNuevo
  } = req.body;

  const newObservacion = {
    id_mantenimiento,
    columnaA,
    fecha: fechaNueva,
    mantenimiento: mantenimientoNuevo,
  };
  await db.query("UPDATE mantenimientos_item1 set ? WHERE id_mantenimiento = ?", [
    newObservacion,
    id_mantenimiento,
  ]);
  req.flash("success", "Mantenimiento modificado correctamente en la baliza " + columnaA);
  res.redirect("/items1/plantilla/" + columnaA);
});

module.exports = router;
