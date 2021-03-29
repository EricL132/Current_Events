const jwt_decode = require('jwt-decode');
const router = require('express').Router();
const articlesSchema = require('../models/articles')
const querystring = require('querystring')
const fetch = require('node-fetch')
const fs = require('fs');
const ytdl = require('ytdl-core');
const { google } = require('googleapis');
const path = require('path');
router.get('/articles', async (req, res) => {
    const articles = await articlesSchema.find({})
    if (articles) return res.status(200).send({ articles: articles })
})


//download youtube with     ytdl('http://www.youtube.com/watch?v=aqz-KE-bpKQ').pipe(fs.createWriteStream('video.mp4'));

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.googleEmail,
        private_key: process.env.googleKey.replace(/\\n/g, '\n')
    },
    scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.appdata']
});


const drive = google.drive({
    version: "v3",
    auth: auth
})



async function saveToDrive(link) {
    const b = await drive.files.list({
        q: `name="${link}"`
    })
    if (b.data.files[0]) {
        await drive.files.delete({
            fileId: b.data.files[0].id
        })
    }


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



}




router.post('/createbackupvid', async (req, res) => {
    const adminCheck = await checkAdmin(req)
    if (adminCheck === false) return res.status(400).end()
    try {
        ytdl(`https://www.youtube.com/watch?v=${req.body.link}`).pipe(fs.createWriteStream('video.mp4').on('finish', async () => {
            const link = await saveToDrive(req.body.link)
            return res.status(200).send({ link: link })
        }))

    } catch (err) {
        console.log(err)
        return res.status(400).send({ msg: "Video not found" })
    }
})

router.get('/findarticle', async (req, res) => {

    const param = querystring.parse(req._parsedOriginalUrl.query)

    const article = await articlesSchema.findOne({ title: param.title })
    if (!article) return res.status(400).end()
    return res.status(200).send({ article: article })
})


router.post('/createarticle', async (req, res) => {
    const adminCheck = checkAdmin(req)
    if (adminCheck === false) return res.status(400).end()
    const newInfo = req.body
    const date = new Date()
    newInfo.publishedAt = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

    const newArticle = new articlesSchema(newInfo)
    await newArticle.save()
    res.status(200).end()

})

async function checkAdmin(req) {
    const checkadmin = await fetch(`http://${req.headers.host}/user/account/access`, { method: 'GET', headers: { 'cookie': 'jwt=' + req.cookies.jwt, 'access-token': 'none' } })
    var decoded = jwt_decode(checkadmin.headers.get('access-token'));
    return decoded.admin
}
async function checkLogin(req) {
    const checkadmin = await fetch(`http://${req.headers.host}/user/account/access`, { method: 'GET', headers: { 'cookie': 'jwt=' + req.cookies.jwt, 'access-token': 'none' } })
    var decoded = jwt_decode(checkadmin.headers.get('access-token'));
    return decoded.name
}

async function deleteAll() {
    const b = await drive.files.list({})
    console.log(b)
    /*     b.data.files.map(async (file) => {
            await drive.files.delete({
                fileId: file.id
            })
        }) */
}


router.post('/addComment', async (req, res) => {
    const loggedin = await checkLogin(req)
    if (!loggedin) res.status(400).end()

    let article = await articlesSchema.findOne({ _id: req.body.article._id })
    if (article.comments) {
        article.comments = [...article.comments, { name: loggedin, comment: req.body.comment }]
    } else {
        article.comments = [{ name: loggedin, comment: req.body.comment }]
    }

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
module.exports = router