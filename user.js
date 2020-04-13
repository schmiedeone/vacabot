const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const db = require('./db');
const { triggerSlack } = require('./helpers');
const CHANNEL_ID_URL = 'https://slack.com/api/conversations.open';

const userSchema = new Schema({
  userId: { type: 'String', required: true, unique: true },
  userName: { type: 'String', required: true, unique: true },
  channelId: { type: 'String', unique: true },
  vacationBalance: { type: 'Number', default: 10 }
});

userSchema.methods.getChannelId = function() {
  let self = this;
  return new Promise((resolve, reject) => {
    if(self.channelId) {
      resolve(self.channelId);
    } else {
      self.generateChannelId().then(channelId => {
        resolve(self.channelId);
      })
      .catch(error => {
        console.log("In getChannelId error:", error)
      })
    }
  })
}

userSchema.methods.generateChannelId = function() {
  let self = this;
  return new Promise((resolve, reject) => {
    triggerSlack(CHANNEL_ID_URL, { users: self.userId })
    .then(res => {
      if(res.channel) {
        self.channelId = res.channel.id;
        self.save();
        resolve(res.channel.id);
      } else {
        reject();
      }
    })
  }) 
}

userSchema.methods.setVacationBalance = function(days) {
  this.vacationBalance = days;
}

const User = db.model('User', userSchema);

User.createIfNotExists = async function(userId, usernName, channelId=null, vacationBalance=null) {
  let user = await User.findOne({userId: userId})
  if(!user) {
    user = await User.create(
    {
      userId: userId, 
      userName: usernName, 
      channelId: channelId, 
      vacationBalance: vacationBalance || 10
    });
  }  
  return user;
}

User.createIfNotExists('UQF3YAKAT', 'mukarram.ali89')

module.exports = User;