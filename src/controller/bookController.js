// ## GET /books/:bookId

const { isValidObjectId, default: mongoose } = require("mongoose");
const bookModel = require("../models/books");

exports.getbooks = async (req, res) => {
    try {
        let bookId = req.params.bookId;
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({
                status: false,
                msg: "bookID is invalid enter valid id",
            });
        }
        const book = await bookModel.findById(bookId);
        res.status(200).json({ status: true, data: book });
    } catch (error) {
        res.status(500).json({ status: false, msg: error });
    }
};

const getBOOksBYQuery=async function(req,res){
    try{
    let data=req.query
    const {userId,category,subCategory}=data
    if(!userId && !category && !subCategory){
        let Allbooksdata=await bookModel.find({isDeleted:false}).select({ISBN:0,subcategory:0,deletedAt:0,isDeleted:0,createdAt:0,updatedAt:0}).sort({title:1})
        return res.status(200).send({status:true,data:Allbooksdata})
    }
    if (!isValidObjectId(userId)) {
        return res.status(400).send({status :false , msg: "Enter A Valid userid" })
    }

    let book=await bookModel.find({isDeleted:false,...query}).select({ISBN:0,subcategory:0,deletedAt:0,isDeleted:0,createdAt:0,updatedAt:0}).sort({title:1})
    if(book.length==0) return res.status(404).send({status:false,msg:"books are not found"})

    return res.status(200).send({status:true,data:book})

    }catch (err) {
    res.status(500).send({ status: false, msg: err.message });
    }
    }

    module.exports.getBOOksBYQuery=getBOOksBYQuery;




