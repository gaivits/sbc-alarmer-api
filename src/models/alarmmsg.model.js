const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const joi = require("joi");
const mssql = require("mssql");

const schema = joi.object().keys({
  source_name: joi.string().required(),
  description: joi.string().required(),
});

module.exports = schema;
