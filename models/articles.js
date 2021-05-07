const mongoose = require('mongoose')


//Article schema for news articles
const articlesSchema = new mongoose.Schema({
    title:{
        type:String,
    },
    author:{
        type:String,
    },
    description:{
        type:String,
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
    },
    content:{
        type:String,
    },
    topic:{
        type:String,
    },
    comments:{
        type:Array
    },
    userID:{
        type:String,
    },
    editDate:{
        type:String
    },
    
})
// newsapi ad70d5a6b15a41be91901d72899fef58 

module.exports = mongoose.model('articles',articlesSchema)