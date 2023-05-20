const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const joi = require("joi");
const mssql = require("mssql");

const schema = joi.object().keys({
  email_subject: joi.string().required(),
  email_detail: joi.string().required(),
  email_recipient: joi.string().required(),
});

module.exports = schema;
