var mongoose                    = require('mongoose'),
    passportLocalMongoose       = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
    
    username        : String,
    email           : String,
    password        : String,
    address         : String,
    phoneno         : Number,
})

UserSchema.plugin(passportLocalMongoose);
module.exports  =new mongoose.model('User' , UserSchema);