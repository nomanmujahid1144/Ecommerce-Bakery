var mongoose = require('mongoose');

var OrderSchema = new mongoose.Schema({
    user : { 
        username        : String,
        email           : String,
        address         : String,
        phoneno         : Number,
    },
    cart : {
        products : [],
        totalPrice : Number,
        totalQty : Number
       
        }
})

module.exports  =new mongoose.model('Order' , OrderSchema);