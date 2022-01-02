var mongoose = require('mongoose');
const C = require('./consts');

const db = mongoose.createConnection(C.DB_CONNECTION_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

module.exports = db;
