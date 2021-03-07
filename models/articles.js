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


module.exports = mongoose.model('articles',articlesSchema)