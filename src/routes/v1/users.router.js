const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Users = require("../../controllers/users.controller");
const routers = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routers.post("/post/login/users", Users.loginUsers);
module.exports = routers;
