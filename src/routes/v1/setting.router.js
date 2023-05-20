const express = require("express");
const app = express();
const routers = express.Router();

const bodyParser = require("body-parser");
const Setting = require("../../controllers/setting.controller");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
routers.get("/get/all/setting", Setting.getAllSetting);
routers.get("/get/one/setting/:id", Setting.getOneSetting);
routers.post("/post/add/setting", Setting.addSetting);
routers.delete("/delete/del/setting/:id", Setting.delSetting);
routers.put("/put/update/setting/:id", Setting.updateSetting);
routers.get("/get/search/setting/:keyw", Setting.searchSetting);

module.exports = routers;
