const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const joi = require("joi");
const mssql = require("mssql");

const schema = joi.object().keys({
  start_datetime: joi.date().iso(),
  end_datetime: joi.date().iso(),
});

module.exports = schema;
