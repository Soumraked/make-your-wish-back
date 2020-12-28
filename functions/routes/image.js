const express = require("express");
const app = express.Router();

const { admin, db, config} = require("../utils/init");
const {  Auth } = require("../utils/middleware");

app.post("/upload/:folder/:name", (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};
  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    imageFileName = `${req.params.name}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        destination: `${req.params.folder}/${imageFileName}`,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${req.params.folder}%2F${imageFileName}?alt=media`;
        db.doc(`/image/${req.params.folder}`)
          .get()
          .then((doc) => {
            let image = {};
              image[req.params.name] = imageUrl;
            if (doc.exists) {
              db.doc(`/image/${req.params.folder}`).update(image);
              return res.status(200).json({ url: imageUrl });
            } else {
              db.doc(`/image/${req.params.folder}`).set(image);
              return res.status(200).json({  url: imageUrl });
            }
          });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ error: err.code });
      });
  });
  busboy.end(req.rawBody);
});

module.exports = app;