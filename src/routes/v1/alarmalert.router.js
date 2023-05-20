const express = require("express");

const app = express();

const bodyParser = require("body-parser");
const AlarmMsg = require("../../controllers/alarmalert.controller");
const routers = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routers.get("/get/all/alarmalert", AlarmMsg.getAllAlarmAlert);
routers.get("/get/one/alarmalert/:id", AlarmMsg.getOneAlarmAlert);
routers.post("/post/add/alarmalert", AlarmMsg.addAlarmAlert);
routers.delete("/delete/del/alarmalert/:id", AlarmMsg.delAlarmAlert);
routers.put("/put/update/alarmalert/:id", AlarmMsg.updateAlarmAlert);

module.exports = routers;
