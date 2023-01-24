const { default: mongoose } = require("mongoose");
const reviewModel = require("../models/review");
const bookModel=require("../models/books");
const review = require("../models/review");

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
    if(!data.bookId)
    {
        return res.status(400).json({ status: false, msg: "please provide bookId" });
    }

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
        {_id:bookId},{$inc: {reviews:1},})

    data.reviewedAt = Date.now();

    const reveiw = await reviewModel.create(data);
    let obj={
        _id:reveiw._id,
        bookId:reveiw.bookId,
        reviewedBy: reveiw.reviewedBy,
        reviewedAt: reveiw.reviewedAt,
        rating: reveiw.rating,
        review: reveiw.review
    
   }
    res.status(201).json({
        status: true,
        msg: "created successfully",
        data: obj,
    });
}
module.exports={createReveiw}




