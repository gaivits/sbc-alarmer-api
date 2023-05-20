const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const joi = require("joi");
const mssql = require("mssql");

const schema = joi.object().keys({
  smtp_server: joi
    .string()
    .regex(/^[ก-๛A-Za-z0-9 ]+$/)
    .min(3)
    .max(10)
    .required(),
  smtp_port: joi.number().integer().required(),
  username: joi.string().min(6).max(20),
  password: joi.string().required(),
  smtp_auth: joi.bool().required(),
  smtp_security: joi.string().required(),
});

module.exports = schema;
