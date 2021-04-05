//const router = require('express').Router()
//var cron = require('node-cron');
const NewsAPI = require('newsapi');
const articleSchema = require('./models/articles');
const dotenv = require('dotenv')
dotenv.config()
const newsapi = new NewsAPI(process.env.newsKEY2);
const mongoose  = require('mongoose')
mongoose.connect(process.env.DB_CONNECT,{useNewUrlParser:true,useUnifiedTopology:true})
mongoose.connection.once('open', () => { console.log('MongoDB Connected'); });
mongoose.connection.on('error', (err) => { console.log('MongoDB connection error: ', err); }); 

const keywords = ["business","entertainment","general","health","science","sports","technology","bitcoin","apple","google","amazon","us"]

function getNews(keyword){
    return new Promise(async(resolve)=>{
        const today = new Date().toJSON().split("T")[0]
        let yesterday = new Date()
        yesterday = yesterday.setDate(yesterday.getDate()-1)
        await newsapi.v2.everything({
             q: keyword,
             from: yesterday,
             to: today,
     
           }).then(response => {
               try{
            
             response.articles.map(async (article)=>{
            
                 if(article.description && await checkIfNew(article) ){
                 const publishedA = article.publishedAt.split("T")[0]
                 const a = new articleSchema({
                     author:article.author,
                     title:article.title,
                     description:article.description,
                     url:article.url,
                     urlToImage:article.urlToImage,
                     publishedAt: publishedA,
                     content:article.content,
                     vid:'https://www.youtube.com/embed/kaGO-_GCwHk',
                     backupvid:'https://drive.google.com/file/d/1U0N635TIBrfEihgoZMyqWn7tDgrmeQEt/preview'
                     
                 })
                 await a.save();
                }
                 return resolve()
             })
            }catch(err){
                console.log(err)
            }
           });
    })

}

    
async function getnewNewsFunc(){
      for(let words of keywords){
         await getNews(words)
    } 
 
   /*  await articleSchema.remove({}) */
}
    


getnewNewsFunc()

function checkIfNew(article){
    return new Promise(async (resolve)=>{
        const articleFound = await articleSchema.findOne({title:article.title})
        console.log(article)
        if(articleFound) {
            return resolve(false)
        }else{
            return resolve(true)
        }
        
    })
}


//module.exports = router