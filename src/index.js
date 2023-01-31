const express=require('express')
const app=express()
const route=require('./route/route')
const mongoose=require('mongoose')
//var cors = require('cors')
const multer=require('multer')
app.use(express.json())
mongoose.connect("mongodb+srv://Vishanksingh:7997@cluster0.ga4iiwd.mongodb.net/Ankush1234-DB?retryWrites=true&w=majority",{dbName:"group4Database"},{useNewUrlParser:true}).then(()=>{console.log("mongoDb connected")}).catch((error)=>{console.log(error.message)})
app.use(multer().any())
app.use('/',route)


app.listen(3000,()=>{
    console.log("app is running on port 3000")
})

//app.use(cors())


app.use((err, req, res, next) => {
    if (err.message === "Unexpected end of JSON input") {
      return res.status(400).send({status: false, message: "ERROR Parsing Data, Please Provide a Valid JSON",});
    } else {
      next()
    }
  })
