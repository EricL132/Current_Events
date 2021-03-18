const mongoose = require('mongoose')

const settingSchema = new mongoose.Schema({
    column:{
        type: Number,
        validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not an integer value'
          }
    }
})


module.exports = mongoose.model('settings',settingSchema)