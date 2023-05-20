const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const joi = require("joi");
const mssql = require("mssql");

const schema = joi.object().keys({
  alarm_name: joi.string().required(),
  alarm_dec: joi.string().required(),
});

module.exports = schema;
