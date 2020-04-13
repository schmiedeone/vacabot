const User = require('./user');

var currentManagerId = 'UQF3YAKAT';
var defaultManager = new User('UQF3YAKAT', 'mukarram.ali89', null)
var users = {}
addOrUpdateUser(defaultManager)

function addOrUpdateUser(user) {
  users[user.userId] = user;
  return user;
}

function getUser(userId) {
  return users[userId];
}

function getOrCreateUser(userId, userName=null, channelId=null) {
  return getUser(userId) || addOrUpdateUser(new User(userId, userName, channelId));
}

function getManager() {
  return new Promise((resolve, reject) => {
    resolve(getUser(currentManagerId));
  });
}

function setManager(user) {
  currentManagerId = user.userId;
}

module.exports = {
    addOrUpdateUser, getUser, getOrCreateUser, getManager, setManager
}