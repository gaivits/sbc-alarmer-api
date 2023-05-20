const express = require("express");

const app = express();
const folderPath = "/Users/phongsakorn/Desktop/sbc-alarmer-apis/src/uploads";
const bodyParser = require("body-parser");
const Notification = require("../../controllers/notification.controller");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const uploadFile = multer({ storage: storage });
const routers = express.Router();



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routers.get("/get/all/notification", async function (req, res) {
  var result = await Notification.getAllNotification();
  res.json(result);
});

routers.get("/get/all/email", async function (req, res) {
  var result = await Notification.autoSendEmail();
  res.json(result);
});

routers.post("/post/add/notification", Notification.addNotification);
routers.get("/get/one/notification/:id", Notification.getOneNotification);
routers.delete("/delete/del/notification/:id", Notification.delNotification);
routers.put("/put/update/notification/:id", Notification.updateNotification);
routers.post("/put/update/notification/interval", Notification.updateInterval);
routers.get("/get/search/notification/:keyw", Notification.searchNotification);

routers.get("/get/delete/file", Notification.deleteFileImport);

routers.post("/post/import/notification", Notification.importNotificationFile);

routers.get("/get/export/notification", async function (req, res) {
  var result = await Notification.exportNotificationFile();
  res.json(result);
});

routers.get("/get/checkalarm/notification", Notification.checkAlarm);

routers.get("/get/checkalert/notification", Notification.checkAlert);

routers.get("/get/email/notification", async function (req, res) {
  var result = await Notification.selectNotification();
  res.json(result);
});
routers.get("/get/alarmmsg/notification", async function (req, res) {
  var result = await Notification.selectAlarmMsg();
  res.json(result);
});

routers.get("/get/alarmalert/notification", async function (req, res) {
  var result = await Notification.selectAlarmAlert();
  res.json(result);
});

routers.get("/put/update/notification/email", async function (req, res) {
  var result = await Notification.updateEmail();
  res.json(result);
});

routers.post("/post/add/notification/sendemail", Notification.postSendEmail);

routers.get("/get/delete/file", Notification.deleteFileImport);

module.exports = routers;
