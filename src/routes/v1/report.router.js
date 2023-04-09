const express = require("express");

const app = express();

const bodyParser = require("body-parser");
const Report = require("../../controllers/report.controller");

const routers = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routers.get("/getAllReport", Report.getAllReport);
routers.post("/addReport", Report.addReport);
routers.get("/getAllReportByRange", Report.getAllReportByRange);
module.exports = routers;
