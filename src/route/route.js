const express = require("express");
const app=express()
const router = express.Router();
const bookController=require("../controller/bookController")
const userController=require("../controller/userController")
const reviewController=require("../controller/reviewController")
const middleware=require("../middleware/middleware")
const aws=require("aws-sdk")
const cover=require("../aws/cover aws")



router.post("/register",userController.createUser);
router.post("/books",middleware.authentication,bookController.createBooks);
router.get("/books",middleware.authentication,bookController.getBOOksBYQuery);
router.get("/books/:bookId",middleware.authentication,bookController.getbooks);
router.post("/login",userController.loginuser);
router.put("/books/:bookId",middleware.authentication,middleware.authorization,bookController.updateBook)
router.delete("/books/:bookId",middleware.authentication,middleware.authorization,bookController.deletedbyId)
router.post("/books/:bookId/review",reviewController.createReveiw)
router.put("/books/:bookId/review/:reviewId",reviewController.updateReview)
router.delete("/books/:bookId/review/:reviewId",reviewController.deleteReview);
router.post("/aws",cover.uploaddata)


// router.all("/*",function(req,res){
//     res.send({msg:"please Enter a correct URL"})
    
// })
// aws.config.update({
//     accessKeyId: "AKIAY3L35MCRZNIRGT6N",
//     secretAccessKey: "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",
//     region: "ap-south-1"
// })

// let uploadFile= async ( file) =>{
//     return new Promise( function(resolve, reject) {
//      // this function will upload file to aws and return the link
//      let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws
 
//      var uploadParams= {
//          ACL: "public-read",
//          Bucket: "classroom-training-bucket",  //HERE
//          Key: "abc/" + file.originalname, //HERE 
//          Body: file.buffer
//      }
 
 
//      s3.upload( uploadParams, function (err, data ){
//          if(err) {
//              return reject({"error": err})
//          }
//          console.log(data)
//          console.log("file uploaded succesfully")
//          return resolve(data.Location)
//      })
 
//      // let data= await s3.upload( uploadParams)
//      // if( data) return data.Location
//      // else return "there is an error"
 
//     })
//  }

// let uploaddata= async function(req, res){

//     try{
//         let files= req.files
//         console.log(files)
//         if(files && files.length>0){
//             //upload to s3 and get the uploaded link
//             // res.send the link back to frontend/postman
//             let uploadedFileURL= await uploadFile( files[0] )
//             res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
//         }
//         else{
//             res.status(400).send({ msg: "No file found" })
//         }
        
//     }
//     catch(err){
//         res.status(500).send({msg: err})
//     }
    
// }

module.exports = router;




