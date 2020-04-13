const User = require('./user');

var currentManagerId = 'UQF3YAKAT';

function getManager() {
  return User.findOne({userId: currentManagerId})
}

function updateManager(user) {
  User.updateOne({userId: user.userId}, user)
  .then(res => console.log("Manager updated with id:", user.userId))
  .catch(err => console.log("Update Manager Failed!\n", err))
}

module.exports = {
  getManager, updateManager
}