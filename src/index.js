const express = require("express");
const app = express();
const endpoint = require("./roteadores");

app.use(express.json());

app.use(endpoint);

app.listen(3000, () => console.log("servidor inicializado"));