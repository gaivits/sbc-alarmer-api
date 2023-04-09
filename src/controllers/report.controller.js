const mssql = require("mssql");
const schema = require("../models/notification.model.js");
const crypto = require("crypto");
const fs = require("fs");
const child_process = require("child_process");
var a = new Date();
var month = ("0" + (a.getMonth() + 1)).slice(-2);
var date = ("0" + a.getDate()).slice(-2);
var cur_now = a.getFullYear() + "-" + month + "-" + date;

const getAllReport = async (req, res) => {
  let request = new mssql.Request();
  if (schema.validate.error) {
    res.status(422).json({
      err: schema.error,
    });
  } else {
    request.query(
      "SELECT * FROM sbc_ptt_notification",
      async function (err, results) {
        await res.status(200).json(results.recordsets);
      }
    );
  }
};

const getAllReportByRange = async (req, res) => {
  let request = new mssql.Request();
  let {start_date,end_date}=req.params
  request.input('start_date',req.params.start_date)
  request.input('end_date',req.params.end_date)
  request.multiple=true
  if (schema.validate.error) {
    res.status(422).json({
      err: schema.error,
    });
  } else {
    request.query(
      "select * from sbc_ptt_report LEFT JOIN sbc_ptt_notification on sbc_ptt_report.start_date=sbc_ptt_notification.created_at;",
      async function (err, results) {
        await res.status(200).json(results.recordsets);
      }
    );
  }
};
const addReport = async (req, res) => {
  let { start_date, end_date, start_time, end_time } = req.body;
  let request = new mssql.Request();

  request.input("start_date", req.body.start_date);
  request.input("end_date", req.body.end_date);
  request.input("start_time", req.body.start_time);
  request.input("end_time", req.body.end_time);

  if (schema.validate.error) {
    res.status(422).json({
      err: schema.error,
    });
  } else if (req.body.start_date < cur_now) {
    res.status(400).json({ err: "start_date lesser than current date" });
  } else if (req.body.end_date < req.body.start_date) {
    res.status(400).json({ err: "end_date lesser than start_date" });
  } else {
    request.query(
      "INSERT INTO sbc_ptt_report(start_date,end_date,start_time,end_time) VALUES (@start_date,@end_date,@start_time,@end_time)",
      async function (err, results) {
        if (err) {
          await res.status(400).json({ err: err });
        } else {
          await res.sendStatus(201);
        }
      }
    );
  }
};

module.exports = {
  getAllReport,
  addReport,
  getAllReportByRange
};
