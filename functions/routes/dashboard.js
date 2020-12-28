const express = require("express");
const app = express.Router();

const { db } = require("../utils/init");
const { Auth } = require("../utils/middleware");
const { isEmpty } = require("../utils/functions");

app.get("/statistics", (req, res) => {
  db.doc('/statistics/products')
  .get()
  .then((doc) => {
    if(doc.exists){
      return {stProducts: doc.data()};
    }
  })
  .then((info) => {
    db.collection('products')
    .get()
    .then((snapshot) => {
      let data = {};
      snapshot.forEach((doc) => {
        data[doc.id] =  doc.data();
      });
      info.infoProducts = data;
      return info;
      
    })
    .then((info) => {
      procesar(res,info);
    })
    .catch(() => {
      return res.status(500).json({ message:"A ocurrido un problema al rescatar las estadísticas.[INFOPRODUCTS]" });
    });
  })
  .catch(() => {
    return res.status(500).json({ message: "A ocurrido un problema al rescatar las estadísticas.[PRODUCTS]" });
  });
});

const procesar = (res, info) => {
  let keysInfo = Object.keys(info.infoProducts);
  let keysSt = Object.keys(info.stProducts);
  for(let i=0; i<keysInfo.length;i++){
    info.infoProducts[keysInfo[i]].access = keysSt.includes(keysInfo[i]) ? info.stProducts[keysInfo[i]] : 0;
  }
  return res.status(200).json(info.infoProducts);
}


app.get("/access", (req, res) => {
  db.doc('/statistics/access')
  .get()
  .then((doc) => {
    if(doc.exists){
      return res.status(200).json(doc.data());
    }
  })
  .catch(() => {
    return res.status(500).json({ message: "A ocurrido un problema al rescatar las estadísticas [ACCESS]." });
  });
});

app.get("/products/:num", (req, res) => {
  db.doc('/statistics/products')
  .get()
  .then((doc) => {
    if(doc.exists){
      let keys = Object.keys(doc.data());
      let map = [];
      for(let i=0; i<keys.length; i++){
        map.push({name: keys[i], value: doc.data()[keys[i]]});
      }
      map.sort(function (a, b) {
        if (a.value < b.value) {
          return 1;
        }
        if (a.value > b.value) {
          return -1;
        }
        return 0;
      });
      let data = {};
      for(let i=0;i<map.slice(0,req.params.num).length;i++){
        data[map[i].name] = map[i].value;
      }
      return {data,map: map.slice(0,req.params.num)};
    }
  })
  .then((info) => {
    db.collection('products')
    .get()
    .then((snapshot) => {
      let data = {};
      snapshot.forEach((doc) => {
        if(Object.keys(info.data).includes(doc.id)){
          let aux = doc.data();
          aux.access = info.data[doc.id];
          data[doc.id] =  aux;
        }
      });
      let map = {};
      for(let i=0; i<info.map.length;i++){
        map[info.map[i].name] = data[info.map[i].name];
        //console.log(data[info.map[i].name])
      }
      
      return res.status(200).json(map);
      
    })
    .catch(() => {
      return res.status(500).json({ message:"A ocurrido un problema al rescatar las estadísticas.[INFOPRODUCTS]" });
    });
  })
  .catch(() => {
    return res.status(500).json({ message: "A ocurrido un problema al rescatar las estadísticas.[PRODUCTS]" });
  });
});

module.exports = app;