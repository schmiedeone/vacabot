const { triggerSlack, approvalPayload } = require('./helpers');
const { getManager, addOrUpdateUser } = require('./db_helpers');
const User = require('./user');

const POST_MSG_URL = 'https://slack.com/api/chat.postMessage';

class Vacation {
    constructor(user, {from, to, reason, count}) {
      this.user = user;
      this.from = from;
      this.to = to;
      this.reason = reason;
      this.count = Number(count) || 1;
      this.approved = true;
    }
  
    notifyManager() {
      const payload = approvalPayload(this.user, this)
      getManager()
      .then(manager => {
        manager.getChannelId()
        .then(channelId => {
          triggerSlack(POST_MSG_URL, {
            ...payload,
            channel: channelId,
          })
          .then(data => console.log("Manager Notified!"))
          .catch(console.log)
        })
      })
    }
  
    notifyEmployee() {
      this.user.getChannelId()
      .then(channelId => {
        triggerSlack(POST_MSG_URL, {
          channel: channelId,
          text: `Your vacation from ${this.from} to ${this.to} has been denied!`
        })
        .then(data => console.log("Employee Notified!"))
        .catch(console.log)
      })
    }
  
    reduceVacationBalance() {
      this.user.setVacationBalance(this.user.getVacationBalance()-this.count);
      addOrUpdateUser(this.user)
    }
  
    denied() {
      this.approved = false;
    }
  }
  
  Vacation.init = function(value) {
    const data = JSON.parse(value)
    const user = new User(data.user.userId, data.user.userName)
    return new Vacation(user, data)
  }
  