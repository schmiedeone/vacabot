const http = require('http');
const https = require('https')
const { parse } = require('querystring');
const MODAL_OPEN_URL = 'https://slack.com/api/views.open';
const CHANNEL_ID_URL = 'https://slack.com/api/conversations.open';
const POST_MSG_URL = 'https://slack.com/api/chat.postMessage';

class User {
  constructor(userId, userName, channelId = null) {
    this.userId = userId;
    this.userName = userName;
    this.channelId = channelId;
    this.vacationBalance = 10
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

http.createServer((request, response) => {
  let body = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = parse(Buffer.concat(body).toString());
    handler(body)
    response.writeHead(200, {'content-type':'application/json'});
    response.end();
  });
}).listen(80); 

function handler(body) {
  if(body.command) {
    handleCommand(body)
  } else {
    handleInteractions(JSON.parse(body.payload))
  }
}

function handleCommand(body) {
  console.log("Handling Command!")
  let user = getOrCreateUser(body.user_id, body.user_name)
  const responseUrl = body.response_url
  const triggerId = body.trigger_id
  const reqText = body.text

  if(reqText.indexOf('manage') >= 0) {
    console.log("Update manager")
    setManager(user)
    triggerSlack(responseUrl, { text: "You have been set as manager!" })
  } else {
    triggerSlack(MODAL_OPEN_URL, {
      trigger_id: triggerId,
      view: createVacationDialog(user.getVacationBalance())
    })
  }
}

function handleInteractions(payload) {
  console.log("Handling Interactions! Type:", payload.type)
  const user = getOrCreateUser(payload.user.id, payload.user.username);

  if(payload.type == 'view_submission') {
    const formData = formSubmitData(payload);
    const vacation = new Vacation(user, formData);
    
    vacation.reduceVacationBalance();
    vacation.notifyManager();
  } else if(payload.type == 'block_actions') {
    const action = payload.actions[0].action_id;
    switch(action) {
      case 'deny_vacation':
        const vacation = Vacation.init(payload.actions[0].value);
        vacation.denied();
        vacation.notifyEmployee();
        break;
    }
  }
}

function formSubmitData(payload) {
  const values = payload.view.state.values;
  return {
    from: values.from.from.selected_date,
    to: values.to.to.selected_date,
    reason: values.reason.reason.value,
    count: values.leaves.leaves.value
  }
}

function createVacationDialog(vacationBalance) {
  return {
    "type": "modal",
    "callback_id": "create-vacation-modal",
    "title": {
      "type": "plain_text",
      "text": "VacaBot",
      "emoji": true
    },
    "submit": {
      "type": "plain_text",
      "text": "Submit",
      "emoji": true
    },
    "close": {
      "type": "plain_text",
      "text": "Cancel",
      "emoji": true
    },
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `*Add Vacation!*\nBalance: _${vacationBalance}_ _Days_`
        },
        "block_id": "section1"
      },
      {
        "type": "input",
        "element": {
          "type": "datepicker",
          "placeholder": {
            "type": "plain_text",
            "text": "Select a date",
            "emoji": true
          },
          "action_id": "from"
        },
        "label": {
          "type": "plain_text",
          "text": "From",
          "emoji": true
        },
        "block_id": "from"
      },
      {
        "type": "input",
        "element": {
          "type": "datepicker",
          "placeholder": {
            "type": "plain_text",
            "text": "Select a date",
            "emoji": true
          },
          "action_id": "to"
        },
        "label": {
          "type": "plain_text",
          "text": "To",
          "emoji": true
        },
        "block_id": "to"
      },
      {
        "type": "input",
        "element": {
          "type": "plain_text_input",
          "action_id": "reason"
        },
        "label": {
          "type": "plain_text",
          "text": "Reason/Comment",
          "emoji": true
        },
        "block_id": "reason"
      },
      {
        "type": "input",
        "element": {
          "type": "plain_text_input",
          "placeholder": {
            "type": "plain_text",
            "text": "Excluding holidays",
            "emoji": true
          },
          "action_id": "leaves"
        },
        "label": {
          "type": "plain_text",
          "text": "Number of Leaves (Excluding Holidays)",
          "emoji": true
        },
        "block_id": "leaves"
      }  
    ]
  }
}

function approvalPayload(user, vacation) {
  return {
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hi ${getUser(currentManagerId).userName}! ${user.userName} added his Vacation plans:\n*<https://calendar.google.com/calendar/b/1?cid=c2NobWllZGUub25lX2Z0Zmhtbm5hZG8xNGczMWRpZGhhZnFlYjQ4QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20|See In Calendar>*`
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `*From:*\n${vacation.from}\n*To:*\n${vacation.to}\n*Comment:* ${vacation.reason}\n*Her/His vacation balance will be:* ${user.getVacationBalance()} Days`
        },
        "accessory": {
          "type": "image",
          "image_url": "https://api.slack.com/img/blocks/bkb_template_images/approvalsNewDevice.png",
          "alt_text": "computer thumbnail"
        }
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "Deny"
            },
            "style": "danger",
            "value": `${JSON.stringify(vacation)}`,
            "action_id": "deny_vacation"
          }          
        ]
      }
    ]
  }
}

function triggerSlack(url, reqBody) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(reqBody)
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': 'Bearer xoxb-165610094471-1044468471125-2tkSeVkmHUgh1QbOCPTEvPAt'
      }
    }
  
    const req = https.request(url, options, res => {
      res.on('data', d => {
        try {
          resolve(JSON.parse(d.toString()))
        } catch (e) {
          resolve(d.toString())
        }
      })
    })
  
    req.on('error', error => {
      console.error(error)
      reject(error)
    })
  
    req.write(data)
    req.end()
  })
}