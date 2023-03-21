const express = require("express");
const nationRouter = express.Router();
const nationController = require("../controller/nationController");
// const { ensureAuthenticated } = require("../config/auth");
var { cookieAuthenticated } = require("../config/authenticated");

nationRouter
  .route("/:page")
  .get(nationController.index)
  .post(cookieAuthenticated, nationController.create);

nationRouter.route("/").get(nationController.liveSearch);

nationRouter
  .route("/edit/:nationID")
  .get(cookieAuthenticated, nationController.edit)
  .post(cookieAuthenticated, nationController.update);

nationRouter
  .route("/delete/:nationID")
  .get(cookieAuthenticated, nationController.delete);

module.exports = nationRouter;
