const express = require("express");

const { catchErrors } = require("./helpers");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/all", catchErrors(userController.getAllUsers));

router.get("/search", catchErrors(userController.searchUsers));

module.exports = router;
