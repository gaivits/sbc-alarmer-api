const express = require("express");

const app = express();

const bodyParser = require("body-parser");
const Recipient = require("../../controllers/recipient.controller");

const routers = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routers.get("/get/all/recipient", Recipient.getAllRecipient);
routers.get("/get/email/recipient", Recipient.getEmailRecipient);
routers.post("/post/add/recipient", Recipient.addRecipient);
routers.post("/post/del/add/recipient", Recipient.addDelRecipient);
routers.put("/put/update/recipient/:id", Recipient.updateRecipient);
routers.delete("/delete/del/recipient", Recipient.delRecipient);

module.exports = routers;
