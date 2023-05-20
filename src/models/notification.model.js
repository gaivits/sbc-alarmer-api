const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const joi = require("joi");
const mssql = require("mssql");

const schema = joi.object().keys({
  notification_name: joi.string().regex(/^[ก-๛A-Za-z0-9 ]+$/),
  notification_desc: joi.string(),
  status: joi.bool(),
  interval: joi.number().integer(),
  email_detail: joi.string(),
});

module.exports = schema;
