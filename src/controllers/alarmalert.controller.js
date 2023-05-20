const mssql = require("mssql");
const schema = require("../models/alarmalert.model");
const crypto = require("crypto");
const conn = require("../configs/configdb");
const jwt_decode = require("jwt-decode");
const getAllAlarmAlert = async (req, res) => {
  let request = new mssql.Request();
  if (schema.validate.error) {
    res.status(422).json({ err: schema.error });
  } else {
    request.query("SELECT * FROM alarm_alert", async function (err, results) {
      await res.status(200).send(results?.recordsets[0]);
    });
  }
};
//alarm_message
const getOneAlarmAlert = async (req, res) => {
  let id = req.params.id;
  let request = new mssql.Request();
  if (id) {
    request.query(
      "select * from alarm_alert WHERE alarm_id =" + id,
      async function (err, results) {
        await res.status(200).send(results?.recordsets[0]);
      }
    );
  } else {
    res.status(422).json({ err: schema.validate(id).error });
  }
};

const addAlarmAlert = (req, res) => {
  let { alarm_name, alarm_dec } = req.body;
  let request = new mssql.Request();
  let header = req.headers["authorization"].split(".");
  let user = jwt_decode(req.headers["authorization"].substr(7, 250));
  let pass = header[1] + header[2];
  user = user.username;
  request.input("alarm_name", req.body.alarm_name);
  request.input("alarm_dec", req.body.alarm_dec);
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "INSERT INTO alarm_alert(alarm_name,alarm_dec) VALUES (@alarm_name,@alarm_dec)",
      async function (err, results) {
        if (err) {
          await res.status(422).json({ err: err });
        } else {
          await res.sendStatus(201);
        }
      }
    );
  }
};

const delAlarmAlert = (req, res) => {
  let id = req.params.id;
  let request = new mssql.Request();
  request.query(
    "DELETE FROM alarm_alert WHERE alarm_id = " + id,
    async function (err, results) {
      if (results?.rowsAffected > 0) {
        await res.sendStatus(200);
      } else {
        await res.status(404).json({ err: "id=" + err });
      }
    }
  );
};

const updateAlarmAlert = (req, res) => {
  let id = req.params.id;
  let request = new mssql.Request();
  let header = req.headers["authorization"].split(".");
  let user = jwt_decode(req.headers["authorization"].substr(7, 250));
  let pass = header[1] + header[2];
  user = user.username;
  request.input("alarm_name", req.body.alarm_name);
  request.input("alarm_dec", req.body.alarm_dec);
  request.multiple = true;
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "UPDATE alarm_alert SET alarm_name=@alarm_name,alarm_dec=@alarm_dec WHERE alarm_id=" +
        id,
      async function (err, results) {
        if (results?.rowsAffected >= 1) {
          await res.sendStatus(200);
        } else {
          await res.status(404).json({ err: err });
        }
      }
    );
  }
};

module.exports = {
  getAllAlarmAlert,
  getOneAlarmAlert,
  addAlarmAlert,
  delAlarmAlert,
  updateAlarmAlert,
};
