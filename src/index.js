const express=require('express')
const app=express()
const route=require('./route/route')
const mongoose=require('mongoose')
app.use(express.json())
mongoose.connect("mongodb+srv://Vishanksingh:7997@cluster0.ga4iiwd.mongodb.net/Ankush1234-DB?retryWrites=true&w=majority",{dbName:"group4Database"},{useNewUrlParser:true}).then(()=>{console.log("mongoDb connected")}).catch((error)=>{console.log(error.message)})

app.use('/',route)

app.listen(3000,()=>{
    console.log("app is running on port 3000")
})


