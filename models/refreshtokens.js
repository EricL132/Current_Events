const mongoose = require('mongoose')


//Refresh token schema for login 
const refreshSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    token:{
        type:String,
        required:true
    },
    expireAt: { type: Date, default: Date.now, index: { expires: 86400000 } }
})


module.exports = mongoose.model('refreshtokens',refreshSchema)