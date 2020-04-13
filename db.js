var mongoose = require('mongoose');
var DB_URL = "mongodb+srv://vacabot:vacabot.1@cluster0-4otk0.mongodb.net/vacabot";

db = mongoose.createConnection(DB_URL, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

module.exports = db;