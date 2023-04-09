const mssql = require("mssql");
const schema = require("../models/email.model");
const crypto = require("crypto");
const { func } = require("joi");

const getAllEmail = async (req, res) => {
  let request = new mssql.Request();
  if (schema.validate.error) res.status(422).json({ err: schema.error });
  else
    request.query("SELECT * FROM sbc_ptt_email", async function (err, results) {
      await res.status(200).json(results.recordsets);
    });
};

const getOneEmail = async (req, res) => {
  let id = req.params.id;
  let request = new mssql.Request();
  if (id) {
    request.query(
      "SELECT * FROM sbc_ptt_email WHERE mail_id=" + id,
      async function (err, results) {
        await res.status(200).json(results.recordset);
      }
    );
  } else {
    res.status(422).json({ err: schema.validate(id).error });
  }
};

const addEmail = (req, res) => {
  let {
    smtp_server,
    smtp_port,
    recipient,
    username,
    password,
    email_subject,
    smtp_auth,
    smtp_security,
  } = req.body;
  let request = new mssql.Request();
  request.input("smtp_server", req.body.smtp_server);
  request.input("smtp_port", req.body.smtp_port);
  request.input("recipient", req.body.recipient);
  request.input("username", req.body.username);
  request.input("password", req.body.password);
  request.input("email_subject", req.body.email_subject);
  request.input("smtp_auth", req.body.smtp_auth);
  request.input("smtp_security", req.body.smtp_security);
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "INSERT INTO sbc_ptt_email(smtp_server,smtp_port,recipient,username,password,email_subject,smtp_auth,smtp_security) VALUES (@smtp_server,@smtp_port,@recipient,@username,@password,@email_subject,@smtp_auth,@smtp_security)",
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

const delEmail = (req, res) => {
  let id = req.params.id;
  let request = new mssql.Request();
  request.query(
    "DELETE FROM sbc_ptt_email WHERE mail_id = " + id,
    async function (err, results) {
      if (results.rowsAffected > 0) {
        await res.sendStatus(200);
      } else {
        await res.status(404).json({ err: "id=" + err });
      }
    }
  );
};

const updateEmail = (req, res) => {
  let request = new mssql.Request();
  let id = req.params.id;
  let {
    smtp_server,
    smtp_port,
    recipient,
    username,
    password,
    email_subject,
    smtp_auth,
    smtp_security,
  } = req.body;
  request.input("smtp_server", req.body.smtp_server);
  request.input("smtp_port", req.body.smtp_port);
  request.input("recipient", req.body.recipient);
  request.input("username", req.body.username);
  request.input("password", req.body.password);
  request.input("email_subject", req.body.email_subject);
  request.input("smtp_auth", req.body.smtp_port);
  request.input("smtp_security", req.body.smtp_security);
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "UPDATE sbc_ptt_email SET smtp_server=@smtp_server,smtp_port=@smtp_port,recipient=@recipient,username=@username,password=@password,email_subject=@email_subject,smtp_auth=@smtp_auth,smtp_security=@smtp_security WHERE mail_id=" +
        id,
      async function (err, results) {
        if (results.recordset > 0) {
          await res.sendStatus(200);
        } else {
          await res.status(404).json({ err: "id =" + err });
        }
      }
    );
  }
};

const searchEmail = (req, res) => {
  let request = new mssql.Request();
  let keyw = req.params.keyw;
  if (schema.validate.error) {
    res.status(422).json({ err: schema.error });
  } else {
    request.query(
      "SELECT * FROM sbc_ptt_email WHERE smtp_server LIKE '%" +
        keyw +
        "%' OR recipient LIKE '%" +
        keyw +
        "%' OR username LIKE '%" +
        keyw +
        "%' ",
      async function (err, results) {
        if (results) {
          await res.status(200).json(results.recordsets);
        } else {
          await res.status(422).json({ err: keyw + err });
        }
      }
    );
  }
};

module.exports = {
  getAllEmail,
  getOneEmail,
  addEmail,
  delEmail,
  updateEmail,
  searchEmail,
};
