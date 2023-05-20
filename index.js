const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const PORT = process.env.DELP_PORT;
const Setting = require("./src/routes/v1/setting.router");
const Notification = require("./src/routes/v1/notification.router");
const Email = require("./src/routes/v1/email.router");
const Users = require("./src/routes/v1/users.router.js");
const Role = require("./src/routes/v1/role.router.js");
const Report = require("./src/routes/v1/report.router");
const Recipient = require("./src/routes/v1/recipient.router");
const AlarmMsg = require("./src/routes/v1/alarmmsg.router");
const AlarmAlert = require("./src/routes/v1/alarmalert.router");
const verified = require("./src/services/verify.auth");
//const cors = require("cors");
const helmet = require("helmet");
const nocache = require("nocache");
const fs = require("fs");
const https = require("https");

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "default-src": ["'self'", "'unsafe-inline'"],
    },
  })
);
//app.use(cors())
app.use(nocache());

app.disable("x-powered-by");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api/v1/users", Role);
app.use("/api/v1/users", Users);
app.use("/api/v1/setting", verified, Setting);
app.use("/api/v1/notification", verified, Notification);
app.use("/api/v1/email", verified, Email);
app.use("/api/v1/report", verified, Report);
app.use("/api/v1/recipient", verified, Recipient);
app.use("/api/v1/alarmmsg", verified, AlarmMsg);
app.use("/api/v1/alarmalert", verified, AlarmAlert);
app.listen(PORT);
