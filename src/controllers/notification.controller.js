const mssql = require("mssql");
const schema = require("../models/notification.model");
const crypto = require("crypto");
const fs = require("fs");
const child_process = require("child_process");
const folderPath = "../Uploads"
const readXlsxFile= require('read-excel-file')
const multer = require("multer");


const getAllNotification = async (req, res) => {
  let request = new mssql.Request();
  if (schema.validate.error) {
    res.status(422).json({ err: schema.error });
  } else {
    request.query(
      "SELECT * FROM sbc_ptt_notification",
      async function (err, results) {
        await res.status(200).json(results.recordsets);
      }
    );
  }
};

const getOneNotification = async (req, res) => {
  let id = req.params.id;
  let request = new mssql.Request();
  if (id) {
    request.query(
      "SELECT * FROM sbc_ptt_notification WHERE notification_id=" + id,
      function (err, results) {
        res.status(200).json(results.recordset);
      }
    );
  } else {
    res.status(422).json({ err: schema.validate(id).error });
  }
};

const addNotification = (req, res) => {
  let { notification_name, notification_desc, status } = req.body;
  let request = new mssql.Request();
  request.input("notification_name", req.body.notification_name);
  request.input("notification_desc", req.body.notification_desc);
  request.input("status", req.body.status);
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "INSERT INTO sbc_ptt_notification(notification_name,notification_desc,status) VALUES (@notification_name,@notification_desc,@status)",
      async function (err, results) {
        if (err) {
          await res.sendStatus(422);
        } else {
          await res.sendStatus(201);
        }
      }
    );
  }
};

const delNotification = (req, res) => {
  let id = req.params.id;
  let request = new mssql.Request();
  request.query(
    "DELETE FROM SBC_PTT_NOTIFICATION WHERE notification_id=" + id,
    async function (err, results) {
      if (results.rowsAffected > 0) {
        await res.sendStatus(200);
      } else {
        await res.status(404).json({ err: "id=" + err });
      }
    }
  );
};

const updateNotification = (req, res) => {
  let request = new mssql.Request();
  let id = req.params.id;
  let { notification_name, notification_desc, status } = req.body;
  request.input("notification_name", req.body.notification_name);
  request.input("notification_desc", req.body.notification_desc);
  request.input("status", req.body.status);
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "UPDATE sbc_ptt_notification SET notification_name=@notification_name,notification_desc=@notification_desc,status=@status WHERE notification_id=" +
        id,
      async function (err, results) {
        if (results.rowsAffected > 0) {
          await res.sendStatus(200);
        } else {
          await res.status(404).json({ err: "id =" + err });
        }
      }
    );
  }
};

const searchNotification = (req, res) => {
  let request = new mssql.Request();
  let keyw = req.params.keyw;
  if (schema.validate.error) {
    res.status(422).json({ err: schema.error });
  } else {
    request.query(
      "SELECT * FROM sbc_ptt_notification WHERE notification_name LIKE '%" +
        keyw +
        "%' OR notification_desc LIKE '%" +
        keyw +
        "%'",
      async function (err, results) {
        if (results) {
          await res.status(200).json(results.recordsets);
        } else {
          await res.status(422).json({ err: keyw + err });
        }
      }
    );
  }
};

const importNotificationFile = (req, res) => {
  if(req.file.files)
    res.sendStatus(200)
  else
    res.sendStatus(400)
}

const exportNotificationFile = (req, res) => {
  child_process.execSync(`zip -r archive *`, {
    cwd: folderPath,
  });
  res.download(folderPath + "/archive.zip");
};

module.exports = {
  getAllNotification,
  getOneNotification,
  addNotification,
  updateNotification,
  delNotification,
  searchNotification,
  importNotificationFile,
  exportNotificationFile,
};
