const mongoose = require('mongoose')


//Article schema for news articles
const articlesSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    vid:{
        type:String
    },
    backupvid:{
        type:String
    },
    url:{
        type:String,
    },
    urlToImage:{
        type:String,
    },
    publishedAt:{
        type:String,
        required:true
    },
    content:{
        type:String,
    },
    comments:{
        type:Array
    }
})
// newsapi ad70d5a6b15a41be91901d72899fef58 

module.exports = mongoose.model('articles',articlesSchema)