const mssql = require("mssql");
const schema = require("../models/users.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const getAllUsers = async (req, res) => {
  let request = new mssql.Request();
  if (schema.validate.error) res.status(422).json({ err: schema.error });
  else
    request.query("SELECT * FROM sbc_ptt_users", async function (err, results) {
      await res.status(200).json(results.recordsets);
    });
};

const addUsers = (req, res) => {
  let { username, password } = req.body;
  let request = new mssql.Request();
  let hashPwd = crypto
    .createHash("md5")
    .update(req.body.password)
    .digest("hex");
  request.input("username", req.body.username);
  request.input("password", hashPwd);
  request.multiple = true;

  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "INSERT INTO sbc_ptt_users(username,password) VALUES (@username,@password)",
      function (err, results) {
        if (err) res.status(422).json({ err: err });
        else res.sendStatus(201);
      }
    );
  }
};

const updateOrForgetUsers = (req, res) => {
  let { username, password } = req.body;
  let id = req.params.id;
  let request = new mssql.Request();
  request.input("username", req.body.username);
  request.input("password", req.body.password);
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "INSERT INTO sbc_ptt_users(username,password) VALUES (@username,@password)",
      function (err, results) {
        if (schema.validate(req.body).error) {
          res.status(422).json({ err: schema.validate(req.body).error });
        } else {
          request.query(
            "UPDATE sbc_ptt_username SET username=@username,password=@password WHERE user_id=" +
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
      }
    );
  }
};

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
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "SELECT * FROM sbc_ptt_users WHERE username=@username AND password=@password",
      async function (err, results) {
        if (err) {
          await res.status(422).json(err);
        } else if (username && password) {
          if (results.rowsAffected > 0) {
            await res.status(201).json({
              "tokens": jwt.sign({ username }, process.env.JWT_ACCESS_SECRET, {
                expiresIn: 600,
              }),
              "refresh_token": jwt.sign(
                { username },
                process.env.JWT_REFRESH_SECRET,
                {
                  expiresIn: 86400,
                }
              ),
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


module.exports = {
  getAllUsers,
  addUsers,
  loginUsers,
  updateOrForgetUsers,
};
