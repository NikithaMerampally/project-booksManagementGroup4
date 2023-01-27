let jwt=require("jsonwebtoken")
let bookModel=require("../models/books")
const { isValidObjectId, default: mongoose } = require("mongoose");


let authentication=function(req,res,next){
    try{
    let headers=req.headers["x-api-key"]
    if(!headers){
        res.status(400).send({status:false,msg:"header is required"})
    }
    let verifiedToken=jwt.verify(headers,"group4californium",(error,token)=>{
        if(error){
            res.status(401).send({msg:error.message})// only message changed reason of error could be invalid token or token expired
        }
       
        return token 
    })
   
    
    
    req.decodedToken=verifiedToken;
    
    next()

    }catch(error){
        return res.status(500).send({status:true,msg:error.message})
}
}
 


let authorization=async function(req,res,next){
    try{
    let tokenUser=req.decodedToken.userId
    let bookId=req.params.bookId
    if(!isValidObjectId(bookId)) return res.status(400).send({status:false,msg:"Invalid bookId"})
    let book=await bookModel.findOne({_id:bookId})
    if(!book){
        return res.status(400).send({status:false,msg:"No books found with this bookId"})
    }
    let userId=book["userId"].toString()
    console.log(userId)
   
    if(userId!=tokenUser){
        return res.status(403).send({msg:"You are not authorized"})   
    }
    next()
}catch(error){
    return res.status(500).send({status:false,msg:error.message})

}
}


module.exports.authentication=authentication;
module.exports.authorization=authorization;


