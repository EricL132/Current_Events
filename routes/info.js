const unfurl = require('unfurl.js').unfurl;
const jwt_decode = require('jwt-decode');
const router = require('express').Router();
const articlesSchema = require('../models/articles')
const querystring = require('querystring')
const fetch = require('node-fetch')
const fs = require('fs');
const ytdl = require('ytdl-core');
const { google } = require('googleapis');
const path = require('path');
const multer = require('multer');
const user = require('../models/user');
const { editPostValidation } = require('./validations');
const crypto = require('crypto')
const streamifier = require('streamifier');

//Authentication for Google Console API
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.googleEmail,
        private_key: process.env.googleKey.replace(/\\n/g, '\n')
    },
    scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.appdata']
});



//Logs into service agent google drive
const drive = google.drive({
    version: "v3",
    auth: auth
})

/* 

const multerstorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)
    }

}) */

/* var upload = multer({ storage: multerstorage }) */

//GET route to get all articles
router.get('/articles', async (req, res) => {

    /* let articlesList = await Promise.all(keywords.map(async (word) => {

        const articleTopic = await articlesSchema.find({ topic: word })
        return articleTopic
    })) */
    let map = new Map()
    let articleTopic = await articlesSchema.find({})
    await Promise.all(articleTopic.map((article) => {
        if (map.has(article.topic)) {
            map.set(article.topic, [...map.get(article.topic), article])
        } else {
            map.set(article.topic, [article])
        }
    }))
    const mapVals = []
    for (const [k, v] of map) {
        mapVals.push(v)
    }
    if (mapVals) return res.status(200).send({ articles: mapVals })
})








//Saves youtube video to drive
async function saveToDrive(link) {
    //Looks for existing file name from drive
    const b = await drive.files.list({
        q: `name="${link}"`
    })
    //removes the file if it exists
    if (b.data.files[0]) {
        await drive.files.delete({
            fileId: b.data.files[0].id
        })
    }

    //Creates new file to saves to drive
    const res = await drive.files.create({
        requestBody: {
            parents: ["11_ChHCDC7ZNM01ZNgNQDZ5A-8qVu9iA3"],
            name: link,
        },
        media: {
            mimeType: 'video/mp4',
            body: fs.createReadStream(path.join(__dirname, '../video.mp4'))
        }
    })
    fs.unlink(path.join(__dirname, '../video.mp4'), (err) => { })
    return res.data.id
    //Deletes the file from server after save to drive




}
"https://project490.herokuapp.com/createbackupvid"


//POST request to save a video to drive
router.post('/createbackupvid', async (req, res) => {
    //Checks if admin
    const userInfo = await checkLogin(req)
    if (userInfo.admin === false && userInfo.subadmin === false) return res.status(400).send({ "status": "Admin privileges required to save videos" })
    try {
        //Downloads youtube video to server
        ytdl(`https://www.youtube.com/watch?v=${req.body.link}`).pipe(fs.createWriteStream('video.mp4').on('finish', async () => {
            const link = await saveToDrive(req.body.link)
            return res.status(200).send({ link: link })
        }))

    } catch (err) {
        return res.status(400).send({ msg: "Video not found" })
    }
})



//GET route to get specific article from database
router.get('/findarticle', async (req, res) => {
    //Parses query string
    const param = querystring.parse(req._parsedOriginalUrl.query)
    const article = await articlesSchema.findOne({ _id: param.id })
    if (!article) return res.status(400).end()
    return res.status(200).send({ article: article })
})

//POST route to create new article
router.post('/createarticle', async (req, res) => {
    const userInfo = await checkLogin(req)
    if (!userInfo) return res.status(403).send({ "status": "Unauthorized" })
    const findUser = await user.findOne({ email: userInfo.email })
    const newInfo = req.body
    const imageCheck = await fetch(newInfo.urlToImage)
    if (imageCheck.headers.get("content-type").includes("image")) {
        const date = new Date()
        newInfo.userID = findUser._id
        newInfo.author = findUser.first + " " + findUser.last
        newInfo.publishedAt = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
        const newArticle = new articlesSchema(newInfo)
        await newArticle.save()
        res.status(200).end()
    } else {
        res.status(400).send("Invalid image")
    }


})


//Function to check if user info
async function checkLogin(req) {
    const checkadmin = await fetch(`http://${req.headers.host}/user/account/access`, { method: 'GET', headers: { 'cookie': 'jwt=' + req.cookies.jwt, 'access-token': 'none' } })
    try {
        var decoded = jwt_decode(checkadmin.headers.get('access-token'));
        return decoded
    } catch (err) {
        return false
    }


}

//Delete all files from google drive
async function deleteAll() {
    const b = await drive.files.list({})
    b.data.files.map(async (file) => {
        await drive.files.delete({
            fileId: file.id
        })
    })
}


//POST route to add comment to article
router.post('/addComment', async (req, res) => {
    //Checks if user is logged in
    const loggedin = await checkLogin(req)
    if (!loggedin) res.status(400).end()
    //Looks for the article to add into
    let article = await articlesSchema.findOne({ _id: req.body.article._id })
    if (article.comments) {
        article.comments = [...article.comments, { name: loggedin, comment: req.body.comment }]
    } else {
        article.comments = [{ name: loggedin, comment: req.body.comment }]
    }
    //Saves to article
    await article.save()
    res.status(200).end()
})

/* router.get('/pagesettings',async(req,res)=>{
    const settings = await settingSchema.find({})
    res.status(200).send({settings:settings[0]})

}) */

/* router.post('/adminchange',async(req,res)=>{
    const checkadmin = await fetch(`http://${req.headers.host}/user/account/access`,{method:'GET',headers: {'cookie':'jwt='+req.cookies.jwt, 'access-token': 'none' }})
    var decoded = jwt_decode(checkadmin.headers.get('access-token'));
    if(decoded.admin!==true) res.status(400).end()
    await settingSchema.findOneAndReplace({},{column:req.body.column})
    res.status(200).end()
})
 */


router.post('/saveimage', async (req, res) => {

    fetch(req.query.image).then((res) => res.blob()).then(async (data) => {
        const arrB = Buffer.from(await data.arrayBuffer())
        const randomString = Date.now() + crypto.randomBytes(16).toString('hex')
        try {
            const saveDrive = await drive.files.create({
                requestBody: {
                    parents: ["11_ChHCDC7ZNM01ZNgNQDZ5A-8qVu9iA3"],
                    name: randomString
                },
                media: {
                    mimeType: 'image/png',
                    body: streamifier.createReadStream(arrB)
                }
            })
            res.send({ imagelink: saveDrive.data.id })
        } catch (err) {
            console.log(err)
            res.status(400).send({ "status": "Failed to save image" })
        }



    })



})






router.get('/myarticles', async (req, res) => {
    const userInfo = await checkLogin(req)
    if (!userInfo) return res.status(403).send({ "status": "Unauthorized" })
    const findUser = await user.findOne({ email: userInfo.email })
    if (!findUser) return res.status(400).send({ "status": "Unable to find user" })
    let articles = []
    if (findUser.admin) {
        articles = await articlesSchema.find({})
    } else {
        articles = await articlesSchema.find({ userID: findUser._id })

    }
    return res.status(200).send({ articles: articles })

})



router.post('/editpost', async (req, res) => {
    const form = req.body.formInfo
    const { error } = editPostValidation(form)
    if (error) return res.status(400).send({ "status": "Invalid form" })
    const userInfo = await checkLogin(req)
    if (!userInfo) return res.status(403).send({ "status": "unauthorized" })
    const articleToEdit = await articlesSchema.findOne({ _id: form.article })
    if (!articleToEdit) return res.status(400).send({ "status": "Unable to find article" })
    const findUser = await user.findOne({ _id: articleToEdit.userID })
    if (!userInfo.admin && !userInfo.subadmin) {
        if (!findUser) return res.status(400).send({ "status": "Unauthorized" })
    }
    for (const [key, value] of Object.entries(form)) {
        if (value != "") {
            articleToEdit[key] = value;
        }
    }
    const date = new Date()
    articleToEdit.editDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    await articleToEdit.save()
    return res.status(200).end()

})

router.put('/deletepost', async (req, res) => {
    console.log(req.body)
    const articleID = req.body.articleID
    if (!articleID) return res.status(400).send({ "status": "Couldn't find article" })
    const userInfo = await checkLogin(req)
    if (!userInfo) return res.status(403).send({ "status": "unauthorized" })
    const articleToEdit = await articlesSchema.findOne({ _id: articleID })
    if (!articleToEdit) return res.status(400).send({ "status": "Unable to find article" })
    const findUser = await user.findOne({ _id: articleToEdit.userID })
    if (!userInfo.admin && !userInfo.subadmin) {
        if (!findUser) return res.status(400).send({ "status": "Unauthorized" })
    }
    await articleToEdit.delete()
    return res.status(200).end()

})

router.get('/siteimage', async (req, res) => {
    const result = await unfurl(req.query.site)
    res.send(result)
})

module.exports = router


