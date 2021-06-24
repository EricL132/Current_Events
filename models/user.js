const mongoose = require('mongoose')

//user schema for users
const userSchema = new mongoose.Schema({
    first:{
        type:String,
        required:true
    },
    last:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    admin:{
        type:Boolean,
        required:false
    },
    subadmin:{
        type:Boolean,
        required:false
    }

})

module.exports = mongoose.model('users',userSchema)