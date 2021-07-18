var mongoose                    = require('mongoose'),
    passportLocalMongoose       = require('passport-local-mongoose');

var AdminSchema = new mongoose.Schema({
    username        : String,
    email           : String,
    password        : String,
})

AdminSchema.plugin(passportLocalMongoose);
module.exports  =new mongoose.model('Admin' , AdminSchema);