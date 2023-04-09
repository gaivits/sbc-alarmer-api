const multer = require("multer");
const path = require("path");
var folderPath = '/Users/phongsakorn/Desktop/sbc-alarmer-apis/src/uploads'
const importNotificationFile = require('../controllers/notification.controller')
const storage = multer.diskStorage({
  destination: (req,res,file, importNotificationFile) => {
    if(file.mimetype==="application/vnd.ms-excel" || file.mimetype==="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        importNotificationFile(null, folderPath);

  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});
const uploadFile = multer({ storage: storage });

module.exports=uploadFile
