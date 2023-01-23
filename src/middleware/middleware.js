let jwt=require("jsonwebtoken")
let bookModel=require("../models/books")


let authentication=function(req,res,next){
    let headers=req.headers["x-api-key"]
    if(!headers){
        res.status(400).send({status:false,msg:"header is required"})
    }
    let verifiedToken=jwt.verify(headers,"group4californium")
    if(!verifiedToken){
        res.status(400).send({status:false,msg:"Invalid Token"})
    }
    req.decodedToken=verifiedToken;
    
    next()

}


let authorization=async function(req,res,next){
    
    let tokenUser=req.decodedToken.userId
    let bookId=req.params.bookId
    let book=await bookModel.findOne({_id:bookId})
   
    let userId=book["userId"].toString()
    console.log(userId)
   
    if(userId!=tokenUser){
        return res.status(403).send({msg:"You are not authorized"})   
    }
    next()
}


module.exports.authentication=authentication;
module.exports.authorization=authorization;


