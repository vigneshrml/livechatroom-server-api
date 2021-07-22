const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    message : String,
    author:{
        type : mongoose.Schema.Types.ObjectId,
        ref  : "User"
    },
    createdAt : {type : Date , default : Date.now }

});

module.exports = mongoose.model('News',newsSchema);