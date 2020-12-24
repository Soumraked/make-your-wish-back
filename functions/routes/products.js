const express = require("express");
const app = express.Router();

const { db } = require("../utils/init");
const { Auth } = require("../utils/middleware");
const { isEmpty } = require("../utils/functions");

app.post("/add", Auth, (req, res) => {
  const product = {
    // id: req.body.id.toString(),
    name: req.body.name.toString(),
    model: req.body.model.toString(),
    desc: req.body.desc.toString(),
    value: req.body.value.toString(),
    img: req.body.img.toString(),
  };
  let errors = {};
  if (isEmpty(product.name)) errors.name = "Must no be empty";
  if (isEmpty(product.model)) errors.model = "Must no be empty";
  if (isEmpty(product.desc)) errors.desc = "Must no b  e empty";
  if (isEmpty(product.value)){ 
    errors.value = "Must no be empty" 
  }else {
    product.value = parseInt(product.value);
  }
  if (isEmpty(product.img)) errors.img = "Must no be empty";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  product.id = (product.name.trim().substr(0,1) + product.model.split(' ').join('')).toUpperCase();

  db.doc(`/products/${product.id}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(409).json({ message: "El id del producto ya se encuentra ingresado." });
      } else {
        return db.doc(`/products/${product.id}`).set(product);
      }
    }).then(() => {
      return res.status(200).json({ message: "Producto ingresado exitosamente." });
    }).catch(() => {
      return res.status(500).json({ message: "A ocurrido un problema durante el ingreso del producto." });
    });
});

app.get("/getDetails/:id", (req, res) => {
  const id = req.params.id.toString().toUpperCase();
  db.doc(`/products/${id}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return doc;
      }else{
        return res.status(404).json({ message: "El producto no se encontró en la base de datos." });
      }
    })
    .then((doc) => {
      db.doc(`/statistics/products`)
      .get()
      .then((aux) => {
        if (aux.exists) {
          if(Object.keys(aux.data()).includes(id)){
            db.collection("statistics").doc("products").update({[id]: aux.data()[id] + 1});
          }else{
            db.collection("statistics").doc("products").update({[id]: 1});
          }
        } else {
          db.collection("statistics").doc("products").set({[id]:1});
        }
      });
      return doc;
    })
    .then((doc) => {
      return res.status(200).json({ name: doc.data().name, model: doc.data().model, desc: doc.data().desc, value: doc.data().value, img : doc.data().img });
    })
    .catch(() => {
      return res.status(500).json({ message: "A ocurrido un problema durante el ingreso del producto." });
    });
});

app.get("/get", (req, res) => {
  db.collection('products')
    .get()
    .then((snapshot) => {
      let data = [];
      snapshot.forEach((doc) => {
        data.push( doc.data());
      });
      return data;
      
    })
    .then((data) => {
      db.doc(`/statistics/access`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          db.collection("statistics").doc("access").update({access: doc.data().access + 1});
        } else {
          db.collection("statistics").doc("access").set({access: 1});
        }
      });
      return data;
    })
    .then((data) => {
      return res.status(200).json( data );
    })
    .catch(() => {
      return res.status(500).json({ message: "A ocurrido un problema durante el ingreso del producto." });
    });
});

app.get("/search", (req, res) => {
  db.collection('products')
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

app.put("/update", Auth, (req, res) => {
  const product = {
    id: req.body.id.toString().toUpperCase(),
    desc: req.body.desc.toString(), 
    value: req.body.value.toString(),
    img: req.body.img.toString(),
  };
  let updateProduct = {};
  if (!isEmpty(product.desc)) updateProduct.desc = product.desc;
  if (!isEmpty(product.value)) updateProduct.value = parseInt(product.value);
  if (!isEmpty(product.img)) updateProduct.img = product.img;

  if (isEmpty(product.id)) return res.status(400).json({message: "Debe ingresar el id del producto."});

  db.doc(`/products/${product.id}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return db.collection("products").doc(product.id).update(updateProduct);

      } else {
        return res.status(404).json({ error: "Producto no encontrado." });
      }
    }).then(() => {
      return res.status(200).json({ message: "Producto modificado con exito." });
    })
    .catch((error) => {
      return res.status(500).json({ error });
    });

});

app.delete("/delete", Auth, (req, res) => {
  const id = req.body.id;
  db.doc(`/products/${id}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        db.doc(`/products/${id}`).delete();
      } else {
        return res.status(404).json({ error: "Producto no encontrado." });
      }
    })
    .then(() => {
      return res.status(200).json({ message: "Producto eliminado con exito." });
    })
    .catch((error) => {
      return res.status(500).json({ error });
    });
});



module.exports = app;