const Nation = require("../models/nation");

var jwt = require("jsonwebtoken");
const config = require("../config/config");
const Player = require("../models/player");
const playerController = require("./playerController");

const errMessage = "Nation already exist!";
const authMessage = "Only Admin can do this action!";

class nationController {
  index(req, res, next) {
    var token = req.cookies.accessToken;
    let perPage = 5;
    let page = req.params.page || 1;
    if (token) {
      var data = jwt.verify(req.cookies.accessToken, config.secretKey);
      if (data.user.isAdmin) {
        Nation.find({})
          .skip(perPage * page - perPage)
          .limit(perPage)
          .then((nation) => {
            Nation.countDocuments((err, count) => {
              res.render("nation", {
                title: "The list of Nations",
                nation: nation,
                checkAdmin: true,
                message: "",
                authMessage: "",
                currentPage: page,
                pages: Math.ceil(count / perPage),
              });
            });
          })
          .catch(next);
      } else {
        Nation.find({})
          .skip(perPage * page - perPage)
          .limit(perPage)
          .then((nation) => {
            Nation.countDocuments((err, count) => {
              res.render("nation", {
                title: "The list of Nations",
                nation: nation,
                checkAdmin: false,
                message: "",
                authMessage: "",
                currentPage: page,
                pages: Math.ceil(count / perPage),
              });
            });
          })
          .catch(next);
      }
    } else {
      Nation.find({})
        .skip(perPage * page - perPage)
        .limit(perPage)
        .then((nation) => {
          Nation.countDocuments((err, count) => {
            res.render("nation", {
              title: "The list of Nations",
              nation: nation,
              checkAdmin: false,
              message: "",
              authMessage: "",
              currentPage: page,
              pages: Math.ceil(count / perPage),
            });
          });
        })
        .catch(next);
    }
  }
  create(req, res, next) {
    const nation = new Nation(req.body);
    const nationName = req.body.name;
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    if (data.user.isAdmin) {
      nation
        .save()
        .then(() => {
          res.redirect("/nations/1");
        })
        .catch(() => {
          Nation.find({ name: nationName }).then((nation) => {
            res.render("nation", {
              title: "The list of Nations",
              nation: nation,
              message: errMessage,
              checkAdmin: true,
            });
          });
        });
    } else {
      req.flash("error_msg", authMessage);
      res.redirect("/nations/1");
    }
  }

  edit(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    if (data.user.isAdmin) {
      const nationID = req.params.nationID;
      Nation.findById(nationID)
        .then((nation) => {
          res.render("editNation", {
            title: "The list of Nations",
            nation: nation,
            message: "",
          });
        })
        .catch(next);
    } else {
      req.flash("error_msg", authMessage);
      res.redirect("/nations/1");
    }
  }
  update(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    if (data.user.isAdmin) {
      const nationID = req.params.nationID;
      Nation.updateOne({ _id: nationID }, req.body)
        .then(() => {
          res.redirect("/nations/1");
        })
        .catch(() => {
          Nation.findById(nationID).then((nation) => {
            res.render("editNation", {
              title: "The list of Nations",
              nation: nation,
              message: errMessage,
            });
          });
        });
    } else {
      req.flash("error_msg", authMessage);
      res.redirect("/nations/1");
    }
  }

  // delete(req, res, next) {
  //   var data = jwt.verify(req.cookies.accessToken, config.secretKey);
  //   if (data.user.isAdmin) {
  //     const nationID = req.params.nationID;
  //     Nation.findByIdAndDelete({ _id: nationID })
  //       .then(() => {
  //         res.redirect("/nations/1");
  //       })
  //       .catch(next);
  //   } else {
  //     req.flash("error_msg", authMessage);
  //     res.redirect("/nations/1");
  //   }
  // }

  delete(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    if (data.user.isAdmin) {
      const nationID = req.params.nationID;
      console.log(nationID);
      Player.findOne({ nation: nationID }).then((player) => {
        if (player) {
          console.log(player);
          req.flash("error_msg", "Nation already use by player!");
          res.redirect("/players/1");
        } else {
          Nation.findByIdAndDelete({ _id: nationID })
            .then(() => {
              res.redirect("/nations/1");
            })
            .catch(next);
        }
      });
    } else {
      req.flash("error_msg", authMessage);
      res.redirect("/nations/1");
    }
  }

  async liveSearch(req, res, next) {
    const searchQ = req.query.search;
    try {
      if (searchQ.length === 0) {
        return res.send({ response: "" });
      }

      const results = await Nation.find({
        name: { $regex: searchQ, $options: "i" },
      }).limit(5);
      if (!results.length) {
        return res.send({ response: "No result" });
      }

      const hint = results
        .map(
          (result) =>
            `<div class='results'>` +
            `<div class='result-img'><img src='${result.image}' alt="Nation Image"/></div>` +
            `<a href='/nations/edit/${result.id}'>${result.name}</a>` +
            `</div>`
        )
        .join("<br/>");
      res.send({ response: hint });
    } catch (err) {
      console.error(err);
      res.status(500).send({ response: "An error occurred" });
    }
  }
}

module.exports = new nationController();
