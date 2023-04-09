const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Users = require("../../controllers/users.controller");
const routers = express.Router();
const verifyToken = require("../../services/auth.service")
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routers.get("/getAllUsers", Users.getAllUsers);
routers.post("/addUsers", Users.addUsers);
routers.put("/updateOrForgetUsers", Users.updateOrForgetUsers);
routers.post("/loginUsers",Users.loginUsers);
module.exports = routers;
