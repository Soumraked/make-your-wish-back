const express = require("express");
const app = express.Router();

const { db } = require("../utils/init");
const { Auth } = require("../utils/middleware");
const { isEmpty } = require("../utils/functions");

app.post("/send", (req,res) => {
  const message = {
    mail: req.body.mail.toString().toLowerCase(),
    affair: req.body.affair.toString(), 
    message: req.body.message.toString(),
  };
  let send = {};
  send.read = false;
  let errors = {};
  if (!isEmpty(message.mail)){
    send.mail = message.mail;
  }else{
    errors.mail = "Must no be empty";
  }
  if (!isEmpty(message.affair)){
    send.affair = message.affair;
  }else{
    send.affair = "Sin asunto";
  }
  if (!isEmpty(message.message)){
    send.message = message.message;
  }else{
    errors.message = "Must no be empty";
  }

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  db.doc(`/contact/${Date.now()}`).set(send)
  .then(() => {
    return res.status(200).json({message: "Mensaje enviado con exito."});
  })
  .catch((error) => {
    return res.status(500).json({message: "A ocurrido un error al enviar el mensaje."});
  });
});

app.get("/get", Auth, (req, res) => {
  db.collection('contact')
    .get()
    .then((snapshot) => {
      let data = [];
      snapshot.forEach((doc) => {
        data.push( doc.data());
      });
      return res.status(200).json( data );
    })
    .catch(() => {
      return res.status(500).json({ message: "A ocurrido un problema durante el ingreso del producto." });
    });
});

app.put("/read", Auth, (req, res) => {
  const id =req.body.id.toString();
  if (isEmpty(id)) return res.status(400).json({message: "Error al ingreso de la acción."});

  db.doc(`/contact/${id}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return db.collection("contact").doc(id).update({read:true});
      } else {
        return res.status(404).json({ error: "Mensaje no encontrado." });
      }
    }).then(() => {
      return res.status(200).json({ message: "Mensaje marcado como leido." });
    })
    .catch((error) => {
      return res.status(500).json({ error });
    });

});

module.exports = app;