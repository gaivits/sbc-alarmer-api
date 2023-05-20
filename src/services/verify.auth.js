const jwt = require("jsonwebtoken");
function verified(req, res, next) {
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ")[1];
    jwt.verify(token, process.env.JWT_ACCESS_SECRET, function (err, valid) {
      if (err) {
        res.status(401).json({ err: "May the token invalid" });
      } else {
        next();
      }
    });
  } else {
    res.sendStatus(403);
  }
}

module.exports = verified;
