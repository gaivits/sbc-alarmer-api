const mssql = require("mssql");
const schema = require("../models/setting.model");
const crypto = require("crypto");

const getAllSetting = async (req, res) => {
  let request = new mssql.Request();
  if (schema.validate.error) {
    res.status(422).json({ err: schema.error });
  } else {
    request.query("SELECT * FROM sbc_ptt_setting", async function (err, results) {
      await res.status(200).json(results.recordsets);
    });
  }
};

const getOneSetting = async (req, res) => {
  let id = req.params.id;
  let request = new mssql.Request();
  if (id) {
    request.query(
      "select * from sbc_ptt_setting WHERE sbc_id=" + id,
      async function (err, results) {
        await res.status(200).json(results.recordset);
      }
    );
  } else {
    res.status(422).json({ err: schema.validate(id).error });
  }
};

const addSetting = (req, res) => {
  let { sbc_name, sbc_ip_address, sbc_username, sbc_password, sbc_session } =
    req.body;
  let request = new mssql.Request();
  let hashPwd = crypto
    .createHash("md5")
    .update(req.body.sbc_password)
    .digest("hex");
  request.input("sbc_name", req.body.sbc_name);
  request.input("sbc_ip_address", req.body.sbc_ip_address);
  request.input("sbc_username", req.body.sbc_username);
  request.input("sbc_password", hashPwd);
  request.input("sbc_session", req.body.sbc_session);
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "INSERT INTO sbc_ptt_setting(sbc_name,sbc_ip_address,sbc_username,sbc_password,sbc_session) VALUES (@sbc_name,@sbc_ip_address,@sbc_username,@sbc_password,@sbc_session)",
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
    "DELETE FROM sbc_ptt_setting WHERE sbc_id = " + id,
    async function (err, results) {
      if (results.rowsAffected > 0) {
        await res.sendStatus(200);
      } else {
        await res.status(404).json({ err: "id=" + err });
      }
    }
  );
};

const updateSetting = (req, res) => {
  let request = new mssql.Request();
  let id = req.params.id;
  let { sbc_name, sbc_ip_address, sbc_username, sbc_password, sbc_session } =
    req.body;
  let hashPwd = crypto
    .createHash("md5")
    .update(req.body.sbc_password)
    .digest("hex");
  request.input("sbc_name", req.body.sbc_name);
  request.input("sbc_ip_address", req.body.sbc_ip_address);
  request.input("sbc_username", req.body.sbc_username);
  request.input("sbc_password", hashPwd);
  request.input("sbc_session", req.body.sbc_session);
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "UPDATE sbc_ptt_setting SET sbc_name=@sbc_name,sbc_ip_address=@sbc_ip_address,sbc_username=@sbc_username,sbc_password=@sbc_password,sbc_session=@sbc_session WHERE sbc_id=" +
        id,
      async function (err, results) {
        if (results.rowsAffected > 0) {
          await res.sendStatus(200);
        } else {
          await res.status(404).json({ err: "ID =" + err });
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
      "SELECT * FROM sbc_ptt_setting WHERE sbc_name LIKE '%" +
        keyw +
        "%' OR sbc_ip_address LIKE '%" +
        keyw +
        "%'",
      async function (err, results) {
        if (results) await res.status(200).json( results.recordsets );
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
