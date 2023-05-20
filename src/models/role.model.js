const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const joi = require("joi");
const mssql = require("mssql");

const schema = joi.object().keys({
  username: joi.string().required(),
  password: joi.string().required(),
  position: joi.string().required(),
});

module.exports = schema;
