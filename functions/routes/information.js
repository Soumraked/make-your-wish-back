const express = require("express");
const app = express.Router();

const { db } = require("../utils/init");
const { Auth } = require("../utils/middleware");
const { isEmpty } = require("../utils/functions");

app.put("/modify", Auth, (req, res) => {
  const information = {
    mail: req.body.mail.toString().toLowerCase(),
    facebook: req.body.facebook.toString(), 
    instagram: req.body.instagram.toString(),
    whatsapp: req.body.whatsapp.toString(),
    direction: req.body.direction.toString(),
  };

  let update = {};
  if (!isEmpty(information.mail)) update.mail = information.mail;
  if (!isEmpty(information.facebook)) update.facebook = information.facebook;
  if (!isEmpty(information.instagram)) update.instagram = information.instagram;
  if (!isEmpty(information.whatsapp)) update.whatsapp = information.whatsapp;
  if (!isEmpty(information.direction)) update.direction = information.direction;

  if (Object.keys(update).length == 0) return res.status(200).json("Ningún campo fue modificado.");
  db.doc(`/information/public`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return db.collection("information").doc("public").update(update);
      } else {
        return db.collection("information").doc("public").set(update);
      }
    }).then(() => {
      return res.status(200).json({ message: "Información modificada con éxito ingresado exitosamente." });
    }).catch(() => {
      return res.status(500).json({ message: "A ocurrido un problema durante la modificación de la información." });
    });
});

app.get("/get", (req, res) => {
  db.doc(`/information/public`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(200).json(doc.data());
      }else{
        return res.status(404).json({ message: "Información pública no encontrada." });
      }
    }).catch(() => {
      return res.status(500).json({ message: "A ocurrido un problema durante la solicitud." });
    });
});

module.exports = app;