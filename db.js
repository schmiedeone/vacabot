var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://vacabot:vacabot.1@cluster0-4otk0.mongodb.net/vacabot";

var mongoose = require('mongoose');
mongoose.connect(url, {useNewUrlParser: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});