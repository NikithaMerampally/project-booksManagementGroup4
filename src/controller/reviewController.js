const { default: mongoose } = require("mongoose");
const reviewModel = require("../models/review");
const bookModel=require("../models/books");
const validator=require("validator")


const createReveiw = async (req, res) => {
    try{
    let bookId = req.params.bookId;
    if (!bookId) {
       return res.status(400).json({ status: false, meassage: "please provide bookID" });
    }
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return res
            .status(400)
            .json({ status: false, msg: "enter valid bookID" });
    }
    let data = req.body;
    //-----------------checking whether the rating is provided between 1-5 only------------------------
    if(data.rating===0) return res.status(400).send({status:false,msg:"rating should be greater than 0"})
    if (data.rating==null) {
        return res.status(400).json({ status: false, msg: "please provide rating" });
    }
    
    if(!(data.rating>0 && data.rating<6)){
        return res.status(400).send({status:false,msg:"rating should be from 0 to 5"})

    }

    //---------------------reviewers name should have alphabets only---------------
    if(data.reviewedBy=="")
    {
        delete data['reviewedBy']
    }
    if(data.reviewedBy)
    {
        if(data.reviewedBy.trim()==="") data.reviewedBy="Guest"
        if(!validator.isAlpha(data.reviewedBy,'en-US',{ignore:' '}))   return res.status(400).send({status:false,msg:"please provide valid reviewedBy"})
        data.reviewedBy=data.reviewedBy.trim()
    }
     let checkBookId=await bookModel.findById(bookId)

      if(!checkBookId) return res.status(404).json({status:false,message:"book not found"})
   //--------------- set bookId from params inside data object----------------------- added here
    data.bookId=bookId

    //--------------updating reviews key count in book--------------
    
    let update=await bookModel.findOneAndUpdate(
        {_id:bookId},{$inc: {reviews:1}},{new:true}) // new true was not working because it was set inside $inc block now its working

    data.reviewedAt = Date.now();
    const reveiw = await reviewModel.create(data);
    let obj={
        book:update,
        reviewsData:{_id:reveiw._id,
        bookId:reveiw.bookId,
        reviewedBy: reveiw.reviewedBy,
        reviewedAt: reveiw.reviewedAt,
        rating: reveiw.rating,
        review: reveiw.review
        }
        
    }
    return  res.status(201).json({status: true,msg: "success",data: obj});
}
catch(error)
{
    return res.status(500).send({status:false,error:error.message})

}
}

//--------------------------update review api----------------------------------------------------------------

let updateReview=async function(req,res){
    try{
    let bookId=req.params.bookId
    let reviewId=req.params.reviewId
    //-----------------validating bookid and review id---------------------------------------------------
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return res.status(400).json({ status: false, msg: "book id is invalid" });
    }
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return res.status(400).json({ status: false, msg: "review id is invalid" })}

    //--------------------checking existence of bookId and review Id------------------------------------
    let bookdata=await bookModel.findOne({_id:bookId,isDeleted:false})
    if(!bookdata) return res.status(404).send({staus:false,message:"This book does not exists"})
    let reviewsData=await reviewModel.findOne({_id:reviewId,isDeleted:false})
    if(!reviewsData) return res.status(404).send({staus:false,message:"This reviewId does not found"})
    console.log(bookdata._id.toString())
    console.log(reviewsData.bookId.toString())
    //--------------------------checking whether this book has reviewId or not---------------------------------------
    if(bookdata._id.toString()!=reviewsData.bookId.toString()) return res.status(404).send({staus:false,message:"no reviewId found for this bookId"})
    //-------------------if this review Id is present in this book------------------------------------------------------
    let data=req.body
    if(Object.keys(data).length==0) return res.status(400).send({staus:false,message:"send some data to update"})
    
    
    let object={}
    //---------------------checking rating key and rating should be 1-5----------------------------------------------------------------------
        if(data.rating){
            if(Number(data.rating)===0) return res.status(400).send({status:false,msg:"rating should be greater than 0"})
            if(!(data.rating>0 && data.rating<6)){
                return res.status(400).send({status:false,msg:"rating should be from 0 to 5"})
            }
            object.rating=data.rating
        }
        //---------------------------checking reviewBy key and also checking that it should have alphabets only--------------------
         if(data.reviewedBy){
            if(!validator.isAlpha(data.reviewedBy,'en-US',{ignore:' '}))  return res.status(400)
            .send({status:false,msg:"It accepts only alphabets and there should not be any special characters numbers and spaces"})
            data.reviewedBy=data.reviewedBy.trim()
            object.reviewedBy=data.reviewedBy
         }
         //----------------------------checking review--------------------------------------
        if(data.review){
             if(data.review){
                if(!data.review.trim()=="") {
                    object.review=data.review

                }   
             }
        }
         if(Object.keys(object).length==0) return res.status(500).send({status:false,message:"please provide something to update"})
        
        
         
    let update=await reviewModel.findOneAndUpdate({_id:reviewId},object,{new:true})

    let finalData={
        _id:bookdata._id,
        title:bookdata.title,
        excerpt:bookdata.excerpt,
        userId:bookdata.userId,
        ISBN:bookdata.ISBN,
        category:bookdata.category,
        subcategory:bookdata.subcategory,
        reviews:bookdata.reviews,
        isDeleted:bookdata.isDeleted,
        releasedAt:bookdata.releasedAt,
        createdAt:bookdata.createdAt,
        updatedAt:bookdata.updatedAt,
        reviewsData:update
        
        
    }
    return res.status(200).send({status:true,message:"success",data:finalData})
    }
    catch(error)
    {
    return res.status(500).send({status:false,error:error.message})

    }
}

const deleteReview = async (req, res) => {
    try{
    let bookId = req.params.bookId;
    let reviewId = req.params.reviewId;
    //-------------validating bookId and review Id----------------------------------------------------
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return res.status(400).json({ status: false, msg: "book id is invalid" });
    }
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return res.status(400).json({ status: false, msg: "review id is invalid" })}

    //------------------checking the existence of bookId and review Id-----------------------------------    
    const book = await bookModel.findOne({ _id: bookId,isDeleted:false});
    if (!book) {
       return res.status(404).json({ status: false, msg: "book id not found" });
    }
    const review = await reviewModel.findOne({ _id: reviewId,isDeleted:false});
    if (!review) {
       return res.status(404).json({ status: false, msg: "review id not found" });
    }
      
   //----------------finally deleting the review  ------------------------------------------------------
    
  let deleteReview=await reviewModel.findOneAndUpdate({_id:reviewId,isDeleted:false},{isDeleted:true})
    return res.status(200).json({status: true,message: "deleted successfully"});

//---------------updating the review count in bookModel--------------------------------------
   let update = await bookModel.findOneAndUpdate({ _id: bookId },{ $inc: { reviews: -1 } },{ new: true });
}
catch(error)
{
    return res.status(500).send({status:false,error:error.message})

}
};


module.exports={createReveiw,updateReview,deleteReview}




