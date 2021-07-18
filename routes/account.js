const router = require('express').Router();
const {registerValidation,loginValidation,resetpassValidation,resetpassConfirmValidation,changepassValidation} = require('./validations')
const User = require('../models/user')
const RefreshTokens = require('../models/refreshtokens')
const ResetTokens = require('../models/resettokens')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const fetch = require('node-fetch')
const crypto  = require('crypto')
const nodemailer = require('nodemailer')
const path = require('path');
const querystring = require('querystring')
const jwt_decode = require('jwt-decode');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;


//POST route to register account
router.post('/register',async (req,res)=>{
    const {error} = registerValidation(req.body)
    if(error) return res.status(400).send({status:error.details[0].message})
    const email = req.body.email.toLowerCase()
    const first = req.body.first.charAt(0).toUpperCase() + req.body.first.slice(1)
    const last = req.body.last.charAt(0).toUpperCase() + req.body.last.slice(1)
    const user = await User.findOne({email:email})
    if(user) return res.status(400).send({status:"Email already exists"})
    const salt = await bcrypt.genSalt(15)
    const hashPassword = await bcrypt.hash(req.body.password,salt)
    const newUser = new User({
        first:first,
        last:last,
        email:email,
        password:hashPassword
    })
    await newUser.save()
    const resLogin = await fetch(`http://${req.headers.host}/user/account/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: newUser.email, password: req.body.password}) })
    res.cookie("jwt", resLogin.headers.get('set-cookie').split("=")[1].split(";")[0], {
        expires: new Date(Date.now() + 86400000),
        httpOnly: true
    })
    return res.status(200).send({ status: 'created' })


})

//POST route to login
router.post('/login', async (req,res)=>{
    const {error} = loginValidation(req.body)
    if(error) return res.status(400).send({status:error.details[0].message})
    const email = req.body.email.toLowerCase()
    const user = await User.findOne({email}) 
    if(!user) return res.status(400).send({status:"Email not registered"})
    const validPassword = await bcrypt.compare(req.body.password,user.password)
    if(!validPassword) return res.status(400).send({status:"Invalid password"})

    const token = jwt.sign({email:user.email,name:user.first},process.env.ACCESS_TOKEN,{expiresIn:'1m'})
    const refreshToken = jwt.sign({email:user.email,name:user.first},process.env.REFRESH_TOKEN)
    const foundRefresh = await RefreshTokens.findOne({email:email})
    if(!foundRefresh){
        const newRefreshToken = new RefreshTokens({
            email:email,
            token:refreshToken
        })
        await newRefreshToken.save()
    }else{
        await RefreshTokens.findOneAndReplace({email:email},{email:email,token:refreshToken})
    }
    res.cookie("jwt", refreshToken, {
        expires: new Date(Date.now() + 86400000),
        httpOnly: true
    })

  
    return res.header('access-token', token).send({email:user.email,name:user.first,admin:user.admin,accessToken: token })

    

})

//GET route to check for access
router.get('/access',authenticationToken,async(req,res)=>{
    res.status(200).header('access-token',req.accessToken.accessToken).end()
})

//Validates authentication token
function authenticationToken(req,res,next){
    const tokenHeader =req.headers['access-token']
    if(!tokenHeader) return res.status(400).end()
    jwt.verify(tokenHeader,process.env.ACCESS_TOKEN,async (err)=>{
        if(err){
            if(req.cookies.jwt){
                const newToken = await fetch(`http://${req.headers.host}/user/account/refreshaccess`,{method:"POST",headers:{"Content-Type":'application/json'},body:JSON.stringify({token:req.cookies.jwt})})

                if(newToken.status!==200) return res.status(400).end()
                
                const accessToken = await newToken.json()
                req.accessToken = accessToken
                next()
            }else{
                res.status(400).end()
            }
        }
    })
}

//Returns new access token
router.post('/refreshaccess',async(req,res)=>{
    const refreshToken = req.body.token
    if(!refreshToken) return res.status(400).end()
    const userRefresh = await RefreshTokens.findOne({token:refreshToken})
    if(!userRefresh) return res.status(400).end()
   
    jwt.verify(refreshToken,process.env.REFRESH_TOKEN, async (err,user)=>{
        if(err) return res.status(400).end()
        const checkuser = await User.findOne({email:user.email})
        if(!checkuser) return res.status(400).end()
        const accessToken = jwt.sign({email:user.email,name:user.name,admin:checkuser.admin,subadmin:checkuser.subadmin},process.env.ACCESS_TOKEN,{expiresIn:'1m'})
        return res.status(200).send({accessToken:accessToken})
    })
})

//POST route to logout
router.post('/logout',async (req,res)=>{
    await RefreshTokens.findOneAndRemove({ token: req.cookies.jwt }, { useFindAndModify: false })
    return res.status(200).send({status:'logged out'})
})


const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT,
    process.env.GMAIL_SECRET, 
    "https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH
});





//POST route to reset password
router.post('/resetpass',async(req,res)=>{
    const {error} = resetpassValidation(req.body)
    if(error) return res.status(400).send({status:'Invalid Email'})
    const email = req.body.email.toLowerCase()


    const user = await User.findOne({email:email})
    if(!user) return res.status(400).send({status:'Email not registered'})
    const oldreset = await ResetTokens.findOne({email:email})
    if(oldreset) await oldreset.remove()
    const newToken = new ResetTokens({email:email,token:crypto.randomBytes(16).toString('hex')})
    await newToken.save()
    const accessToken = oauth2Client.getAccessToken()
    let transporter = nodemailer.createTransport({
        service: "Gmail",
            port: 465,
            secure: true,
            auth: {
              type: "OAuth2",
              user: process.env.gmailUser,
              clientId: process.env.GMAIL_CLIENT,
              clientSecret: process.env.GMAIL_SECRET,
              refreshToken: process.env.GMAIL_REFRESH,
              accessToken: accessToken,
            },
    });
    
    await transporter.sendMail({
        from: `"Eric" <${process.env.gmailUser}>`,
        to: email,
        subject: "Reset Password",
        text: "Hi,\n" + "Link will expire in 24 hours\nPlease click below to reset password:\n" + `${req.headers.origin}/resetpassword/?token=${newToken.token}`,
    });
    return res.status(200).send({ status: "Reset password email sent" })
})

//POST route to reset password
router.post('/reset',async (req,res)=>{
    const {error} = resetpassConfirmValidation(req.body)
    if(error) return res.status(400).send({status:"Invalid Token"})
    const param = querystring.parse(req.body.token)
    console.log(param['?token'])
    if(!param['?token']) return res.status(400).send({status:"Invalid Token"})
    const reset  = await ResetTokens.findOne({token:param['?token']})
    if(!reset) return res.status(400).send({status:"Invalid Token"})
    const salt = await bcrypt.genSalt(15)
    const hashPassword = await bcrypt.hash(req.body.password,salt)
    const user = await User.findOneAndUpdate({email:reset.email},{password:hashPassword})
   // await reset.remove()
    const resLogin = await fetch(`http://${req.headers.host}/user/account/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, password: req.body.password }) })
        res.cookie("jwt", resLogin.headers.get('set-cookie').split("=")[1].split(";")[0], {
        expires: new Date(Date.now() + 86400000),
        httpOnly: true
    })
    return res.status(200).end()

})

//POST route to change password from user account page
router.post('/changepass',async (req,res)=>{
    const {error} = changepassValidation(req.body)
    if(error) return res.status(400).send({status:error.details[0].message})
    const login = checkLogin(req)
    if(!login) return res.status(400).send({status:"Log out and try again"})
    const email = req.body.email.toLowerCase()
    const user = await User.findOne({email}) 
    if(!user) return res.status(400).send({status:"Unable to find user"})
    const validPassword = await bcrypt.compare(req.body.currentpass,user.password)
    if(!validPassword) return res.status(400).send({status:"Current password is wrong"})
    const salt = await bcrypt.genSalt(15)
    const hashPassword = await bcrypt.hash(req.body.newpass,salt)
    user.password = hashPassword
    await user.save()
    return res.status(200).send({status:"Successfully changed password"})
})
async function checkLogin(req) {
    const checkadmin = await fetch(`http://${req.headers.host}/user/account/access`, { method: 'GET', headers: { 'cookie': 'jwt=' + req.cookies.jwt, 'access-token': 'none' } })
    var decoded = jwt_decode(checkadmin.headers.get('access-token'));
    return decoded.name
}
module.exports = router