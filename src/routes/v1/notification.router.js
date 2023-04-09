const express = require("express");

const app = express();

const bodyParser = require("body-parser");
const Notification = require("../../controllers/notification.controller");
const multer = require('multer')
const uploadFile = require('../../middlewares/uploadNotification.middleware')

const routers = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routers.get("/getAllNotification", Notification.getAllNotification);
routers.get("/getOneNotification/:id", Notification.getOneNotification);
routers.post("/addNotification", Notification.addNotification);
routers.delete("/delNotification/:id", Notification.delNotification);
routers.put("/updateNotification/:id", Notification.updateNotification);
routers.get("/searchNotification/:keyw", Notification.searchNotification);
routers.post(
  "/importNotificationFile",uploadFile.single('file'),Notification.importNotificationFile
);
routers.get("/exportNotificationFile", Notification.exportNotificationFile);

module.exports = routers;
