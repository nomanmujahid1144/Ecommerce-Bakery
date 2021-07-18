var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
    title : String,
    price : Number,
    productCode : String,
    Image : String,
    totalproducts : Number,
    description : String,
    category : String
})

module.exports  =new mongoose.model('items' , itemSchema);