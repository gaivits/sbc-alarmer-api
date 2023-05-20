const express = require("express");

const app = express();

const bodyParser = require("body-parser");
const Report = require("../../controllers/report.controller");

const routers = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routers.get("/get/all/report/all", Report.getAllReport);
routers.get("/get/all/alarm", Report.getAllReportAlarm);
routers.get(
  "/get/all/alarm/:alarm_startdate/:alarm_enddate",
  Report.getAllReportAlarmDate
);
routers.get(
  "/get/one/alarm/:sbc_name/:alarm_startdate/:alarm_enddate",
  Report.getOneReportAlarmSelect
);
routers.get("/get/all/daily", Report.getAllReportDaily);
routers.get(
  "/get/all/daily/:daily_startdate/:daily_enddate",
  Report.getAllReportDailyDate
);
routers.get(
  "/get/one/daily/:sbc_name/:daily_startdate/:daily_enddate",
  Report.getOneReportDailySelect
);
routers.get("/get/all/detail", Report.getAllReportDetail);
routers.get(
  "/get/all/detail/:start_date/:end_date",
  Report.getAllReportDetailDate
);
routers.get(
  "/get/one/detail/:sbc_name/:start_date/:end_date",
  Report.getOneReportDetailSelect
);
routers.post("/post/add/report", Report.addReport);
routers.get(
  "/get/report/range/:start_datetime/:end_datetime",
  Report.getAllReportByRange
);
module.exports = routers;
