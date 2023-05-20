const mssql = require("mssql");
const schema = require("../models/alarmmsg.model");
const crypto = require("crypto");
const conn = require("../configs/configdb");
const jwt_decode = require("jwt-decode");
const getAllAlarmMsg = async (req, res) => {
  let request = new mssql.Request();
  if (schema.validate.error) {
    res.status(422).json({ err: schema.error });
  } else {
    request.query("SELECT * FROM alarm_message", async function (err, results) {
      await res.status(200).send(results?.recordsets[0]);
    });
  }
};
//alarm_message
const getOneAlarmMsg = async (req, res) => {
  let id = req.params.id;
  let request = new mssql.Request();
  if (id) {
    request.query(
      "select * from alarm_message WHERE seq_id =" + id,
      async function (err, results) {
        await res.status(200).send(results?.recordsets[0]);
      }
    );
  } else {
    res.status(422).json({ err: schema.validate(id).error });
  }
};

const addAlarmMsg = (req, res) => {
  let { setting_name, setting_ip_address, setting_max_session } = req.body;
  let request = new mssql.Request();
  let header = req.headers["authorization"].split(".");
  let user = jwt_decode(req.headers["authorization"].substr(7, 250));
  let pass = header[1] + header[2];
  user = user.username;
  request.input("source_name", req.body.source_name);
  request.input("description", req.body.source_name);
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "INSERT INTO alarm_message(source_name,description) VALUES (@source_name,@description)",
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

const delAlarmMsg = (req, res) => {
  let id = req.params.id;
  let request = new mssql.Request();
  request.query(
    "DELETE FROM alarm_message WHERE seq_id = " + id,
    async function (err, results) {
      if (results?.rowsAffected > 0) {
        await res.sendStatus(200);
      } else {
        await res.status(404).json({ err: "id=" + err });
      }
    }
  );
};

const updateAlarmMsg = (req, res) => {
  let id = req.params.id;
  let request = new mssql.Request();
  let header = req.headers["authorization"].split(".");
  let user = jwt_decode(req.headers["authorization"].substr(7, 250));
  let pass = header[1] + header[2];
  user = user.username;
  request.input("source_name", req.body.setting_name);
  request.input("description", req.body.setting_ip_address);
  request.multiple = true;
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "UPDATE alarm_message SET source_name=@source_name,description=@description WHERE seq_id=" +
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
  getAllAlarmMsg,
  getOneAlarmMsg,
  addAlarmMsg,
  updateAlarmMsg,
  delAlarmMsg,
};
