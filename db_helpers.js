const User = require("./user");
const C = require("./consts");

var currentManagerId = C.DEFAULT_USER.userId;

function getManager() {
  return User.findOne({ userId: currentManagerId });
}

function updateManager(user) {
  currentManagerId = user.userId;
}

module.exports = {
  getManager,
  updateManager,
};
