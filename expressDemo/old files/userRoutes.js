const express = require("express");

const router = express.Router();

const  registerUser  = require("./userController");


// console.log(registerUser);

router.route("/api/v1/register").post(registerUser);

module.exports = router;