//Cloud Functions
const { functions } = require("./utils/init");

//imports
const express = require("express");
const cors = require("cors");

const app = express();

//uses
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/products", require("./routes/products"));
app.use("/admin", require("./routes/accounts"));
app.use("/information", require("./routes/information"));
app.use("/contact", require("./routes/contact"));

//export
exports.api = functions.https.onRequest(app);