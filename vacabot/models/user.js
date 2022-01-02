const { Schema } = require("mongoose");

const db = require("../db");
const { triggerSlack } = require("../helpers");
const C = require("../consts");

const userSchema = new Schema({
  userId: { type: "String", required: true, unique: true },
  userName: { type: "String", required: true, unique: false },
  channelId: { type: "String" },
  vacationBalance: { type: "Number", default: C.DEFAULT_VACATION_BALANCE },
  teamId: { type: "String", required: true },
  ifManager: { type: "Boolean", default: false }
});

userSchema.methods.getChannelId = function () {
  let self = this;
  return new Promise((resolve) => {
    if (self.channelId) {
      resolve(self.channelId);
    } else {
      self
        .generateChannelId()
        .then((channelId) => {
          resolve(channelId);
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

userSchema.methods.theirManager = function () {
  return this.model("User").findOne({teamId: this.teamId, ifManager: true})
}

userSchema.methods.setAsManager = async function () {
  this.model("User").updateOne({teamId: this.teamId, ifManager: true}, {ifManager: false})
  this.ifManager = true;
  this.save();
}

const User = db.model("User", userSchema);

User.createIfNotExists = async function ({
  userId,
  userName,
  teamId,
  channelId = null,
  vacationBalance = null
}) {
  let user = await User.findOne({ userId: userId });
  if (!user) {
    user = await User.create({
      userId: userId,
      userName: userName,
      teamId: teamId,
      channelId: channelId,
      vacationBalance: vacationBalance || C.DEFAULT_VACATION_BALANCE,
    });
  }
  return user;
};

module.exports = User;
