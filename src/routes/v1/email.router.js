const express = require("express");

const app = express();

const bodyParser = require("body-parser");
const Email = require("../../controllers/email.controller");
const routers = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routers.get("/get/all/email", Email.getAllEmail);
routers.get("/get/one/email/:id", Email.getOneEmail);
routers.post("/post/add/email", Email.addEmail);
routers.delete("/delete/del/email/:id", Email.delEmail);
routers.put("/put/update/email/:id", Email.updateEmail);
routers.get("/get/search/email/:keyw", Email.searchEmail);

module.exports = routers;
