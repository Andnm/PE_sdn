const Player = require("../models/player");
const Nation = require("../models/nation");

var jwt = require("jsonwebtoken");
const config = require("../config/config");

let clubData = [
  { id: "1", name: "Arsenal" },
  { id: "2", name: "Manchester United" },
  { id: "3", name: "Chelsea" },
  { id: "4", name: "Manchester City" },
  { id: "5", name: "PSG" },
  { id: "6", name: "Inter Milan" },
  { id: "7", name: "Real Madrid" },
  { id: "8", name: "Barcelona" },
];

let isCaptain = [
  { id: "1", name: "Captain" },
  { id: "2", name: "Not Captain" },
];

let positionList = [
  { id: "1", name: "Goalkeeper" },
  { id: "2", name: "Defenders" },
  { id: "3", name: "Midfielders " },
  { id: "4", name: "Forwards" },
];

const errMessage = "Player name already exist!";
const authMessage = "Only Admin can do this action!";

class playerController {
  index(req, res, next) {
    var token = req.cookies.accessToken;
    let nationList = [];
    let perPage = 5;
    let page = req.params.page || 1;
    Nation.find({}, function (err, nations) {
      if (err) {
        console.error(err);
        return;
      }
      nations.forEach(function (nation) {
        nationList.push(nation);
      });
    });
    if (token) {
      var data = jwt.verify(req.cookies.accessToken, config.secretKey);
      if (data.user.isAdmin) {
        Player.find({})
          .populate("nation")
          .skip(perPage * page - perPage)
          .limit(perPage)
          .then((player) => {
            Player.countDocuments((err, count) => {
              res.render("player", {
                title: "The list of Players",
                players: player,
                clubList: clubData,
                isCaptainList: isCaptain,
                message: "",
                checkAdmin: true,
                positions: positionList,
                nations: nationList,
                currentPage: page,
                isLogin: true,
                pages: Math.ceil(count / perPage),
              });
            });
          })
          .catch(next);
      } else {
        Player.find({})
          .skip(perPage * page - perPage)
          .limit(perPage)
          .then((player) => {
            Player.countDocuments((err, count) => {
              res.render("player", {
                title: "The list of Players",
                players: player,
                clubList: clubData,
                isCaptainList: isCaptain,
                message: "",
                checkAdmin: false,
                positions: positionList,
                nations: nationList,
                isLogin: true,
                currentPage: page,
                pages: Math.ceil(count / perPage),
              });
            });
          })
          .catch(next);
      }
    } else {
      Player.find({})
        .skip(perPage * page - perPage)
        .limit(perPage)
        .then((player) => {
          Player.countDocuments((err, count) => {
            res.render("player", {
              title: "The list of Players",
              players: player,
              clubList: clubData,
              isCaptainList: isCaptain,
              message: "",
              checkAdmin: false,
              positions: positionList,
              nations: nationList,
              isLogin: false,
              currentPage: page,
              pages: Math.ceil(count / perPage),
            });
          });
        })
        .catch(next);
    }
  }

  create(req, res, next) {
    const newPlayer = new Player(req.body);
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    let nationList = [];
    Nation.find({}, function (err, nations) {
      if (err) {
        console.error(err);
        return;
      }
      nations.forEach(function (nation) {
        nationList.push(nation);
      });
    });
    if (data.user.isAdmin) {
      if (newPlayer.goals > 0) {
        newPlayer
          .save()
          .then(() => {
            res.redirect("/players/1");
          })
          .catch(() => {
            Player.find({})
              .then((player) => {
                res.render("player", {
                  title: "The list of Players",
                  players: player,
                  clubList: clubData,
                  isCaptainList: isCaptain,
                  error: "Name already exist!",
                  checkAdmin: true,
                  nations: nationList,
                  positions: positionList,
                  isLogin: true,
                });
              })
              .catch(next);
          });
      } else {
        req.flash("error_msg", "Goals must lager than 0!");
        res.redirect("/players/1");
      }
    }
  }

  edit(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    let nationList = [];
    Nation.find({}, function (err, nations) {
      if (err) {
        console.error(err);
        return;
      }
      nations.forEach(function (nation) {
        nationList.push(nation);
      });
    });
    if (data.user.isAdmin) {
      const playerID = req.params.playerID;
      Player.findById(playerID)
        .then((player) => {
          res.render("editPlayer", {
            title: "The detail of Player",
            player: player,
            clubList: clubData,
            isCaptainList: isCaptain,
            message: "",
            nations: nationList,
            positions: positionList,
            isLogin: true,
          });
        })
        .catch(next);
    } else {
      req.flash("error_msg", authMessage);
      res.redirect("/players/1");
    }
  }
  update(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    let nationList = [];
    Nation.find({}, function (err, nations) {
      if (err) {
        console.error(err);
        return;
      }
      nations.forEach(function (nation) {
        nationList.push(nation);
      });
    });
    if (data.user.isAdmin) {
      const playerID = req.params.playerID;
      if (req.body.goals > 0) {
        Player.updateOne({ _id: playerID }, req.body)
          .then(() => {
            req.flash("success_msg", "Update success!");
            res.redirect("/players/1");
          })
          .catch(() =>
            Player.findById(playerID).then((player) => {
              req.flash("error", "Player name already exist!");
              res.redirect(`/players/1/edit/${playerID}`);
            })
          );
      } else {
        req.flash("error_msg", "Goals must lager than 0!");
        res.redirect(`/players/1/edit/${playerID}`);
      }
    } else {
      req.flash("error_msg", authMessage);
      res.redirect("/players/1");
    }
  }

  delete(req, res, next) {
    var data = jwt.verify(req.cookies.accessToken, config.secretKey);
    if (data.user.isAdmin) {
      const playerID = req.params.playerID;
      Player.findByIdAndDelete({ _id: playerID })
        .then(() => {
          res.redirect("/players/1");
        })
        .catch(next);
    } else {
      req.flash("error_msg", authMessage);
      res.redirect("/players/1");
    }
  }

  details(req, res, next) {
    var token = req.cookies.accessToken;
    const playerID = req.params.playerID;
    if (token) {
      Player.findById(playerID)
        .then((player) => {
          console.log(player);
          res.render("detailOfPlayer", {
            title: `Details of ${player.name}`,
            player: player,
            isLogin: true,
          });
        })
        .catch(next);
    } else {
      Player.findById(playerID)
        .then((player) => {
          console.log(player);
          res.render("detailOfPlayer", {
            title: `Details of ${player.name}`,
            player: player,
            isLogin: false,
          });
        })
        .catch(next);
    }
  }

  async liveSearch(req, res, next) {
    const searchQ = req.query.search;
    try {
      if (searchQ.length === 0) {
        return res.send({ response: "" });
      }

      const results = await Player.find({
        name: { $regex: searchQ, $options: "i" },
      }).limit(5);
      if (!results.length) {
        return res.send({ response: "No result" });
      }

      const hint = results
        .map(
          (result) =>
            `<div class='results'>` +
            `<div class='result-img'><img src='${result.image}' alt="Player Image"/></div>` +
            `<a href='/players/details/${result.id}'>${result.name}</a>` +
            `</div>`
        )
        .join("<br/>");
      res.send({ response: hint });
    } catch (err) {
      console.error(err);
      res.status(500).send({ response: "An error occurred" });
    }
  }
  filter(req, res, next) {
    const filterArray = req.body.filterArray;
    let nationFilter = [];
    let clubFilter = [];
    let positionFilter = [];
    let captainFilter = [];
    let perPage = 5;
    let page = req.params.page || 1;

    for (let el of filterArray) {
      switch (el.name) {
        case "nation":
          nationFilter.push(el.value);
          break;
        case "club":
          clubFilter.push(el.value);
          break;
        case "position":
          positionFilter.push(el.value);
          break;
        case "isCaptain":
          captainFilter.push(el.value);
          break;
      }
    }
    let query = {};

    if (nationFilter.length > 0) {
      query.nation = { $in: nationFilter };
    }

    if (clubFilter.length > 0) {
      query.club = { $in: clubFilter };
    }

    if (positionFilter.length > 0) {
      query.position = { $in: positionFilter };
    }

    if (captainFilter.length > 0) {
      query.isCaptain = { $in: captainFilter };
    }

    Player.find(query)
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("nation")
      .then((players) => {
        Player.countDocuments((err, count) => {
          res.send({
            players: players,
            currentPage: page,
            pages: Math.ceil(count / perPage),
          });
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error fetching players");
      });
  }
}

module.exports = new playerController();
