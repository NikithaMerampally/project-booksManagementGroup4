const userModel = require("../models/user");
const validator = require("validator");
const jwt = require("jsonwebtoken")

const validateEmail = function(email) {
    var re = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}\b/;
    return re.test(email)
};

let object={}
let createUser = async (req, res) => {
    try{
    let data = req.body;
    if (Object.keys(data).length == 0)
        return res.status(400).send({ status: false, msg: "please provide fields" });
    if (!data.title) {
        return res.status(400).send({ status: false, msg: "please provide title" });
    }
    if (!["Mr", "Mrs", "Miss"].includes(data.title))
        return res.status(400).send({ status: false, msg: "title must be MR,MRS,MISS" });
        object.title=data.title

    if (!data.name) return res.status(400).send({ status: false, msg: "please provide name" });
    
        // name length discuss with group
        // more then 2 less then 20
    
    if (!validator.isAlpha(data.name,'en-US',{ignore:" "})) return res.status(400).send({ status: false, msg: "please provide valid name" });
       data.name=data.name.trim()//--------------------------------------
       object.name=data.name

if (!data.phone) {
    return res.status(400).send({ status: false, msg: "please provide phone" });
}
if (!/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(data.phone)) {
    //8880344456 918880344456  //+91 8880344456

    return res.status(400).send({ status: false, message: "Enter valid phone number" });
}

if (!data.email) return res.status(400).send({ status: false, msg: "please provide email" });//validate this


    data.email=data.email.trim()

    if(data.email=="") return res.status(400).send({status:false,msg:"please provide email"})

if (!validator.isEmail(data.email))
    return res.status(400).send({ status: false, msg: "please provide valid email" });

if (!data.password)
    return res.status(400).send({ status: false, msg: "please provide password" });
        
if (( data.password.length>=8&&data.password.length<= 15)) {
    if (!validator.isStrongPassword(data.password)) {
        return res.status(400).send({ status: false, msg: "please provide strong password" });
    }
} else {
    return res.status(400).send({ status: false, msg: "password must be of length 8-15" });
}
data.password=data.password.trim()
object.password=data.password//------------------------------


console.log(typeof data.address)
if(typeof data.address!="undefined"){
    if(typeof data.address !='object' ){
        return res.status(400).send({status:false,msg:"adress must be an object "})
    
    }

    
    if(data.address.street||data.address.street=="")
   {
       data.address.street=data.address.street.trim()
       if(data.address.street=="")
       {
           // return res.status(400).send({status:false,message:"street field cannot be empty if provided"})
           delete data.address["street"]
       }
   }
   if(data.address.city||data.address.city=="")
   {
       data.address.city=data.address.city.trim()
       if(data.address.city=="")
       {
           
           delete data.address["city"]
       }
   }
   if(data.address.pincode||data.address.pincode=="")
   {
      
       data.address.pincode=data.address.pincode.trim()
       if(data.address.pincode=="")
       {
         
           delete data.address["pincode"]
           
       }
        else if(!validator.isNumeric(data.address.pincode)||data.address.pincode.length!=6)
        {
           return res.status(400).send({status:false,message:"make sure pincode should be numeric only and 6 digit number"})
        }
   
   }
   object.address=data.address
   }

data.email=data.email.toLowerCase()
let checkDuplicate=await userModel.find({$or:[{email: data.email},{phone: data.phone}]})

if(checkDuplicate.length>=1)
{
    if(data.email.toLowerCase()==checkDuplicate[0].email)
    {
        return res.status(400).send({ status: false, msg: "email is already in use" })
    }
    else{
        return res.status(400).send({ status: false, msg: "Phone is already in use" });
    }
}
object.email=data.email
object.phone=data.phone
object.title=data.title



let user = await userModel.create(object);

res.status(201).send({ status: true, data: user });
    }
    catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
   
}


const loginuser= async function(req,res){

    try{
        let data= req.body
    let{email,password}=data
    if (Object.keys(data).length == 0)
    return res.status(400).send({ status: false, msg: "please provide fields" });

    if (!email)
    return res.status(400).send({ status: false, msg: "please provide email" });

    if (!password) 
    return res.status(400).send({ status: false, msg: "please provide password" });
    
    email=email.trim()
    if (!validator.isEmail(email))
    return res.status(400).send({ status: false, msg: "please provide valid email" });
    
    
    let userdata= await userModel.findOne({email:email}) // removed password directly
    if(!userdata) return res.status(404).send({status:false,msg:"no user found with this email"})//-----------------------
    // for proper message to the user
    if(userdata){
        if(password!=userdata.password)
        {
            return res.status(401).send({status:false,msg:"incorrect password"})
        }
    }
    let token = jwt.sign({userId:userdata._id.toString(),emailId:userdata.email},"group4californium",{expiresIn:"1h"})
     res.setHeader("x-api-key",token)
   return  res.status(200).send({status:true,msg:"Token is generated",data:token})
    }catch(error){
        
        return res.status(500).send({status:false,error:error.message})
}
}







module.exports = { createUser,loginuser };
