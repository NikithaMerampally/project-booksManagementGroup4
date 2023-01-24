const express = require("express");
const router = express.Router();
const bookController=require("../controller/bookController")
const userController=require("../controller/userController")
const reviewController=require("../controller/reviewController")
const middleware=require("../middleware/middleware")

router.post("/register",userController.createUser);
router.post("/books",middleware.authentication,middleware.authorization,bookController.createBooks);
router.get("/books",middleware.authentication,bookController.getBOOksBYQuery);
router.get("/books/:bookId",middleware.authentication,middleware.authorization,bookController.getbooks);
router.post("/login",userController.loginuser);
router.put("/books/:bookId")

router.put("/books/:bookId",middleware.authentication,middleware.authorization,bookController.updateBook)

module.exports = router;
