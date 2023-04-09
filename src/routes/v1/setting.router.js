const express = require("express");

const app = express();

const PORT = 3333;
const bodyParser = require("body-parser");
const Setting = require("../../controllers/setting.controller");
const conn = require("../../configs/configdb.js");

const routers = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
routers.get("/getAllSetting", Setting.getAllSetting);
routers.get("/getOneSetting/:id", Setting.getOneSetting);
routers.post("/addSetting", Setting.addSetting);
routers.delete("/delSetting/:id", Setting.delSetting);
routers.put("/updateSetting/:id", Setting.updateSetting);
routers.get("/searchSetting/:keyw", Setting.searchSetting);

module.exports = routers;
