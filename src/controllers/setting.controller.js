const mssql = require("mssql");
const schema = require("../models/setting.model");
const crypto = require("crypto");
const conn = require("../configs/configdb");
const jwt_decode = require("jwt-decode");
const getAllSetting = async (req, res) => {
  let request = new mssql.Request();
  if (schema.validate.error) {
    res.status(422).json({ err: schema.error });
  } else {
    request.query("SELECT * FROM setting", async function (err, results) {
      await res.status(200).send(results?.recordsets[0]);
    });
  }
};

const getOneSetting = async (req, res) => {
  let id = req.params.id;
  let request = new mssql.Request();
  if (id) {
    request.query(
      "select * from setting WHERE setting_id=" + id,
      async function (err, results) {
        await res.status(200).send(results?.recordsets[0]);
      }
    );
  } else {
    res.status(422).json({ err: schema.validate(id).error });
  }
};

const addSetting = (req, res) => {
  let { setting_name, setting_ip_address, setting_max_session } = req.body;
  let request = new mssql.Request();
  let header = req.headers["authorization"].split(".");
  let user = jwt_decode(req.headers["authorization"].substr(7, 250));
  let pass = header[1] + header[2];
  user = user.username;
  request.input("setting_name", req.body.setting_name);
  request.input("setting_ip_address", req.body.setting_ip_address);
  request.input("setting_username", user);
  request.input("setting_password", pass);
  request.input("setting_max_session", req.body.setting_max_session);
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "INSERT INTO setting(setting_name,setting_ip_address,setting_username,setting_password,setting_max_session) VALUES (@setting_name,@setting_ip_address,@setting_username,@setting_password,@setting_max_session)",
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

const delSetting = (req, res) => {
  let id = req.params.id;
  let request = new mssql.Request();
  request.query(
    "DELETE FROM setting WHERE setting_id = " + id,
    async function (err, results) {
      if (results?.rowsAffected > 0) {
        await res.sendStatus(200);
      } else {
        await res.status(404).json({ err: "id=" + err });
      }
    }
  );
};

const updateSetting = (req, res) => {
  let id = req.params.id;
  let request = new mssql.Request();
  let header = req.headers["authorization"].split(".");
  let user = jwt_decode(req.headers["authorization"].substr(7, 250));
  let pass = header[1] + header[2];
  user = user.username;
  request.input("setting_name", req.body.setting_name);
  request.input("setting_ip_address", req.body.setting_ip_address);
  request.input("setting_username", user);
  request.input("setting_password", pass);
  request.input("setting_max_session", req.body.setting_max_session);
  request.multiple = true;
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "UPDATE setting SET setting_name=@setting_name,setting_ip_address=@setting_ip_address,setting_username=@setting_username,setting_password=@setting_password,setting_max_session=@setting_max_session WHERE setting_id=" +
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

const searchSetting = (req, res) => {
  let request = new mssql.Request();
  let keyw = req.params.keyw;
  if (schema.validate.error) {
    res.status(422).json({ err: schema.error });
  } else {
    request.query(
      "SELECT * FROM setting WHERE sbc_name LIKE '%" +
        keyw +
        "%' OR sbc_ip_address LIKE '%" +
        keyw +
        "%'",
      async function (err, results) {
        if (results) await res.status(200).send(results?.recordsets[0]);
        else {
          await res.status(422).json({ err: keyw + err });
        }
      }
    );
  }
};

module.exports = {
  getAllSetting,
  getOneSetting,
  addSetting,
  delSetting,
  updateSetting,
  searchSetting,
};
