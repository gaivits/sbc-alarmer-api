const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const joi = require("joi");
const mssql = require("mssql");

const schema = joi.object().keys({
  "recipient_email": joi.string().email().required(),
});

module.exports = schema;
