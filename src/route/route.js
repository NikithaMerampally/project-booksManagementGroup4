const express = require("express");
const router = express.Router();
const bookController=require("../controller/bookController")
const userController=require("../controller/userController")
const reviewController=require("../controller/reviewController")

router.post("/register",userController.createUser);
router.post("/books",bookController.createBooks);

module.exports = router;
