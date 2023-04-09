const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const joi = require("joi");
const mssql = require("mssql");

const schema = joi.object().keys({
  "sbc_name": joi.string().required(),
  "sbc_ip_address": joi
    .string()
    .regex(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/)
    .required(),
  "sbc_username": joi
    .string()
    .regex(/^[ก-๛A-Za-z0-9 ]+$/)
    .min(6)
    .max(20)
    .required(),
  "sbc_password": joi
    .string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/)
    .required(),
  "sbc_session": joi.number().integer().required(),
});

module.exports = schema;
