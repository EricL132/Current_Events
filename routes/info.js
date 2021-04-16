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
const keywords = ["", "business", "entertainment", "general", "health", "science", "sports", "technology", "bitcoin", "apple", "google", "amazon", "us"]

const multerstorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)
    }

})

var upload = multer({ storage: multerstorage })

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
            map.set(article.topic,[...map.get(article.topic),article])
        } else {
            map.set(article.topic, [article])
        }
    }))
    const mapVals = []
    for(const [k,v] of map){
        mapVals.push(v)
    }
    if (mapVals) return res.status(200).send({ articles:   mapVals })
})



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



//POST request to save a video to drive
router.post('/createbackupvid', async (req, res) => {
    //Checks if admin
    const adminCheck = await checkAdmin(req)
    if (adminCheck === false) return res.status(400).end()

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
    const article = await articlesSchema.findOne({ title: param.title })
    if (!article) return res.status(400).end()
    return res.status(200).send({ article: article })
})

//POST route to create new article
router.post('/createarticle', async (req, res) => {
    //Checks if admin
    const adminCheck = checkAdmin(req)
    if (adminCheck === false) return res.status(400).end()
    //New article info
    const newInfo = req.body
    //Gets current date
    const date = new Date()
    newInfo.publishedAt = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    //Saves new article to database
    let checkArticle = await articlesSchema.findOneAndUpdate({ title: req.body.title }, newInfo, { new: true, overwrite: true })

    if (!checkArticle) {
        const newArticle = new articlesSchema(newInfo)
        await newArticle.save()
    }


    res.status(200).end()

})

//Function to check if user is admin
async function checkAdmin(req) {
    const checkadmin = await fetch(`http://${req.headers.host}/user/account/access`, { method: 'GET', headers: { 'cookie': 'jwt=' + req.cookies.jwt, 'access-token': 'none' } })
    var decoded = jwt_decode(checkadmin.headers.get('access-token'));
    return decoded.admin
}
//Function to check if user is logged in
async function checkLogin(req) {
    const checkadmin = await fetch(`http://${req.headers.host}/user/account/access`, { method: 'GET', headers: { 'cookie': 'jwt=' + req.cookies.jwt, 'access-token': 'none' } })
    var decoded = jwt_decode(checkadmin.headers.get('access-token'));
    return decoded.name
}

//Delete all files from google drive
async function deleteAll() {
    const b = await drive.files.list({})
    console.log(b)
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

router.post('/saveimage', upload.single("file"), async (req, res) => {
    console.log(req.file.filename)
    const saveDrive = await drive.files.create({
        requestBody: {
            parents: ["11_ChHCDC7ZNM01ZNgNQDZ5A-8qVu9iA3"],
            name: req.file.filename
        },
        media: {
            mimeType: 'image/png',
            body: fs.createReadStream(path.join(__dirname, '../upload/' + req.file.filename))
        }
    })
    fs.unlink(path.join(__dirname, '../upload/' + req.file.filename), (err) => { })
    console.log(saveDrive.data.id)
    res.send({ imagelink: saveDrive.data.id })
})



router.post('/editpost', async (req, res) => {
    const adminCheck = await checkAdmin(req)
    if (adminCheck === false) return res.status(400).send({ errorMessage: "Not Admin" })

    const articleToEdit = await articlesSchema.findOne({ title: req.body.exacttitle })
    if (!articleToEdit) return res.status(400).send({ errormessage: "Article not found" })
    for (const [key, value] of Object.entries(req.body)) {
        if (value != "") {
            articleToEdit[key] = value;
        }
    }
    await articleToEdit.save()
    return res.status(200).end()

})
module.exports = router