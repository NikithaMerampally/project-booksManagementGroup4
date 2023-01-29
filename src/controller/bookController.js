// ## GET /books/:bookId
const { isValidObjectId, default: mongoose } = require("mongoose");
const bookModel = require("../models/books");
const reviewModel=require("../models/review")
const validator=require("validator")
const moment=require("moment")
const createBooks=async (req,res)=>{
    try{

    let data=req.body
//-----------------------validating user id key  -------------------------------
if(!data.userId) return res.status(400).json({status:false,msg:"please provide userId"})
data.userId=data.userId.trim()
if(!isValidObjectId(data.userId)) return res.status(400).json({status:false,msg:"please provide valid userId"})

//------------------------------authorization--------------------------------------------------

let userId=data.userId;
let tokenId=req.decodedToken.userId
if(userId!=tokenId) return res.status(403).send({status:false,msg:"Not authorized"})

    //---------------checking mandatory keys are provided or not--------------------
    if(!data.title) return res.status(400).json({status:false,msg:"please provide title"})
    data.title=data.title.toLowerCase().trim() 
    if(!data.excerpt) return res.status(400).json({status:false,msg:"please provide excerpt"})
    data.excerpt=data.excerpt.trim()
    if(data.excerpt==="") return res.status(400).send({status:false,msg:"please provide content in excerpt"})
    if(!data.userId) return res.status(400).json({status:false,msg:"please provide userId"})
    data.userId=data.userId.trim()


    if(!data.ISBN) return res.status(400).json({status:false,msg:"please provide ISBN"})
      
    data.ISBN=data.ISBN.trim()

    if(!data.category) return res.status(400).json({status:false,msg:"please provide category"})
    data.category=data.category.trim()

    if(!data.subcategory) return res.status(400).json({status:false,msg:"please provide subcatogory"})
    data.subcategory=data.subcategory.trim()

    
    //----------------------validating format of relseaed at key-------------------------------------
    if(!data.releasedAt) return res.status(400).send({status:false,message:"releasedAt is a mendatory field"})
   
   if((moment(data.releasedAt).format("YYYY-MM-DD"))!=data.releasedAt) return res.status(400).send({status:false,msg:"Enter date in YYYY-MM-DD"})
   
    
    //-----------------------------validating ISBN----------------------
    let regexForIsbn=/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
    if (! regexForIsbn.test(data.ISBN)) {
    return res.status(400).send({status:false,msg:`The ISBN ${data.ISBN} is Not valid.`});
    } 
    //---------------validating title excerpt category subcategory--------------------------
    
    if(validator.isNumeric(data.title)) return res.status(400).send({status:false,msg:"Book title cannot be numbers only"})

    if(validator.isNumeric(data.excerpt)) return res.status(400).send({status:false,msg:"Book excerpt cannot be numbers only"})
    if(!validator.isAlpha(data.category,'en-US',{ignore:"-' "})) return res.status(400).send({status:false,msg:"Book categories should be have alphabets only you can use (-,')"})

    if(!validator.isAlpha(data.subcategory,'en-US',{ignore:"-', "})) return res.status(400).send({status:false,msg:"Book subcategory should be string only you can use (-,')"})

    //-----------------checking duplicay of title and ISBN----------------------------------------------------
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

    //-------------------------finally creating the book-----------------------------------------
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

//-----------getting books by query-------------------------------------------------------------
const getBOOksBYQuery=async function(req,res){
    try{
    let data=req.query
    // 
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
        if(!book) return res.status(404).json({status: false,msg: "book does not exists with thid Id"});
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
        return res.status(500).json({ status: false, msg: error });
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
        return res.status(404).send({msg:"book does not exists with thid Id"})
    }

    let obj={}
    
    ///------------checking types of  all the feilds--------------
    if(data.title){
        
        if(typeof(data.title)!="string"){
            return res.status(400).send({msg:"please Enter title in a string format"})
        }
        data.title=data.title.trim()

        if(validator.isNumeric(data.title)) return res.status(400).send({status:false,msg:"Book title cannot be numbers only"})
         
    }
    
    if(data.excerpt){
        if(typeof (data.excerpt) != "string"){
            return res.status(400).send({msg:"please Enter data.excerpt in a string format"})
        }
        data.excerpt=data.excerpt.trim()
        if(data.excerpt!="") obj.excerpt=data.excerpt  
    }
    
    if(data.ISBN){
        data.ISBN=data.ISBN.trim()
        if(typeof(data.ISBN) !="string"){
            return res.status(400).send({msg:"please Enter ISBN in a string format"})
        }
        let regexForIsbn=/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
        if (! regexForIsbn.test(data.ISBN)) {
        return res.status(400).send({status:false,msg:`The ISBN ${data.ISBN} is Not valid.`});
        } 
    }
    //------------validating relleasedAt key--------------------
    if(data.releasedAt){
    if((moment(data.releasedAt).format("YYYY-MM-DD"))!=data.releasedAt) return res.status(400).send({status:false,msg:"Enter date in YYYY-MM-DD"})
    obj.releasedAt=data.releasedAt
    }

    //-----------checking whether the title and ISBN is alreday present or not---------
    if(data.title){
        let booksData=await bookModel.findOne({title:data.title})
        if(booksData){
            return res.status(400).send({status:false,msg:"Book with this title already exists"})
        }

         obj.title=data.title

    }
    
    if(data.ISBN){
        let ISBNdata=await bookModel.findOne({ISBN:data.ISBN})
        if(ISBNdata){
            return res.status(400).send({status:false,msg:"Book with this ISBN already exists"})
        }
        obj.ISBN=data.ISBN

    }
    

let update=await bookModel.findOneAndUpdate(
    {_id:bookId,isDeleted:false},
    obj,{new:true})

    return res.status(200).send({status:true,data:update})
}

const deletedbyId=async function(req,res){
    try{
      let bookId=req.params.bookId;
      console.log(bookId)
    if(!isValidObjectId(bookId)){
        return res.status(400).send({msg:"Invalid bookId"})
    }
    //---------------if want the book data then do newtrue----------------------
     let deletedbybookid= await bookModel.findOneAndUpdate({_id:bookId, isDeleted:false},{isDeleted:true,DeletedAt:Date.now()})
     if(!deletedbybookid) 
     return res.status(404).send({status:false,msg:"no book document found"})
 
    return res.status(200).send({status:true,message:"Deleted successfully"})
 }catch(error){
    return res.status(500).send({status:false,error:error.message})
 }
 
 }



module.exports={createBooks,getbooks,getBOOksBYQuery,updateBook,deletedbyId}

