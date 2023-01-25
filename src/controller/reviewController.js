const { default: mongoose } = require("mongoose");
const reviewModel = require("../models/review");
const bookModel=require("../models/books");
const validator=require("validator")


const createReveiw = async (req, res) => {
    let bookId = req.params.bookId;
    if (!bookId) {
       return res.status(400).json({ status: false, msg: "please provide bookID" });
    }
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return res
            .status(400)
            .json({ status: false, msg: "enter valid bookID" });
    }
    let data = req.body;
    
    console.log(data.rating)
    if(data.rating===0) return res.status(400).send({status:false,msg:"rating should be greater than 0"})
    if (data.rating==null) {
        return res.status(400).json({ status: false, msg: "please provide rating" });
    }
    
    if(!(data.rating>0 && data.rating<6)){
        return res.status(400).send({status:false,msg:"rating should be from 0 to 5"})

    }
     let checkBookId=await bookModel.findById(bookId)

      if(!checkBookId) return res.status(400).json({status:false,msg:"bookId not found"})
    //--------------updating reviews key count in book--------------
    
    let update=await bookModel.findOneAndUpdate(
        {_id:bookId},{$inc: {reviews:1},new:true})

    data.reviewedAt = Date.now();
    const reveiw = await reviewModel.create(data);
    let obj={
        book:update,
        review:{_id:reveiw._id,
        bookId:reveiw.bookId,
        reviewedBy: reveiw.reviewedBy,
        reviewedAt: reveiw.reviewedAt,
        rating: reveiw.rating,
        review: reveiw.review
        }

   }
   return  res.status(201).json({status: true,msg: "success",data: obj});
}

let updateReview=async function(req,res){
    let bookId=req.params.bookId
    let reviewId=req.params.reviewId

    //-------validating reviewId-------------------
    let bookdata=await bookModel.findOne({_id:bookId,isDeleted:false})
    if(!bookdata) return res.status(400).send({staus:false,message:"This bookId does not exists"})
    let reviewsData=await reviewModel.findOne({_id:reviewId})
    if(!reviewsData) return res.status(400).send({staus:false,message:"This reviewId does not exists"})
    console.log(bookdata._id.toString())
    console.log(reviewsData.bookId.toString())
    if(bookdata._id.toString()!=reviewsData.bookId.toString()) return res.status(400).send({staus:false,message:"no reviewId found for this bookId"})

    let data=req.body
    if(Object.keys(data).length==0) return res.status(400).send({staus:false,message:"send some data to update"})
    
    let review=data.review
    let rating=data.rating
    let reviewedBy=data.reviewedBy
    
        if(Number(rating)===0) return res.status(400).send({status:false,msg:"rating should be greater than 0"})
        if(!(data.rating>0 && data.rating<6)){
            return res.status(400).send({status:false,msg:"rating should be from 0 to 5"})
    
        }
    
    if(reviewedBy){
        if(validator.isNumeric(reviewedBy)) return res.status(400).send({status:false,message:"Enter a valid name"})
    }


    let update=await reviewModel.findOneAndUpdate({_id:reviewId},{review:review,rating:rating,reviewedBy:reviewedBy},{new:true})
    return res.status(200).send({status:false,message:"success",data:update})

 

}









module.exports={createReveiw,updateReview}




