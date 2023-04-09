const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const joi = require("joi");
const mssql = require("mssql");

const schema = joi.object().keys({
  "smtp_server": joi.string().required(),
  "smtp_port": joi.number().integer().required(),
  "recipient": joi.string().email().required(),
  "username": joi
    .string()
    .regex(/^[ก-๛A-Za-z0-9 ]+$/)
    .min(6)
    .max(20)
    .required(),
  "password": joi
    .string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/)
    .required(),
  "email_subject": joi.string().allow().required(),
  "smtp_auth": joi.bool().required(),
  "smtp_security": joi.string().required(),
});

module.exports = schema;
