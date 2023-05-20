const express = require("express");
const app = express();
const sessions = require("express-session");
const mssql = require("mssql");
const schema = require("../models/role.model");
const conn = require("../configs/configdb");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

const getAllUsers = async (req, res) => {
  let request = new mssql.Request();
  if (schema.validate.error) {
    res.status(422).json({
      err: schema.error,
    });
  } else {
    request.query("SELECT * FROM users ", async function (err, results) {
      await res.status(200).send(results?.recordsets[0]);
    });
  }
};

const addUsers = (req, res) => {
  let { username, password, position } = req.body;
  let request = new mssql.Request();
  let hashPwd = crypto
    .createHash("md5")
    .update(req.body.password)
    .digest("hex"); 
  request.input("username", req.body.username);
  request.input("password", hashPwd);
  request.input("position", req.body.position);
  request.multiple = true;

  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "INSERT INTO users(username,password,position) VALUES (@username,@password,@position)",
      function (err, results) {
        if (err) res.status(422).json({ err: err });
        else res.sendStatus(201);
      }
    );
  }
};

const updateOrForgetUsers = (req, res) => {
  let { username, position } = req.body;
  let id = req.params.id;
  let request = new mssql.Request();
  request.input("username", req.body.username);
  //request.input("password", req.body.password);
  request.input("position", req.body.position);
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "UPDATE users SET username=@username,position=@position WHERE user_id=" +
        id,
      async function (err, results) {
        if (results?.rowsAffected >= 1) {
          await res.sendStatus(200);
        } else {
          await res.status(404).json({ err: "ID =" + err });
        }
      }
    );
  }
};

const delUsers = (req, res) => {
  let id = req.params.id;
  let request = new mssql.Request();
  request.query(
    "DELETE FROM users WHERE user_id = " + id,
    async function (err, results) {
      if (results?.rowsAffected > 0) {
        await res.sendStatus(200);
      } else {
        await res.status(404).json({ err: "id=" + err });
      }
    }
  );
};

module.exports = {
  getAllUsers,
  addUsers,
  updateOrForgetUsers,
  delUsers,
};
