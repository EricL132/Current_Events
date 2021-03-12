const router = require('express').Router();
const articlesSchema = require('../models/articles')
const querystring = require('querystring')
router.get('/articles',async (req,res)=>{
    const articles = await articlesSchema.find({})
    if(articles) return res.status(200).send({articles:articles})
})

router.get('/findarticle',async (req,res)=>{
    const param =  querystring.parse(req._parsedOriginalUrl.query)

    const article = await articlesSchema.findOne({title:param.title})
    if(!article) return res.status(400).end()
    return res.status(200).send({article:article})
})


module.exports = router