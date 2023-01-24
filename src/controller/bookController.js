// ## GET /books/:bookId
const { isValidObjectId, default: mongoose } = require("mongoose");
const bookModel = require("../models/books");
const reviewModel=require("../models/review")
const createBooks=async (req,res)=>{
    try{

    let data=req.body

    if(!data.title) return res.status(400).json({status:false,msg:"please provide title"})
    data.title=data.title.trim()

    if(!data.excerpt) return res.status(400).json({status:false,msg:"please provide excerpt"})
    data.excerpt=data.excerpt.trim()

    if(!data.userId) return res.status(400).json({status:false,msg:"please provide userId"})
    data.userId=data.userId.trim()


    if(!data.ISBN) return res.status(400).json({status:false,msg:"please provide ISBN"})
      
    data.ISBN=data.ISBN.trim()

    if(!data.category) return res.status(400).json({status:false,msg:"please provide category"})
    data.category=data.category.trim()

    if(!data.subcategory) return res.status(400).json({status:false,msg:"please provide subcatogory"})
    data.subcategory=data.subcategory.trim()

    //----------validating ISBN----------------------
    let regexForIsbn=/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
    if (! regexForIsbn.test(data.ISBN)) {
    return res.status(400).send({status:false,msg:`The ISBN ${data.ISBN} is Not valid.`});
    } 
    //---------------validating title--------------------------
    let regextitle=/^[a-zA-Z]{4,}(?: [a-zA-Z]+){0,2}$/
    if(!regextitle.test(data.title)) return res.status(400).send({status:false,msg:"Title should have alphabets also"})
    // Duplicacy check
    let checkTitle=await bookModel.findOne({title:data.title})
    if(checkTitle) return res.status(400).send({status:false,msg:"Book with this title already exist"})
    
    let checkISBN=await bookModel.findOne({ISBN:data.ISBN})
    if(checkISBN)  return res.status(400).send({status:false,msg:"Book with this ISBN already exist"})
    
     //------------------authorization----------------------------------
    let userId=data.userId;
    let tokenId=req.decodedToken.userId
    if(userId!=tokenId) return res.status(403).send({status:false,msg:"Not authorized"})


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
        let book = await bookModel.findById(bookId);
        if(!book) return res.status(200).json({status: false,msg: "bookID does not exist"});
        let  review=await reviewModel.find({bookId:bookId})
        
        
        let finalData={
            _id:book._id,
            title:book.title,
            excerpt:book.excerpt,
            userId:book.userId,
            ISBN:book.ISBN,
            category:book.category,
            subcategory:book.subcategory,
            reviews:book.reviews,
            isDeleted:book.isDeleted,
            releasedAt:book.releasedAt,
            createdAt:book.createdAt,
            updatedAt:book.updatedAt,
            reviewsData:review,
            
            
        }
            
        console.log(book)
        return res.status(200).json({ status: true, data: finalData});

    } catch (error) {
        res.status(500).json({ status: false, msg: error });
    }
};

const getBOOksBYQuery=async function(req,res){
    try{
    let data=req.query
    
    if(Object.keys(data).length==0){
        let Allbooksdata=await bookModel.find({isDeleted:false}).select({ISBN:0,subcategory:0,deletedAt:0,isDeleted:0,createdAt:0,updatedAt:0}).sort({title:1})
        return res.status(200).send({status:true,data:Allbooksdata})
    }
    else{
    if(data.userId){
        if(!isValidObjectId(data.userId)) {
            return res.status(400).send({status :false , msg: "Enter A Valid userid" })
        }

    }
    
    let book=await bookModel.find({isDeleted:false,...data}).select({ISBN:0,deletedAt:0,isDeleted:0,createdAt:0,updatedAt:0}).sort({title:1})
    
    if(book.length==0) return res.status(404).send({status:false,msg:"books are not found"})
    const userIdofToken=req.decodedToken.userId
    
    const  userId=book[0].userId
    console.log(userId)
    console.log(userIdofToken)
    if(userIdofToken.toString()!=userId.toString()) {
        return res.status(403).send({status:false,msg:"you are not authorized"})
    }
    return res.status(200).send({status:true,data:book})
    }
    }catch (err) {
    res.status(500).send({ status: false, msg: err.message });
    }
}


//---------------------updating books---------------------------------
const updateBook=async function(req,res){
    let bookId=req.params.bookId
    let data=req.body
    if(Object.keys(data).length==0){
        return res.status(400).send({status:false,msg:"provide data in body to update"})

    }

    if(!isValidObjectId(bookId)){
        return res.status(400).send({msg:"Invalid bookId"})
    }
    let checkBook=await bookModel.findOne({_id:bookId})
    if(!checkBook){
        return res.status(400).send({msg:"This book does not exist"})
    }

    
    let title=data.title
    let excerpt=data.excerpt
    let releasedAt=data.releasedAt

    
    let ISBN=data.ISBN
    ///------------checking types of  all the feilds--------------
    if(title){
        if(typeof(title)!="string"){
            return res.status(400).send({msg:"please Enter title in a string format"})
        }
    }
    if(excerpt){
        if(typeof (excerpt) != "string"){
            return res.status(400).send({msg:"please Enter excerpt in a string format"})
        }
    }
    
    if(ISBN){
        if(typeof(ISBN) !="string"){
            return res.status(400).send({msg:"please Enter ISBN in a string format"})
        }
    }

    //-----------checking whether the title and ISBN is alreday present or not---------
    if(title){
        let booksData=await bookModel.findOne({title:title})
        if(booksData){
            return res.status(400).send({status:false,msg:"Book with this title already exists"})
        }
    }
    
    if(ISBN){
        let ISBNdata=await bookModel.findOne({ISBN:ISBN})
        if(ISBNdata){
            return res.status(400).send({status:false,msg:"Book with this ISBN already exists"})
        }
    }
    
   //let formattedDate=moment().format("YYYY, MM, DD");
   let update=await bookModel.findOneAndUpdate(
    {_id:bookId,isDeleted:false},
    {title:title,ISBN:ISBN,excerpt:excerpt,releasedAt:releasedAt},
    {new:true})

    return res.status(200).send({status:true,data:update})
}

const deletedbyId=async function(req,res){
    try{
      let bookId=req.params.bookId;
      console.log(bookId)
    if(!isValidObjectId(bookId)){
        return res.status(400).send({msg:"Invalid bookId"})
    }
     let deletedbybookid= await bookModel.findOneAndUpdate({_id:bookId, isDeleted:false},{isDeleted:true,DeletedAt:Date.now()},{new:true})
     if(!deletedbybookid) 
     return res.status(404).send({status:false,msg:"no book document found"})
 
    return res.status(200).send({status:true,data:deletedbybookid})
 }catch(error){
    return res.status(500).send({status:false,error:error.message})
 }
 
 }



module.exports={createBooks,getbooks,getBOOksBYQuery,updateBook,deletedbyId}

    