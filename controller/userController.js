const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { Passport } = require("passport");

var today = new Date();
var currentYear = today.getFullYear();
var token = "";

class userController {
  index(req, res, next) {
    res.render("register", {
      title: "Register Page",
    });
  }
  async register(req, res, next) {
    console.log(req.body);
    const { name, yob, username, password } = req.body;
    let age = currentYear - yob;
    let errors = [];
    if (!username || !password || !name || !yob) {
      errors.push({ msg: "Please input all fields!" });
    }
    if (password.length < 6) {
      errors.push({ msg: "Password must be at least 6 characters" });
    }
    if (age < 18 || age > 100) {
      errors.push({
        msg: "You must be over 18 years old and less than 100 years old!",
      });
    }
    if (errors.length > 0) {
      res.render("register", {
        title: "Register Page",
        errors: errors,
        name: name,
        yob: yob,
        username: username,
        password: password,
      });
    } else {
      await User.findOne({ username: username }).then((user) => {
        if (user) {
          errors.push({ msg: "Username already exists" });
          res.render("register", {
            title: "Register Page",
            errors: errors,
            name: name,
            yob: yob,
            username: username,
            password: password,
          });
        } else {
          const newUser = new User({
            name: name,
            yob: yob,
            username: username,
            password: password,
            isAdmin: false,
          });
          //Hash password
          bcrypt.hash(newUser.password, 10, function (err, hash) {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                res.redirect("/auth");
              })
              .catch(next);
          });
        }
      });
    }
  }
  login(req, res, next) {
    res.render("login", {
      title: "Login Page",
    });
  }
  signIn(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    User.findOne({ username: username })
      .then((user) => {
        if (user) {
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              token = jwt.sign({ user }, config.secretKey);
              res.cookie("accessToken", token);
              res.redirect("/");
            } else {
              req.flash("error_msg", "Password incorrect!");
              res.redirect("/auth");
            }
          });
        } else {
          req.flash("error_msg", "Username not exist!");
          res.redirect("/auth");
        }
      })
      .catch((err) => console.log(err));
  }
  signOut(req, res, next) {
    req.logout(function (err) {
      if (err) return next(err);
      //Clear token
      res.clearCookie("accessToken");
      req.flash("success_msg", "You are logged out!");
      res.redirect("/auth");
    });
  }
  account(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    var userID = data.user._id;
    var showListUser = false;
    if (data.user.isAdmin) {
      showListUser = true;
    }
    User.findById(userID).then((user) => {
      res.render("account", {
        title: "Account Page",
        user: user,
        showListUser: showListUser,
      });
    });
  }
  editAccount(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    var userID = data.user._id;
    User.findById(userID).then((user) => {
      res.render("editAccount", {
        title: "Edit Account",
        user: user,
      });
    });
  }
  updateAccount(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    var userID = data.user._id;
    let age = currentYear - req.body.yob;
    console.log(age);
    let errors = "";
    if (age < 18 || age > 100) {
      errors = "You must be over 18 years old and less than 100 years old!";
    }
    if (errors.length != "") {
      User.findById(userID).then((user) => {
        res.render("editAccount", {
          title: "Edit Account",
          user: user,
          error_msg: errors,
        });
      });
    } else {
      User.updateOne({ _id: userID }, req.body)
        .then(() => {
          res.redirect("/auth/account");
        })
        .catch((err) => {
          req.flash("error_msg", err);
          User.findById(userID).then((user) => {
            res.render("editAccount", {
              title: "Edit Account",
              user: user,
            });
          });
        });
    }
  }
  listUser(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    if (data.user.isAdmin) {
      User.find({}).then((user) => {
        res.render("listUser", {
          title: "List User",
          user: user,
        });
      });
    } else {
      req.flash("error_msg", "Only Admin can do this action!");
      res.redirect("/auth/account");
    }
  }
  getChangePassword(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    if (data) {
      var userID = data.user._id;
      User.find({ _id: userID }).then((user) => {
        res.render("changePassword", {
          title: "Change Passport Page",
        });
      });
    }
  }
  updatePassword(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    if (data) {
      var userID = data.user._id;
      console.log(req.body);
      var { password, newPassword, confirmNewPassword } = req.body;
      if (newPassword != confirmNewPassword) {
        req.flash("error_msg", "New password not match confirm password!");
        res.redirect("/auth/account/changePassword");
      }
      if (password == newPassword) {
        req.flash("error_msg", "New password not same old password!");
        res.redirect("/auth/account/changePassword");
      }
      if (newPassword.length < 6) {
        req.flash("error_msg", "New password must be at least 6 characters");
        res.redirect("/auth/account/changePassword");
      }
      User.findOne({ _id: userID })
        .then((user) => {
          console.log(user);
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            console.log(isMatch);
            if (isMatch) {
              //Hash the new password
              bcrypt.hash(newPassword, 10, (err, hash) => {
                if (err) throw err;
                newPassword = hash;
                User.updateOne(
                  { _id: userID },
                  {
                    password: hash,
                  }
                ).then(() => {
                  req.flash("success_msg", "Password updated successfully");
                  res.redirect("/auth/account");
                });
              });
            } else {
              req.flash("error_msg", "Password incorrect!");
              res.redirect("/auth/account/changePassword");
            }
          });
        })
        .catch((err) => console.log(err));
    }
  }
}

module.exports = new userController();
