// ## GET /books/:bookId
const { isValidObjectId, default: mongoose } = require("mongoose");
const bookModel = require("../models/books");
const reviewModel=require("../models/review")
const validator=require("validator")
const moment=require("moment")
const createBooks=async (req,res)=>{
    try{

    let data=req.body

//------------------authorization----------------------------------
let userId=data.userId.trim();
let tokenId=req.decodedToken.userId
if(userId!=tokenId) return res.status(403).send({status:false,msg:"Not authorized"})


    if(!data.title) return res.status(400).json({status:false,msg:"please provide title"})
    data.title=data.title.toLowerCase().trim()


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

    
    // check released date is given or not
    if(!data.releasedAt) return res.status(400).send({status:false,message:"releasedAt is a mendatory field"})
   
   if((moment(data.releasedAt).format("YYYY-MM-DD"))!=data.releasedAt) return res.status(400).send({status:false,msg:"Enter date in YYYY-MM-DD"})
   
    
    //----------validating ISBN----------------------
    let regexForIsbn=/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
    if (! regexForIsbn.test(data.ISBN)) {
    return res.status(400).send({status:false,msg:`The ISBN ${data.ISBN} is Not valid.`});
    } 
    //---------------numeric validating--------------------------
    // added
    if(validator.isNumeric(data.title)) return res.status(400).send({status:false,msg:"Book title cannot be numbers only"})

    if(validator.isNumeric(data.excerpt)) return res.status(400).send({status:false,msg:"Book excerpt cannot be numbers only"})
    if(!validator.isAlpha(data.category,'en-US',{ignore:"-' "})) return res.status(400).send({status:false,msg:"Book categories should be string only you can use (-,')"})

    if(!validator.isAlpha(data.subcategory,'en-US',{ignore:"-', "})) return res.status(400).send({status:false,msg:"Book subcategory should be string only you can use (-,')"})

    //----------------validating userId------------------------
    // newly added

    // Duplicacy check
    ///////////
    // optimising db calls
    let checkDuplicate=await bookModel.find({$or:[{title:data.title},{ISBN:data.ISBN}]})
    if(checkDuplicate.length>=1)
    {   
            if(data.title==checkDuplicate[0].title)
            {
                return res.status(400).send({status:false,msg:"Book with this title already exist"})

            }
            else{
                return res.status(400).send({status:false,msg:"Book with this ISBN already exist"})
            }
             
    }


  
    
     


    let createbook=await bookModel.create(data)
    let obj={
  _id:createbook._id,
  title:createbook.title,
  excerpt:createbook.excerpt,
  userId:createbook.userId,
  ISBN:createbook.ISBN,
  category:createbook.category,
  subcategory:createbook.subcategory,
  isDeleted:createbook.isDeleted,
  reviews:createbook.reviews,
  releasedAt:createbook.releasedAt,
  createdAt:createbook.createdAt,
  updatedAt:createbook.updatedAt


    }

    return res.status(201).send({status:true,data:obj})
    }
    catch(error)
    {
        return res.status(500).send({status:false,msg:error.message})
    }

}

const getBOOksBYQuery=async function(req,res){
    try{
    let data=req.query
    // removed __v:0 and added message:"book list" according to response
    if(Object.keys(data).length==0){
        let Allbooksdata=await bookModel.find({isDeleted:false}).select({ISBN:0,subcategory:0,deletedAt:0,isDeleted:0,createdAt:0,updatedAt:0,__v:0}).sort({title:1})
        return res.status(200).send({status:true, message: 'Books list',data:Allbooksdata})
    }
    else{
    if(data.userId){
        if(!isValidObjectId(data.userId)) {
            return res.status(400).send({status :false , msg: "Enter A Valid userid" })
        }

    }
    // __v added to ignore in response and message
    // confusion in subcatogory part we have to remove or not
    
    let book=await bookModel.find({isDeleted:false,...data}).select({ISBN:0,deletedAt:0,isDeleted:0,createdAt:0,updatedAt:0,__v:0}).sort({title:1})
    
    if(book.length==0) return res.status(404).send({status:false,msg:"no book found"})
    const userIdofToken=req.decodedToken.userId
    
    const  userId=book[0].userId
    if(userIdofToken.toString()!=userId.toString()) {
        return res.status(403).send({status:false,msg:"you are not authorized"})
    }
    return res.status(200).send({status:true,message: 'Books list',data:book})
    }
    }catch (err) {
    res.status(500).send({ status: false, msg: err.message });
    }
}


const getbooks = async (req, res) => {
    try {
        let bookId = req.params.bookId;
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({status: false,msg: "bookID is invalid enter valid id"});
        }
        // changed findById to findOne so that we can check isDeleted Key as well
        let book = await bookModel.findOne({_id:bookId,isDeleted:false});
        if(!book) return res.status(200).json({status: false,msg: "bookID does not exist"});
        let  review=await reviewModel.find({bookId:bookId,isDeleted:false})
        
        
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
            
        
        return res.status(200).json({ status: true, data: finalData});

    } catch (error) {
        res.status(500).json({ status: false, msg: error });
    }
};




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
    //------------validating relleasedAt key--------------------
    if(releasedAt){
    if((moment(releasedAt).format("YYYY-MM-DD"))!=releasedAt) return res.status(400).send({status:false,msg:"Enter date in YYYY-MM-DD"})
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

    