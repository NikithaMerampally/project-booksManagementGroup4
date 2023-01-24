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
    if (!data.rating) {
        return res
            .status(400)
            .json({ status: false, msg: "please provide rating" });
    }
     let checkBookId=await bookModel.findById(bookId)
      if(!checkBookId) return res.status(400).json({status:false,msg:"bookId not found"})


    data.reviewedAt = Date.now();

    const reveiw = await reviewModel.create(data);
let obj={
    _id:review._id,
    bookId:reveiw.bookId,
    reviewedBy: reveiw.reviewedBy,
    reviewedAt: reveiw.reviewedAt,
    rating: reveiw.rating,
    review: review.review


}



    if(!reveiw)
    {
        return res.status(400).json({ status: false, msg: "no book found with this bookId" });

    }
    res.status(201).json({
        status: true,
        msg: "created successfully",
        data: obj,
    });
}
module.exports={createReveiw}




