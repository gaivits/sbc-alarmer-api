const express = require("express");
const app = express();
const sessions = require("express-session");
const mssql = require("mssql");
const schema = require("../models/users.model");
const conn = require("../configs/configdb");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

const loginUsers = (req, res) => {
  let { username, password } = req.body;
  let request = new mssql.Request();
  let hashPwd = crypto
    .createHash("md5")
    .update(req.body.password)
    .digest("hex");
  request.input("username", req.body.username);
  request.input("password", hashPwd);
  request.multiple = true;
  req.session = { username: "@username" };
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "SELECT * FROM users WHERE username=@username AND password=@password",
      async function (err, results) {
        if (err) {
          await res.status(422).json(err);
        } else if (username && password) {
          if (results?.rowsAffected > 0) {
            await res.status(201).json({
              tokens: jwt.sign({ username }, process.env.JWT_ACCESS_SECRET, {
                expiresIn: 7200,
              }),
            });
          } else {
            await res
              .status(400)
              .json({ err: "Incorrect username or password" });
          }
        }
      }
    );
  }
};

module.exports = { loginUsers };
