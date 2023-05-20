const express = require("express");

const app = express();

const bodyParser = require("body-parser");
const AlarmMsg = require("../../controllers/alarmmsg.controller");
const routers = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routers.get("/get/all/alarmmsg", AlarmMsg.getAllAlarmMsg);
routers.get("/get/one/alarmmsg/:id", AlarmMsg.getOneAlarmMsg);
routers.post("/post/add/alarmmsg", AlarmMsg.addAlarmMsg);
routers.delete("/delete/del/alarmmsg/:id", AlarmMsg.delAlarmMsg);
routers.put("/put/update/alarmmsg/:id", AlarmMsg.updateAlarmMsg);

module.exports = routers;
