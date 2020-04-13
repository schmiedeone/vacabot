const { triggerSlack, approvalPayload } = require('./helpers');
const { getManager } = require('./db_helpers');
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
      getManager()
      .then(manager => {
        manager.getChannelId()
        .then(channelId => {
          const payload = approvalPayload(this.user, manager, this)
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
      this.user.setVacationBalance(this.user.vacationBalance-this.count);
      this.user.save();
    }
  
    denied() {
      this.approved = false;
    }
  }
  
Vacation.init = async function(value) {
    const data = JSON.parse(value)
    const user = await User.findOne({userId: data.user.userId})
    return new Vacation(user, data)
}

module.exports = Vacation;