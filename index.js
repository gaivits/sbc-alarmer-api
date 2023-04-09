const express = require("express");
const app = express();
const PORT = 3333;

const bodyParser = require("body-parser");
const Setting = require("./src/routes/v1/setting.router");
const Notification = require("./src/routes/v1/notification.router");
const Email = require("./src/routes/v1/email.router");
const Users = require("./src/routes/v1/users.router.js");
const Report = require("./src/routes/v1/report.router");

const cookieParser = require("cookie-parser");


app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api/v1/users",Users);
app.use("/api/v1/setting",Setting);
app.use("/api/v1/notification", Notification);
app.use("/api/v1/email", Email);
app.use("/api/v1/report",Report);
app.listen(PORT, function (err) {
  if (err) console.log("Error in server setup");
  console.log("Server listening on Port", PORT);
});
