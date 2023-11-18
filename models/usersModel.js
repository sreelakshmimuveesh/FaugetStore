const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    name:{
        type:String,
       
    },
    email:{
        type:String,
        
    },
    password:{
        type:String,
       
        
    },
    phone:{
        type:Number,
        
    },
    is_verified: {
        type: Boolean,
        default: false
    },
   isBlocked:{
    type:Boolean,
    default:false
}, 
});
const Users=mongoose.model("users",userSchema);
module.exports={
    Users
}