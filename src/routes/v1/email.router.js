const express = require("express");

const app = express();

const bodyParser = require("body-parser");
const Email = require("../../controllers/email.controller");
const routers = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routers.get("/getAllEmail",Email.getAllEmail);
routers.get("/getOneEmail/:id", Email.getOneEmail);
routers.post("/addEmail", Email.addEmail);
routers.delete("/delEmail/:id",Email.delEmail);
routers.put("/updateEmail/:id", Email.updateEmail);
routers.get("/searchEmail/:keyw", Email.searchEmail);

module.exports = routers;
