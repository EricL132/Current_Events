const mongoose = require('mongoose')

const articlesSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true
    },
    image:{
        type:String,
        required:false
    }
})
// newsapi ad70d5a6b15a41be91901d72899fef58 

module.exports = mongoose.model('articles',articlesSchema)