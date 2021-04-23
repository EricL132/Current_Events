//const router = require('express').Router()
//var cron = require('node-cron');
const NewsAPI = require('newsapi');
const articleSchema = require('./models/articles');
const dotenv = require('dotenv')
dotenv.config()
const newsapi = new NewsAPI(process.env.newsKEY2);
const mongoose = require('mongoose')
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connection.once('open', () => { console.log('MongoDB Connected'); });
mongoose.connection.on('error', (err) => { console.log('MongoDB connection error: ', err); });

const keywords = ["business", "entertainment", "general", "health", "science", "sports", "technology", "bitcoin", "apple", "google", "amazon", "us"]


//gets the news from google api and adds to database
function getNews(keyword) {
    return new Promise(async (resolve) => {
        //Gets dates from yesterday-today
        const today = new Date().toJSON().split("T")[0]
        let yesterday = new Date()
        yesterday = yesterday.setDate(yesterday.getDate() - 1)

        //Request to api for news
        await newsapi.v2.everything({
            q: keyword,
            from: yesterday,
            to:today 
        }).then(response => {
            try {
                //goes through returned data   
                response.articles.map(async (article) => {
                    //checks if theres an article and checks if its new
                    if (article.description && await checkIfNew(article)) {
                        //changes publishdAt
                        const publishedA = article.publishedAt.split("T")[0]
                        //article schema to add to database
                        const a = new articleSchema({
                            author: article.author,
                            title: article.title,
                            description: article.description,
                            url: article.url,
                            urlToImage: article.urlToImage,
                            publishedAt: publishedA,
                            content: article.content,
                            topic: keyword,
                        })
                        //saves to databse
                        await a.save();
                    }
                    return resolve()
                })
            } catch (err) {
                console.log(err)
            }
        });
    })

}


//Gets news from each keyword in keywords
async function getnewNewsFunc() {
   for (let words of keywords) {
        await getNews(words)
    } 

}

/* async function deleteAll(){
    await articleSchema.remove({})
}

deleteAll() */
//Checks if news are new
function checkIfNew(article) {
    return new Promise(async (resolve) => {
        const articleFound = await articleSchema.findOne({ title: article.title })
        if (articleFound) {
            return resolve(false)
        } else {
            return resolve(true)
        }

    })
}

getnewNewsFunc()