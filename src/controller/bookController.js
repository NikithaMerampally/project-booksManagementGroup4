// ## GET /books/:bookId

const { isValidObjectId, default: mongoose } = require("mongoose");
const bookModel = require("../models/books");
const createBooks=async (req,res)=>{
    try{

    let data=req.body
    if(!data.title) return res.status(400).json({status:false,msg:"please provide title"})
    data.title=data.title.trim()

    if(!data.excerpt) return res.status(400).json({status:false,msg:"please provide title"})
    data.excerpt=data.excerpt.trim()

    if(!data.userId) return res.status(400).json({status:false,msg:"please provide title"})
    data.userId=data.userId.trim()


    if(!data.ISBN) return res.status(400).json({status:false,msg:"please provide title"})
    data.ISBN=data.ISBN.trim()

    if(!data.category) return res.status(400).json({status:false,msg:"please provide title"})
    data.category=data.category.trim()

    if(!data.subCategory) return res.status(400).json({status:false,msg:"please provide title"})
    data.subCategory=data.subCategory.trim()


    // Duplicacy check
    let checkTitle=await bookModel.findOne({title:data.title})
    if(checkTitle) return res.status(400).send({status:false,msg:"Book with this title already exist"})

    let checkISBN=await bookModel.findOne({ISBN:data.ISBN})
    if(checkISBN)  return res.status(400).send({status:false,msg:"Book with this ISBN already exist"})


    



    let createbook=await bookModel.create(data)
    return res.status(201).send({status:true,data:createbook})
    }
    catch(error)
    {
        return res.status(500).send({status:false,msg:error.message})
    }



}



const getbooks = async (req, res) => {
    try {
        let bookId = req.params.bookId;
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({status: false,msg: "bookID is invalid enter valid id"});
        }
        const book = await bookModel.findById(bookId);
        if(!book) return res.status(200).json({status: false,msg: "bookID does not exist"});
        return res.status(200).json({ status: true, data: book });
    } catch (error) {
        res.status(500).json({ status: false, msg: error });
    }
};

const getBOOksBYQuery=async function(req,res){
    try{
    let data=req.query
    // const {userId,category,subCategory}=data
    if(!data){
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

    module.exports={createBooks,getbooks,getBOOksBYQuery}




