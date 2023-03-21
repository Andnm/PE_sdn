var express = require("express");
var router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

/* GET home page. */
router.get("/", function (req, res, next) {
  var token = req.cookies.accessToken;

  if (token) {
    res.render("index", {
      title: "Express",
      isLogin: true,
    });
  } else {
    res.render("index", {
      title: "Express",
      isLogin: false,
    });
  }
});

module.exports = router;
