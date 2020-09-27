const mongoose = require ('mongoose');
const chatSchema = new mongoose.Schema({
    message:{
        type:String,
    },
    name:{
        type:String,
    },
    timestamp:{
        type:String
    },
    received:{
        type:Boolean
    }
})

module.exports = mongoose.model("messageContent",chatSchema) 