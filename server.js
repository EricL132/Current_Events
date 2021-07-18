const express = require('express')
const app = express()
const PORT = process.env.PORT || 9001
const mongoose = require('mongoose')
const path = require('path');
const dotenv = require('dotenv')
dotenv.config()

const accountRoutes = require('./routes/account.js')
const infoRoutes = require('./routes/info')
var cookieParser = require('cookie-parser')
//middleware for cookies
app.use(cookieParser())
//middleware to read incoming data
app.use(express.json())


//connects to database
mongoose.connect(process.env.DB_CONNECT,{useNewUrlParser:true,useUnifiedTopology:true})
mongoose.connection.once('open', () => { console.log('MongoDB Connected'); });
mongoose.connection.on('error', (err) => { console.log('MongoDB connection error: ', err); }); 

//deployment
app.use(express.static(path.join(__dirname, '/frontend/build')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/frontend/build/index.html'));
  });

//Routes
app.use('/user/account',accountRoutes)
app.use('/info',infoRoutes)
//All other routes
app.get('*', (request, res) => {
  res.sendFile(path.join(__dirname+'/frontend/build/index.html'));
  });
//Express started
app.listen(PORT,()=>{console.log('Listening to port '+ PORT)
})
