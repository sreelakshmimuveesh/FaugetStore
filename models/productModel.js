const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    pname:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    pdesc:{
        type:String,
        required:true
    },
    pcat:{
        type:String,
        required:true
    },
    pimage:[{
        type:String,
        required:true
    }],
    pquantity:{
        type:String,
        required:true
    },
    qty:{
        type:Number,
        
    },
    isAvailable:{
        type:Number,
        default:0
    }
})
module.exports = mongoose.model('Product',productSchema)