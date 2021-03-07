const mongoose = require('mongoose')

const resetSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    token:{
        type:String,
        required:true
    },
    expiresAt:{type:Date,default:Date.now,index:{expires:86400000}}
})


module.exports = mongoose.model('resettokens',resetSchema)