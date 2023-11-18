const mongoose = require('mongoose')

const addressSchema = mongoose.Schema({
    productID:{
        type:mongoose.Types.ObjectId,
        ref:'Product'
    },
    userID:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    address:[{address1:{
            type:String,
            required:true
        },
        country:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        zip:{
            type:Number,
            required:true
        }
    }]
});


module.exports= mongoose.model('Address', addressSchema)