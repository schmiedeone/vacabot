const User = require('./user');

var currentManagerId = 'UQF3YAKAT';

function getManager() {
  return User.findOne({userId: currentManagerId})
}

function updateManager(user) {
  currentManagerId = user.userId;
}

module.exports = {
  getManager, updateManager
}