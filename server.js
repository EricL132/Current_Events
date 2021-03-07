const express = require('express')
const app = express()
const PORT = process.env.PORT || 9000
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const path = require('path');

dotenv.config()
const accountRoutes = require('./routes/account.js')
var cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(express.json())
mongoose.connect(process.env.DB_CONNECT,{useNewUrlParser:true,useUnifiedTopology:true})
mongoose.connection.once('open', () => { console.log('MongoDB Connected'); });
mongoose.connection.on('error', (err) => { console.log('MongoDB connection error: ', err); }); 


app.use(express.static(path.join(__dirname, '/frontend/build')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/frontend/build/index.html'));
  });








app.use('/user/account',accountRoutes)


app.get('*', (request, res) => {
  res.sendFile(path.join(__dirname+'/frontend/build/index.html'));
  });
app.listen(PORT,()=>{console.log('Listening to port '+ PORT)
})