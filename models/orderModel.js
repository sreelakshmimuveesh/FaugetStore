const mongoose = require('mongoose')

const checkoutSchema = mongoose.Schema({
    userID:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    product:[{
        productID:{
            type:mongoose.Types.ObjectId,
            ref:'Product'
        },
        price:{
            type:Number,
            required:true
        },
        quantity:{
            type:Number,
            required:true
        }
    }],
    address:[{
        addressID:{
            type:mongoose.Types.ObjectId,
            ref:'Address'
        }
        }],
    status:{
        type:String,
        default:'Order Placed'  
    },
    totalPrice:{
        type:Number,
        default:0,
    },
    createdAt:{
        type:Date,
        immutable:true,
        default:()=>Date.now()
    },
    paymentMethod:{
        type:String
    }
    
})
module.exports = mongoose.model('Order',checkoutSchema);