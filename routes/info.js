const router = require('express').Router();
const articlesSchema = require('../models/articles')

router.get('/articles',async (req,res)=>{
    const articles = await articlesSchema.find({})
    if(articles) return res.status(200).send({articles:articles})
})



module.exports = router