const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Role = require("../../controllers/role.controller");
const routers = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routers.get("/get/all/users", Role.getAllUsers);
routers.post("/post/add/users", Role.addUsers);
routers.put("/put/update/users/:id", Role.updateOrForgetUsers);
routers.delete("/del/delete/users/:id", Role.delUsers);
module.exports = routers;
