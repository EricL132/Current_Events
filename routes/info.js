const jwt_decode = require('jwt-decode');
const router = require('express').Router();
const articlesSchema = require('../models/articles')
const settingSchema = require('../models/settings')
const querystring = require('querystring')
const fetch = require('node-fetch')
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


router.post('/createarticle',async (req,res)=>{
    const checkadmin = await fetch(`http://${req.headers.host}/user/account/access`,{method:'GET',headers: {'cookie':'jwt='+req.cookies.jwt, 'access-token': 'none' }})
    var decoded = jwt_decode(checkadmin.headers.get('access-token'));
    if(decoded.admin!==true) res.status(400).end()
    const newInfo = req.body
    const date = new Date()
    newInfo.publishedAt = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`

    const newArticle = new articlesSchema(newInfo)
    await newArticle.save()
    res.status(200).end() 

})


router.get('/pagesettings',async(req,res)=>{
    const settings = await settingSchema.find({})
    res.status(200).send({settings:settings[0]})

})

router.post('/adminchange',async(req,res)=>{
    const checkadmin = await fetch(`http://${req.headers.host}/user/account/access`,{method:'GET',headers: {'cookie':'jwt='+req.cookies.jwt, 'access-token': 'none' }})
    var decoded = jwt_decode(checkadmin.headers.get('access-token'));
    if(decoded.admin!==true) res.status(400).end()
    await settingSchema.findOneAndReplace({},{column:req.body.column})
    res.status(200).end()
})

module.exports = router