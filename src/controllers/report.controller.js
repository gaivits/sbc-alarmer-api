const mssql = require("mssql");
const moment = require("moment");
const schema = require("../models/notification.model.js");
const crypto = require("crypto");
const fs = require("fs");
const child_process = require("child_process");
const conn = require("../configs/configdb");
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
    request.query("SELECT * FROM report ", async function (err, results) {
      await res.status(200).send(results?.recordsets[0]);
    });
  }
};

const getAllReportAlarm = async (req, res) => {
  let request = new mssql.Request();
  if (schema.validate.error) {
    res.status(422).json({
      err: schema.error,
    });
  } else {
    request.query("SELECT * FROM report_alarm ", async function (err, results) {
      await res.status(200).send(results?.recordsets[0]);
    });
  }
};

const getAllReportAlarmDate = async (req, res) => {
  let request = new mssql.Request();
  let { alarm_startdate, alarm_enddate } = req.params;
  request.input("alarm_startdate", req.params.alarm_startdate);
  request.input("alarm_enddate", req.params.alarm_enddate);
  request.multiple = true;
  if (schema.validate.error) {
    res.status(422).json({
      err: schema.error,
    });
  } else {
    request.query(
      `SELECT * FROM report_alarm 
    where alarm_date_time>=@alarm_startdate 
    AND alarm_date_time <= @alarm_enddate`,
      async function (err, results) {
        await res.status(200).send(results?.recordsets[0]);
      }
    );
  }
};

const getOneReportAlarmSelect = async (req, res) => {
  let request = new mssql.Request();
  let { sbc_name, alarm_startdate, alarm_enddate } = req.params;
  request.input("sbc_name", req.params.sbc_name);
  request.input("alarm_startdate", req.params.alarm_startdate);
  request.input("alarm_enddate", req.params.alarm_enddate);
  request.multiple = true;
  if (schema.validate.error) {
    res.status(422).json({
      err: schema.error,
    });
  } else {
    request.query(
      "SELECT * FROM report_alarm where alarm_name=@sbc_name AND alarm_date_time>=@alarm_startdate AND alarm_date_time <= @alarm_enddate",
      async function (err, results) {
        await res.status(200).send(results?.recordsets[0]);
      }
    );
  }
};

const getAllReportDaily = async (req, res) => {
  let request = new mssql.Request();
  if (schema.validate.error) {
    res.status(422).json({
      err: schema.error,
    });
  } else {
    request.query("SELECT * FROM report_daily ", async function (err, results) {
      await res.status(200).send(results?.recordsets[0]);
    });
  }
};

const getAllReportDailyDate = async (req, res) => {
  let request = new mssql.Request();
  let { daily_startdate, daily_enddate } = req.params;
  request.input("daily_startdate", req.params.daily_startdate);
  request.input("daily_enddate", req.params.daily_enddate);
  request.multiple = true;
  if (schema.validate.error) {
    res.status(422).json({
      err: schema.error,
    });
  } else {
    request.query(
      `
    SELECT   
convert(int,Q1.date_day) as 'day',
COALESCE(convert(varchar,Q2.daily_startdate), convert(varchar,Q1.date_day) ) AS date_day , 
COALESCE(Q2.daily_max, 0) AS daily_max , 
daily_name FROM 
(
      SELECT date_day FROM report_date
) AS Q1
LEFT JOIN (
    SELECT daily_max,daily_name,DAY(daily_startdate) as day, daily_startdate  FROM report_daily
    WHERE daily_startdate BETWEEN @daily_startdate AND  @daily_enddate
) AS Q2
ON Q1.date_day = Q2.day
GROUP BY Q2.daily_startdate, Q1.date_day, Q2.daily_max, daily_name
Order By day`,
      async function (err, results) {
        await res.status(200).send(results?.recordsets[0]);
      }
    );
  }
};

const getOneReportDailySelect = async (req, res) => {
  let request = new mssql.Request();
  let { sbc_name, daily_startdate, daily_enddate } = req.params;
  request.input("sbc_name", req.params.sbc_name);
  request.input("daily_startdate", req.params.daily_startdate);
  request.input("daily_enddate", req.params.daily_enddate);
  request.multiple = true;
  if (schema.validate.error) {
    res.status(422).json({
      err: schema.error,
    });
  } else {
    request.query(
      `
    SELECT   
convert(int,Q1.date_day) as 'day',
COALESCE(convert(varchar,Q2.daily_startdate), convert(varchar,Q1.date_day) ) AS date_day , 
COALESCE(Q2.daily_max, 0) AS daily_max , 
daily_name FROM 
(
      SELECT date_day FROM report_date
) AS Q1
LEFT JOIN (
    SELECT daily_max,daily_name,DAY(daily_startdate) as day, daily_startdate  FROM report_daily
    WHERE daily_startdate BETWEEN @daily_startdate AND  @daily_enddate AND daily_name = @sbc_name
) AS Q2
ON Q1.date_day = Q2.day
GROUP BY Q2.daily_startdate, Q1.date_day, Q2.daily_max, daily_name
Order By day`,
      async function (err, results) {
        await res.status(200).send(results?.recordsets[0]);
      }
    );
  }
};

const getAllReportDetail = async (req, res) => {
  let request = new mssql.Request();
  if (schema.validate.error) {
    res.status(422).json({
      err: schema.error,
    });
  } else {
    request.query(
      `SELECT * FROM (
      SELECT halfs, half_time FROM halfs
     ) as Q1
     LEFT JOIN (
       SELECT 
       
       max(scb_concurrent) as sbc_max ,
       max(gw_concurrent) as gateway_max ,
       min(scb_concurrent) as sbc_min ,
       min(gw_concurrent) as gateway_min ,
       avg(scb_concurrent) as sbc_avg ,
       avg(gw_concurrent) as gateway_avg ,
       sbc_util as gateway_util ,
	     gw_util as sbc_util , server_name,
       (datepart(hour,start_time) * 2) + (datepart(Minute,start_time) / 30 ) AS half
       FROM concurrent
       GROUP BY id, start_time, scb_concurrent, sbc_util, type, server_name, gw_concurrent, gw_util
     ) as Q2
     ON Q1.halfs = Q2.half `,
      async function (err, results) {
        await res.status(200).send(results?.recordsets[0]);
      }
    );
  }
};

const getAllReportDetailDate = async (req, res) => {
  let request = new mssql.Request();
  let { start_date, end_date } = req.params;
  request.input("start_date", req.params.start_date);
  request.input("end_date", req.params.end_date);
  request.multiple = true;
  if (schema.validate.error) {
    res.status(422).json({
      err: schema.error,
    });
  } else {
    request.query(
      `SELECT half_time,
		COALESCE(SUM(sbc_max), 0) as sbc_max, 
		COALESCE(SUM(gateway_max), 0) as gateway_max, 
		COALESCE(SUM(sbc_min), 0) as sbc_min, 
		COALESCE(SUM(gateway_min), 0) as gateway_min, 
		COALESCE(SUM(sbc_avg), 0) as sbc_avg, 
		COALESCE(SUM(gateway_avg), 0) as gateway_avg,
		COALESCE(SUM(sbc_util), 0) as sbc_util, 
		COALESCE(SUM(gw_util), 0) as gateway_util
		FROM (
					SELECT halfs, half_time FROM halfs
				 ) as Q1
	LEFT JOIN (
					 SELECT 
					 max(scb_concurrent) as sbc_max ,
					 max(gw_concurrent) as gateway_max ,
					 min(scb_concurrent) as sbc_min ,
					 min(gw_concurrent) as gateway_min ,
					 avg(scb_concurrent) as sbc_avg ,
					 avg(gw_concurrent) as gateway_avg ,
					 avg(sbc_util) as sbc_util ,
					 avg(gw_util) as gw_util ,
					 server_name,start_time,
					 (datepart(hour,start_time) * 2) + (datepart(Minute,start_time) / 30 ) AS half
					 FROM concurrent where  
					  start_time>=@start_date
					 AND start_time <=@end_date
					 GROUP BY start_time, sbc_util, gw_util, server_name
				 ) as Q2
				 ON Q1.halfs = Q2.half
GROUP BY half_time
ORDER BY half_time`,
      async function (err, results) {
        await res.status(200).send(results?.recordsets[0]);
      }
    );
  }
};

const getOneReportDetailSelect = async (req, res) => {
  let request = new mssql.Request();
  let { sbc_name, start_date, end_date } = req.params;
  request.input("sbc_name", req.params.sbc_name);
  request.input("start_date", req.params.start_date);
  request.input("end_date", req.params.end_date);
  request.multiple = true;
  if (schema.validate.error) {
    res.status(422).json({
      err: schema.error,
    });
  } else {
    request.query(
      `SELECT 
		half_time,
		server_name,
		COALESCE(max(sbc_max), 0) as sbc_max, 
		COALESCE(max(gateway_max), 0) as gateway_max, 
		COALESCE(min(sbc_min), 0) as sbc_min, 
		COALESCE(min(gateway_min), 0) as gateway_min, 
		COALESCE(avg(sbc_avg), 0) as sbc_avg, 
		COALESCE(avg(gateway_avg), 0) as gateway_avg,
		COALESCE(avg(sbc_util), 0) as sbc_util, 
		COALESCE(avg(gw_util), 0) as gateway_util
		FROM (
					SELECT halfs, half_time FROM halfs
				 ) as Q1
	LEFT JOIN (
					 SELECT 
					 max(scb_concurrent) as sbc_max ,
					 max(gw_concurrent) as gateway_max ,
					 min(scb_concurrent) as sbc_min ,
					 min(gw_concurrent) as gateway_min ,
					 avg(scb_concurrent) as sbc_avg ,
					 avg(gw_concurrent) as gateway_avg ,
					 avg(sbc_util) as sbc_util ,
					 avg(gw_util) as gw_util ,
					 server_name,start_time,
					 (datepart(hour,start_time) * 2) + (datepart(Minute,start_time) / 30 ) AS half
					 FROM concurrent where  
					 server_name= @sbc_name
					 AND start_time>=@start_date
					 AND start_time <= @end_date
					 GROUP BY start_time, sbc_util, gw_util, server_name
				 ) as Q2
				 ON Q1.halfs = Q2.half
GROUP BY half_time, server_name
ORDER BY half_time`,
      async function (err, results) {
        await res.status(200).send(results?.recordsets[0]);
      }
    );
  }
};

const getAllReportByRange = async (req, res) => {
  let request = new mssql.Request();
  let { start_datetime, end_datetime } = req.params;
  request.input("start_datetime", req.params.start_datetime);
  request.input("end_datetime", req.params.end_datetime);
  request.multiple = true;

  if (schema.validate.error) {
    res.status(422).json({
      err: schema.error,
    });
  } else {
    request.query(
      "SELECT start_datetime,end_datetime FROM report where start_datetime=@start_datetime AND start_datetime<=@end_datetime",
      async function (err, results) {
        if (err) {
          await res.status(422).json(err);
        } else {
          await res.status(200).json(results?.recordsets[0]);
        }
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
    res.status(400).json({
      err: "start_date lesser than current date",
    });
  } else if (req.body.end_date < req.body.start_date) {
    res.status(400).json({
      err: "end_date lesser than start_date",
    });
  } else {
    request.query(
      "INSERT INTO report(start_date,end_date,start_time,end_time) VALUES (@start_date,@end_date,@start_time,@end_time)",
      async function (err, results) {
        if (err) {
          await res.status(400).json({
            err: err,
          });
        } else {
          await res.sendStatus(201);
        }
      }
    );
  }
};

module.exports = {
  getAllReport,
  getAllReportAlarm,
  getAllReportAlarmDate,
  getOneReportAlarmSelect,
  getAllReportDaily,
  getAllReportDailyDate,
  getOneReportDailySelect,
  getAllReportDetail,
  getAllReportDetailDate,
  getOneReportDetailSelect,
  addReport,
  getAllReportByRange,
};
