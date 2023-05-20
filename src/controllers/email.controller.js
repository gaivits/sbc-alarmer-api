const mssql = require("mssql");
const schema = require("../models/email.model");
const crypto = require("crypto");
const conn = require("../configs/configdb");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const getAllEmail = async (req, res) => {
  let request = new mssql.Request();
  if (schema.validate.error) res.status(422).json({ err: schema.error });
  else
    request.query("SELECT * FROM smtp", async function (err, results) {
      await res.status(200).send(results?.recordsets[0]);
    });
};

const getOneEmail = async (req, res) => {
  let id = req.params.id;
  let request = new mssql.Request();
  if (id) {
    request.query(
      "SELECT * FROM smtp WHERE mail_id=" + id,
      async function (err, results) {
        await res.status(200).send(results?.recordsets[0]);
      }
    );
  } else {
    res.status(422).json({ err: schema.validate(id).error });
  }
};

const addEmail = (req, res) => {
  let header = req.headers["authorization"].split(".");
  let user = jwt_decode(req.headers["authorization"].substr(7, 250));
  user = user.username;
  let pass = header[1] + header[2];
  let { smtp_server, smtp_port, username, password, smtp_auth, smtp_security } =
    req.body;
  req.body;
  let request = new mssql.Request();
  request.input("smtp_server", req.body.smtp_server);
  request.input("smtp_port", req.body.smtp_port);
  request.input("username", user);
  request.input("password", pass);
  request.input("smtp_auth", req.body.smtp_auth);
  request.input("smtp_security", req.body.smtp_security);
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "INSERT INTO smtp(smtp_server,smtp_port,username,password,smtp_auth,smtp_security) VALUES (@smtp_server,@smtp_port,@username,@password,@smtp_auth,@smtp_security)",
      async function (err, results) {
        if (err) {
          await res.status(422).json({ err: err });
        } else {
          request.query(
            "INSERT INTO recipient(email_recipient1,email_subject) SELECT recipient,email_subject from email"
          );
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
    "DELETE FROM smtp WHERE mail_id = " + id,
    async function (err, results) {
      if (results?.rowsAffected >= 1) {
        await res.sendStatus(200);
      } else {
        await res.status(404).json({ err: "id=" + err });
      }
    }
  );
};

const updateEmail = (req, res) => {
  let request = new mssql.Request();
  let header = req.headers["authorization"].split(".");
  let user = jwt_decode(req.headers["authorization"].substr(7, 250));
  user = user.username;
  let pass = header[1] + header[2];
  let id = req.params.id;
  let { smtp_server, smtp_port, username, password, smtp_auth, smtp_security } =
    req.body;
  request.input("smtp_server", req.body.smtp_server);
  request.input("smtp_port", req.body.smtp_port);
  request.input("username", req.body.username);
  request.input("password", req.body.password);
  request.input("smtp_auth", req.body.smtp_auth);
  request.input("smtp_security", req.body.smtp_security);
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "UPDATE smtp SET smtp_server=@smtp_server,smtp_port=@smtp_port,username=@username,password=@password,smtp_auth=@smtp_auth,smtp_security=@smtp_security WHERE mail_id=" +
        id,
      async function (err, results) {
        if (results?.rowsAffected >= 1) {
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
      "SELECT * FROM smtp WHERE smtp_server LIKE '%" +
        keyw +
        "%' OR recipient LIKE '%" +
        keyw +
        "%' OR username LIKE '%" +
        keyw +
        "%' ",
      async function (err, results) {
        if (results) {
          await res.status(200).send(results?.recordsets[0]);
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
