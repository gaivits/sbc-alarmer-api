const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const joi = require("joi");
const mssql = require("mssql");

const schema = joi.object().keys({
  setting_name: joi
    .string()
    .regex(/^[ก-๛A-Za-z0-9 ]+$/)
    .required(),
  setting_ip_address: joi
    .string()
    .regex(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/)
    .required(),
  setting_username: joi.string(),
  setting_password: joi.string(),
  setting_max_session: joi.number().integer().required(),
});

module.exports = schema;
