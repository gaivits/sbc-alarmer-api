const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const joi = require("joi");
const mssql = require("mssql");

const schema = joi.object().keys({
  "notification_name": joi.string().required(),
  "notification_desc": joi.string().required(),
  "status": joi.bool().required(),
});

module.exports = schema;
