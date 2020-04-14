const { Schema } = require("mongoose");

const db = require("../db");
const { triggerSlack } = require("../helpers");
const C = require("../consts");

const userSchema = new Schema({
  userId: { type: "String", required: true, unique: true },
  userName: { type: "String", required: true, unique: true },
  channelId: { type: "String", unique: true },
  vacationBalance: { type: "Number", default: 10 },
  teamId: { type: "String", required: true },
  ifManager: { type: "Boolean", default: false }
});

userSchema.methods.getChannelId = function () {
  let self = this;
  return new Promise((resolve, reject) => {
    if (self.channelId) {
      resolve(self.channelId);
    } else {
      self
        .generateChannelId()
        .then((channelId) => {
          resolve(self.channelId);
        })
        .catch((error) => {
          console.log("In getChannelId error:", error);
        });
    }
  });
};

userSchema.methods.generateChannelId = function () {
  let self = this;
  return new Promise((resolve, reject) => {
    triggerSlack(C.CHANNEL_ID_URL, { users: self.userId }).then((res) => {
      if (res.channel) {
        self.channelId = res.channel.id;
        self.save();
        resolve(res.channel.id);
      } else {
        reject();
      }
    });
  });
};

userSchema.methods.updateVacationBalance = function (days) {
  this.vacationBalance = days;
  this.save();
};

const User = db.model("User", userSchema);

userSchema.methods.getManager = function () {
  return User.findOne({teamId: this.teamId, ifManager: true})
}

userSchema.methods.setAsManager = async function () {
  let currentManager = User.findOne({teamId: this.teamId, ifManager: true})
  if(currentManager) {
    currentManager.ifManager = false;
    currentManager.save();
  }
  this.ifManager = true;
  this.save();
}

User.createIfNotExists = async function (
  userId,
  usernName,
  teamId,
  channelId = null,
  vacationBalance = null
) {
  let user = await User.findOne({ userId: userId });
  if (!user) {
    user = await User.create({
      userId: userId,
      userName: usernName,
      teamId: teamId,
      channelId: channelId,
      vacationBalance: vacationBalance || 10,
    });
  }
  return user;
};

User.createIfNotExists(C.DEFAULT_USER.userId, C.DEFAULT_USER.userName, C.DEFAULT_USER.teamId);

module.exports = User;
