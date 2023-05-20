const mssql = require("mssql");
const schema = require("../models/recipient.model");
const crypto = require("crypto");
const conn = require("../configs/configdb");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const getAllRecipient = async (req, res) => {
  let request = new mssql.Request();
  if (schema.validate.error) {
    res.status(422).json({ err: schema.error });
  } else {
    request.query("SELECT * FROM email", async function (err, results) {
      await res.send(results?.recordsets[0]);
    });
  }
};

const getEmailRecipient = async (req, res) => {
  let request = new mssql.Request();
  if (schema.validate.error) {
    res.status(422).json({ err: schema.error });
  } else {
    request.query(`select email_recipient, email_subject, email_detail 
    from recipient 
    left join email on recipient.recipient_id > email.recipient_id`, async function (err, results) {
      await res.send(results?.recordsets[0]);
    });
  }
};

const addDelRecipient = (req, res) => {
  let { email_recipient } = req.body;
  let request = new mssql.Request();
  request.input("email_recipient", req.body.email_recipient);
  request.multiple = true;
    request.query(
      "INSERT INTO recipient(email_recipient) VALUES (@email_recipient)",
      async function (err, results) {
        if (err) {
          await res.sendStatus(422);
        } else {
          await res.sendStatus(201);
        }
      }
    );
};

const addRecipient = (req, res) => {
  let { email_recipient } = req.body;
  let request = new mssql.Request();
  request.input("email_recipient", req.body.email_recipient);
  request.multiple = true;
    request.query(
      "INSERT INTO recipient(email_recipient) VALUES (@email_recipient)",
      async function (err, results) {
        if (err) {
          await res.sendStatus(422);
        } else {
          await res.sendStatus(201);
        }
      }
    );
};


const updateRecipient = (req, res) => {
  let request = new mssql.Request();
  let id = req.params.id;
  let {
    email_subject,
    email_detail,
    email_recipient1,
    email_recipient2,
    email_recipient3,
  } = req.body;
  request.input("email_subject", req.body.email_subject);
  request.input("email_detail", req.body.email_detail);
  request.input("email_recipient1", req.body.email_recipient1);
  request.input("email_recipient2", req.body.email_recipient2);
  request.input("email_recipient3", req.body.email_recipient3);
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "UPDATE email SET email_subject=@email_subject,email_detail=@email_detail,email_recipient1=@email_recipient1,email_recipient2=@email_recipient2,email_recipient3=@email_recipient3 WHERE recipient_id=" +
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

const delRecipient = (req, res) => {
  let request = new mssql.Request();
  request.query(
    "DELETE FROM recipient ",
     async function (err, results) {
      if (err) {
        await res.sendStatus(422);
      } else { 
        await res.sendStatus(200);
      }
    }
  );
};
module.exports = {
  getAllRecipient,
  getEmailRecipient,
  addDelRecipient,
  updateRecipient,
  delRecipient,
  addRecipient
};
