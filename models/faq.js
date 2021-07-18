var mongoose = require('mongoose');

var faqSchema = new mongoose.Schema({
    question : String,
    answer   : String
})

module.exports  =new mongoose.model('faq' , faqSchema);