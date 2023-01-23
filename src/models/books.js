const mongoose=require('mongoose')
const bookSchema=new mongoose.Schema({
    title: { type:string, required:true, unique:true },
    excerpt: { type:string, required:true },
    userId: {type: mongoose.Schema.Types.ObjectId, required:true, ref:"user" },
    ISBN: { type:string, required:true , unique },
    category: { type:string, required:true  },
    subcategory: { type:string, required:true  },
    reviews:
        { type:Number, default: 0 },
    deletedAt: { type:Date },
    isDeleted: {type: Boolean, default: false },
    releasedAt: { type:Date, required:true  }
    
    

},{timestamps:true})

module.exports=mongoose.model("books",bookSchema)