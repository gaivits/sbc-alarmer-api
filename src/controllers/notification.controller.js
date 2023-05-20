const schema = require("../models/notification.model");
const crypto = require("crypto");
const child_process = require("child_process");
const multer = require("multer");
const path = require("path");
const readXlsxFile = require("read-excel-file/node");
const conn = require("../configs/configdb");
const mssql = require("mssql");
var nodeJsZip = require("nodeJs-zip");
var folderPath = path.join(__dirname, "../uploads");
const fs = require("fs");
const nodemailer = require("nodemailer");
const { resolve } = require("path");
const xl = require("excel4node");


/* const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
}); */

const autoSendEmail = async (req, res) => {
  return await new Promise(async (resolve, reject) => {
    var up_data = await selectEmail(req, res);
	var get_data =  await selectAlarmAlert(req, res);
	console.log("get_data : ",get_data)
    let request = new mssql.Request();
    if (schema.validate.error) {
      resolve({ err: schema.error });
    } else {
      request.query(
        `SELECT email_recipient FROM recipient`,
        //AND notification_name = '${req.body.source_name}'`,
        async function (err, results) {
          //console.log(results)
          if (results?.length != "undefined") {
            var data = results?.recordsets[0];
            //console.log(data.length)
            for(let i=0;i<data.length;i++){
			  console.log("autoSendEmail : ",data.length)
              postAutoSendEmail(`${data[i].email_recipient}|${up_data.email_subject}|${JSON.stringify(get_data)}`)
            }
            resolve(data);
          } else {
            resolve(err);
          }
        }
      );
    }
  });
};

const selectEmail = async (req, res, data) => {
  return await new Promise((resolve, reject) => {
    let request = new mssql.Request();
    if (schema.validate.error) {
      res.status(422).json({ err: schema.error });
    } else {
      request.query(
        `select email_subject, email_detail from email`,
        async function (err, results) {
          console.log(results)
          if (results) {
            resolve(results.recordset[0]);
          } else {
            resolve(err);
          }
        }
      );
    }
  });
};

function sendEmail() {
  console.log("Sending Email");
  let transporter = nodemailer.createTransport({
    host: "smtp.pttgc.corp",
    port: 25,
    secure: false,
    auth: null,
	tls: {
        rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: "Billing System <MSTCalluser5@pttgcgroup.com>",
    //to: "kit@suncti.co.th",
	to: "metee@convergence.co.th",
    subject: "Alarms Billing System : Billing system can't connect to Database Server",
    text: "Now, Billing System can't connect to Database Server. Please check the system.",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response + " success");
    }
  });
}

const postAutoSendEmail = async (req, res) => {
  req = req.split("|")
  console.log(">>>>> req : ",req)
  const  to = req[0], subject = req[1];
  req[2] = JSON.parse(req[2])
  var sbcNames = req[2].map(function(item) {
    return item.sbc_name;
  });
  sbcNames = sbcNames.join(', ');
  
  var dateTime = req[2].map(function(item) {
	return item.date_time;
  });
  dateTime = dateTime.join(', ');
  
  var alarmName = req[2].map(function(item) {
	return item.alarm_name;
  });
  alarmName = alarmName.join(', ');
  
  var alarmDec = req[2].map(function(item) {
	return item.alarm_dec;
  });
  alarmDec = alarmDec.join(', ');

  var alarmIp = req[2].map(function(item) {
  return item.alarm_ip;
  });
  alarmIp = alarmIp.join(', ');
  
  console.log("req[2].length : ",req[2].length)
  var detailTable = "";
  for(let i=0;i<req[2].length;i++){
     detailTable += `<tr><td>${req[2][i].sbc_name}</td>
      <td>${req[2][i].date_time}</td>
      <td>${req[2][i].alarm_name}</td>
      <td>${req[2][i].alarm_dec}</td></tr>`
  }
  console.log("detailTable : ",detailTable)

  const timestamp = Date.now();
  const date = new Date(timestamp);
  const date_time = date.toISOString();

  console.log(date_time);
  const now = new Date(date_time)
  const otherDate = new Date('2022-11-25T20:14:31.000');

  const diffInMs = now.getTime() - otherDate.getTime();
  const diffInSec = Math.floor(diffInMs / 1000);
  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHrs = Math.floor(diffInMin / 60);
  const diffInDays = Math.floor(diffInHrs / 24);

  console.log(`The difference between the two times is ${diffInDays} days, ${diffInHrs % 24} hours, ${diffInMin % 60} minutes, and ${diffInSec % 60} seconds.`);


  var message = 
  `
  <style>
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td, th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}
</style>
  <br>
    <p><b>Server name :</b> SBC Alarm </p>
    <p><b>IP Addess :</b> ${req[2][0].alarm_ip}</p>
    <p><b>Check time  :</b> ${date_time}</p>
  <br>
  <table>
	<tbody>
		<tr>
      <th>Alarm From</th>
      <th>Alarm Time</th>
      <th>Alarm Data</th>
      <th>Alarm Detail</th>
		</tr>
		
			${detailTable}
	</tbody>
   </table>`
  /* `<table>
	<tbody>
		<tr>
			<th>Alarm From</th>
			<td>${sbcNames}</td>
		</tr>
		<tr>
			<th>Alarm Time</th>
			<td>${dateTime}</td>
		</tr>
		<tr>
			<th>Alarm Data</th>
			<td>${alarmName}</td>
		</tr>
		<tr>
			<th>Alarm Detail</th>
			<td>${alarmDec}</td>
		</tr>
	</tbody>
</table>` */
	console.log("postAutoSendEmail : ",message)
	
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'metee@convergence.co.th',
      pass: 'ppcuoksprylpyubl',
    },
    // host: "smtp.pttgc.corp",
    // port: 25,
    // secure: false,
    // auth: null,
	// tls: {
  //       rejectUnauthorized: false
  //   }
  });

  const mailOptions = {
    from: "Alarm Alert <MSTCalluser5@pttgcgroup.com>",
    to: to,
    subject: subject,
    html: message,
  };
  console.log("mailOptions : ",mailOptions)

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("check in 6 : " + info.response + " success");
    }
  });
};

const postSendEmail = async (req, res) => {
  const { to, subject, message } = req.body;
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: to,
    subject: subject,
    text: message,
  };

  transporter
    .sendMail(mailOptions)
    .then(() => {
      res.json({
        status: "SUCCESS",
        message: "Message semt successfully.",
      });
    })
    .catch((error) => {
      res.json({ status: "FAILED", message: "An error occurred!" });
    });
};

const selectNotification = async (req, res) => {
  return await new Promise((resolve, reject) => {
    let request = new mssql.Request();
    if (schema.validate.error) {
      resolve({ err: schema.error });
    } else {
      request.query(
        `SELECT * FROM notification WHERE status = 1 `,
        //AND notification_name = '${req.body.source_name}'`,
        async function (err, results) {
          if (results?.length != "undefined") {
            var data = results?.recordsets[0];
            resolve(data);
          } else {
            resolve(err);
          }
        }
      );
    }
  });
};

const selectAlarmMsg = async (req, res) => {
  return await new Promise((resolve, reject) => {
    let request = new mssql.Request();
    if (schema.validate.error) {
      resolve({ err: schema.error });
    } else {
      request.query(
        `SELECT * FROM alarm_message`,
        //AND notification_name = '${req.body.notification_name}'`,
        async function (err, results) {
          var data = results?.recordsets[0];
          var return_result = results || "0";
          if (results?.length != "0") {
            resolve(data);
          } else {
            resolve(err);
          }
        }
      );
    }
  });
};

const selectAlarmAlert = async (req, res) => {
  return await new Promise((resolve, reject) => {
    let request = new mssql.Request();
    if (schema.validate.error) {
      resolve({ err: schema.error });
    } else {
      request.query(
        `SELECT * FROM alarm_alert `,
        //AND notification_name = '${req.body.notification_name}'`,
        async function (err, results) {
          var data = results?.recordsets[0];
          var return_result = results || "0";
          if (results?.length != 0) {
            resolve(data);
          } else {
            resolve("err");
          }
        }
      );
    }
  });
};

async function func(){
  console.log("check in 0")
  //await insertAlarm()
  await checkAlarmAuto()
  //await deleteAlarm()
  //await autoSendEmail()
}

setInterval(func,10000)

async function checkAlarmAuto(req, res)  {
  //const request = new mssql.Request();
  console.log("checkAlarmAuto")
  const data = await selectNotification(req, res);
  const data2 = await selectAlarmMsg(req, res);
  console.log("data : ",data.length)
  console.log("data2 : ",data2.length)
  const ins = []
  const del = []
  for (let i = 0; i < data2.length; i++) {
    let dataRow = data2[i]
    let item_data2 = data.find(row => row.notification_name === dataRow.source_name)
        if (item_data2) {
          ins.push(dataRow)
        } else {
          del.push(dataRow)
        }
  }

    console.log("check in 2 ins.length : ",ins.length)
    console.log("check in 2 del.length : ",del.length)
	
    await deleteAlarmAlert()
    await insertAlarmAlert(ins)

    if(ins.length != 0){
      await insertHistory(1,ins)
      await autoSendEmail()
    }else{
      console.log("inv nosendmail")
    }
      
    //}
    if(del.length != 0){
    //   console.log("del : ",del)
      await insertHistory(0,del)
    }else{
      console.log("del nosendmail")
    }
};

async function insertAlarmAlert(ins){
  console.log("insertAlarmAlert")    
  console.log("238 ins : ",ins)                      
  const request = new mssql.Request();
  const data3 = await selectAlarmAlert()
  console.log("data3 : ",data3)
  for(let row of ins){
    let alarm_alert_row = data3.find(row => row.alarm_name === row.notification_name)
    //console.log("alarm_alert_row : ",row.date_time.toString(),"typeof : ", typeof(row.date_time.toString()))
    let dateStr = row.date_time;
    let dateObj = new Date(dateStr);
    let dateString = dateObj.toISOString();
	if(!alarm_alert_row){
      request.query(
        `INSERT INTO alarm_alert(alarm_name,alarm_dec,sbc_name,date_time,alarm_ip) VALUES ('${row.source_name}','${row.description}','${row.alarm_name}','${dateString}','${row.ip}')`,
        async function (err, results) {
          if (err) {
            console.log("err : ",err)
          } else {
            console.log("check in 4 INSERT : checkAlarmAuto")
          }
        }
      );
    }else{
		console.log("error : insertAlarmAlert")
	}
  }
}

async function deleteAlarmAlert(){
  const request = new mssql.Request();
  request.query(
    `DELETE FROM alarm_alert`,
    async function (err, results) {
      if (err) {
        console.log("err : ",err)
      } else {
        console.log("check in 3 DELETE : checkAlarmAuto")
      }
    }
  );
}


/////////////////////////////////
///////// connector /////////////
/////////////////////////////////

async function insertAlarm(){
  const request = new mssql.Request();

  let source_name = ["Board#1","Board#1/ProxyConnection#8","Board#1/IPGroup#8",
                    "ProxyConnection#3","Board#1/ProxyConnection#3",
                    "Board#1/ProxyConnection#4","Board#1/ProxyConnection#5"
                    ];
  let description = ["NTP2 server alarm. No connection to NTP server.",
                      "Proxy Set Alarm Proxy Set 8 (PS_Siemens_PABX_ARO2): Proxy lost. looking for another proxy",
                      "IP Group is temporarily blocked. IP Group (IPG_Siemens_PABX_ARO2) Blocked Reason: No Working Proxy",
                      "Proxy Set Alarm Proxy Set 3 \(PS_PTTGC_CUCM\): Server 172.28.57.157:5060 is down - one or more servers in",
                      "Proxy Set 3 (PS_PTTGC_CUCM): Server 172.28.57.157:5060 is up, all servers are online now",
                      "Proxy Set Alarm Proxy Set 3 (PS_PTTGC_CUCM): Server 172.28.57.157:5060 is down - one or more servers in the proxy set are offline",
                      "Proxy Set 3 (PS_PTTGC_CUCM): Server 172.28.57.157:5060 is up, all servers are online now"
                    ];
  let severity = ["major","major","major","cleared","minor","cleared","major"];
  let datetime = "2022-11-25 20:14:31.000";
  let alarm_name = "SBC Name 1";
  let seq = "1";
  for(let i=0;i<7;i++){
    request.query(
      `INSERT INTO alarm_message(source_name,description,severity,date_time,alarm_name,seq) 
        
      VALUES ('${source_name[i]}','${description[i]}','${severity[i]}','${datetime}','${alarm_name}','${seq}')`,
      //,'${description}','${severity}','${datetime}','${alarm_name}','${seq}'
      //,description,severity,date_time,alarm_name,seq) 
      async function (err, results) {
        if (err) {
          console.log("err : ",err)
        } else {
          console.log("check in 1 insertAlarm")
        }
      }
    );
  }
  
}

/////////////////////////////////
/////////////////////////////////

async function deleteAlarm(){
  const request = new mssql.Request();
  request.query(
    `DELETE FROM alarm_message`,
    //,'${description}','${severity}','${datetime}','${alarm_name}','${seq}'
    //,description,severity,date_time,alarm_name,seq) 
    async function (err, results) {
      if (err) {
        console.log("err : ",err)
      } else {
        console.log("check in 0.5 deleteAlarm")
      }
    }
  );
}

async function insertHistory(status,insert_data){
  const request = new mssql.Request();
  //console.log("status : ",status," insert_data : ",insert_data," insert_data.length : ",insert_data.length)
  //console.log("338 : ",insert_data[0].source_name)
  console.log("342 : ",insert_data.length," status : ",status)
  for(let i=0;i<insert_data.length;i++){
      //console.log("344 : ",insert_data[i].source_name,"\n status : ",status)
      request.query(
        `INSERT INTO alarm_history(source_name,description,severity,alarm_name,seq,status) 
          
        VALUES ('${insert_data[i].source_name}','${insert_data[i].description}','${insert_data[i].severity}','${insert_data[i].alarm_name}','${insert_data[i].seq}',${status})`,
        //,'${description}','${severity}','${datetime}','${alarm_name}','${seq}'
        //,description,severity,date_time,alarm_name,seq) 
        async function (err, results) {
          if (err) {
            console.log("err : ",err)
          } else {
            console.log("check in 5 insertHistory")
          }
        }
      );
  }
  
}

const checkAlarm = async (req, res) => {
  const request = new mssql.Request();
  const data = await selectNotification(req, res);
  const data2 = await selectAlarmMsg(req, res);
  const data3 = await selectAlarmAlert(req, res)
  console.log("data : ",data.length)
  console.log("data2 : ",data2.length)
  var status_loop = false
  const ins = []
  const del = []
  for (let i = 0; i < data.length; i++) {
    let dataRow = data[i]
    let item_data2 = data2.find(row => row.source_name === dataRow.notification_name)
        if (item_data2) {
          ins.push(dataRow)
        } else {
          del.push(dataRow)
        }
  }
    console.log("ins : ",ins)
    console.log("del : ",del)

    request.query(
      `DELETE FROM alarm_alert`,
      async function (err, results) {
        if (err) {
          console.log("err : ",err)
        } else {
          console.log("results : ",results)
        }
      }
    );
    for(let row of ins){
      
      console.log("row : ",row)
      let alarm_alert_row = data3.find(row => row.alarm_name === row.notification_name)
      console.log("alarm_alert_row : ",alarm_alert_row)
      
      if(!alarm_alert_row){
        request.query(
          `INSERT INTO alarm_alert(alarm_name,alarm_dec) VALUES ('${row.notification_name}','${row.notification_desc}')`,
          async function (err, results) {
            if (err) {
              status_loop = false
              console.log("err : ",err)
            } else {
              status_loop = true
              console.log("results : ",results)
            }
          }
        );
      }
    }

  if (status_loop == true) {
    const data4 = await selectAlarmAlert(req, res);
    await res.json(data4);
    await updateEmail(req, res, data3);
  } else {
    await res.json(data3);
  }
};


const checkAlert = async (req, res) => {
  var data = await selectAlarmAlert(req, res);
  data = JSON.parse(data);
  var data2 = await selectAlarmMsg(req, res);
  data2 = JSON.parse(data2);
  for (let i = 0; i < data2.length; i++) {
    let request = new mssql.Request();
    request.multiple = true;
    if (data[i]?.alarm_name === data2[i]?.source_name) {
      request.query(
        "SELECT * FROM alarm_alert ",
        async function (err, results) {
          if (err) {
            await res.sendStatus(422);
          } else {
            await res.sendStatus(201);
          }
        }
      );
    }
  }
};

const updateEmail = async (req, res, data) => {
  return await new Promise((resolve, reject) => {
    let request = new mssql.Request();
    data_result = [];
    var data_name = [];
    var data_dec = [];
    for (var i = 0; i < data.length; i++) {
      data_name[i] = data[i].alarm_name + " : ";
      data_dec[i] = data[i].alarm_dec + "\n ";
      data_result[i] = data_name[i] + data_dec[i];
    }
    if (schema.validate.error) {
      res.status(422).json({ err: schema.error });
    } else {
      request.query(
        `UPDATE email SET email_detail='${data_result}' WHERE recipient_id = '1'`,
        async function (err, results) {
          //console.log(results)
          if (results) {
            resolve("update sucsess");
          } else {
            resolve(err);
          }
        }
      );
    }
  });
};

const getAllNotification = async (req, res) => {
  return await new Promise((resolve, reject) => {
    let request = new mssql.Request();
    if (schema.validate.error) {
      resolve({ err: schema.error });
    } else {
      request.query(
        `SELECT * FROM notification`,
        async function (err, results) {
          if (results?.length != "undefined") {
            var data = results?.recordsets[0];
            resolve(data);
          } else {
            resolve(err);
          }
        }
      );
    }
  });
};

const getImportNotification = async (req, res) => {
  return await new Promise((resolve, reject) => {
    let request = new mssql.Request();
    if (schema.validate.error) {
      resolve({ err: schema.error });
    } else {
      request.query(
        `SELECT notification_name,notification_desc,status FROM notification`,
        async function (err, results) {
          if (results?.length != "undefined") {
            var data = results?.recordsets[0];
            resolve(data);
          } else {
            resolve(err);
          }
        }
      );
    }
  });
};

const getOneNotification = async (req, res) => {
  let id = req.params.id;
  let request = new mssql.Request();
  if (id) {
    request.query(
      "SELECT * FROM notification WHERE notification_id=" + id,
      function (err, results) {
        res.status(200).send(results?.recordsets[0]);
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
      "INSERT INTO notification(notification_name,notification_desc,status) VALUES (@notification_name,@notification_desc,@status)",
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
    "DELETE FROM notification WHERE notification_id=" + id,
    async function (err, results) {
      if (results?.rowsAffected > 0) {
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
      "UPDATE notification SET notification_name=@notification_name,notification_desc=@notification_desc,status=@status WHERE notification_id=" +
        id,
      async function (err, results) {
        if (results?.rowsAffected >= 1) {
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
      "SELECT * FROM notification WHERE notification_name LIKE '%" +
        keyw +
        "%' OR notification_desc LIKE '%" +
        keyw +
        "%'",
      async function (err, results) {
        if (results) {
          await res.status(200).send(results?.recordsets[0]);
        } else {
          await res.status(422).json({ err: keyw + err });
        }
      }
    );
  }
};

const importNotificationFile = async (req, res) => {
  let { notification_name, notification_desc, status } = req.body;
  readXlsxFile(process.env.IMPORT_PATH).then((rows) => {
    for (let i of rows) {
      let request = new mssql.Request();
      var xArray = i.toString();
      xArray = xArray.split(",");
      request.input("notification_name1", xArray[0]);
      request.input("notification_desc1", xArray[1]);
      request.input("status1", xArray[2]);
      request.query(
        `INSERT INTO notification(notification_name,notification_desc,status) VALUES (@notification_name1,@notification_desc1,@status1)`,
        function (err, results) {
          if (err) {
            res.status(422).json({ err: err });
          }
        }
      );
    }
    res.sendStatus(200);
  });
};

const deleteFileImport = (req, res) => {
  const path = process.env.IMPORT_PATH;
  try {
    fs.unlinkSync(path);
    res.sendStatus(200);
    //file removed
  } catch (err) {
    res.sendStatus(err);
  }
};

const exportNotificationFile = async (req, res) => {
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet("Worksheet Name");
  var data = await getImportNotification(req, res);
  const json = JSON.stringify(data);
  const withStrings = JSON.parse(json, (key, val) =>
    typeof val !== "object" && val !== null ? String(val) : val
  );
  let rowIndex = 1;
  withStrings.forEach((record) => {
    let columnIndex = 1;
    Object.keys(record).forEach((columnName) => {
      ws.cell(rowIndex, columnIndex++).string(record[columnName]);
    });
    rowIndex++;
  });
  wb.write(process.env.EXPORT_PATH);
};

const updateInterval = (req, res) => {
  let { interval } = req.body;
  let request = new mssql.Request();
  request.input("interval", req.body.interval);
  request.multiple = true;
  if (schema.validate(req.body).error) {
    res.status(422).json({ err: schema.validate(req.body).error });
  } else {
    request.query(
      "UPDATE notification SET interval=@interval",
      async function (err, results) {
        if (err) {
          await res.status(422).json({ err: err });
        } else {
          await res.sendStatus(201);
        }
      }
    );
  }
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
  updateInterval,
  postSendEmail,
  selectNotification,
  updateEmail,
  selectAlarmMsg,
  checkAlarm,
  checkAlert,
  selectAlarmAlert,
  deleteFileImport,
  autoSendEmail
};
