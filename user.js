const CHANNEL_ID_URL = 'https://slack.com/api/conversations.open';

class User {
  constructor(userId, userName, channelId = null, vacationBalance = 10) {
    this.userId = userId;
    this.userName = userName;
    this.channelId = channelId;
    this.vacationBalance = vacationBalance
  }

  getChannelId() {
    return new Promise((resolve, reject) => {
      if(this.channelId) {
        resolve(this.channelId);
      } else {
        this.generateChannelId().then(channelId => {
          this.channelId = channelId
          resolve(this.channelId);
        })
        .catch(error => {
          console.log("In getChannelId error:", error)
        })
      }
    })
  }

  generateChannelId() {
    return new Promise((resolve, reject) => {
      triggerSlack(CHANNEL_ID_URL, { users: this.userId })
      .then(res => {
        if(res.channel) {
          resolve(res.channel.id);
        } else {
          reject();
        }
      })
    })
  }

  setVacationBalance(days) {
    this.vacationBalance = days;
  }

  getVacationBalance() { return this.vacationBalance; }
}

module.exports = User;