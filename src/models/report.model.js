const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const joi = require("joi");
const mssql = require("mssql");

const schema = joi.object().keys({
  "start_date": joi.date().iso().required(),
  "end_date": joi.date().iso().required(),
  "start_time": joi.date().iso().required(),
  "end_time": joi.date().iso().required(),
});

module.exports = schema;
