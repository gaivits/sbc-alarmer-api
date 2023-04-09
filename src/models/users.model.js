const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const joi = require("joi");
const mssql = require("mssql");

const schema = joi.object().keys({
  "username": joi
    .string()
    .regex(/^[ก-๛A-Za-z0-9 ]+$/)
    .min(6)
    .max(20)
    .required(),
  "password": joi
    .string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/)
    .required(),
});

module.exports = schema;
