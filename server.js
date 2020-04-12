const http = require('http');
const { parse } = require('querystring');
const axios = require('axios');
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Authorization'] = 'Bearer xoxb-165610094471-1044468471125-2tkSeVkmHUgh1QbOCPTEvPAt';
const MODAL_OPEN_URL = 'https://slack.com/api/views.open';
const CHANNEL_ID_URL = 'https://slack.com/api/conversations.open';
const POST_MSG_URL = 'https://slack.com/api/chat.postMessage';

const Manager = {
  name: 'Mukarram',
  hook: 'https://hooks.slack.com/services/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'
}

http.createServer((request, response) => {
  const { headers, method, url } = request;
  let body = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = parse(Buffer.concat(body).toString());
    processRequest(body)
    response.writeHead(200, {'content-type':'application/json'});
    response.end();
  });
}).listen(80); 

function processRequest(body) {
  if(body.command) {
    handleCommand(body)
  } else {
    handleInteractions(JSON.parse(body.payload))
  }
}

function handleCommand(body) {
  console.log("Handling Command!")
  let user = new User(body.user_id, body.user_name)
  const responseUrl = body.response_url
  const triggerId = body.trigger_id
  trigger(MODAL_OPEN_URL, {
    trigger_id: triggerId,
    view: createVacationDialog(user.getVacationBalance())
  })
}

function handleInteractions(payload) {
  console.log("Handling Interactions! Type:", payload.type)
  const user = new User(payload.user.id, payload.user.username);

  if(payload.type == 'view_submission') {
    const formData = formSubmitData(payload);
    const vacation = new Vacation(user, formData);

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
    reason: values.reason.reason.value
  }
}

class User {
  constructor(userId, userName, channelId = null) {
    this.userId = userId;
    this.userName = userName;
    this.channelId = channelId;
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
      trigger(CHANNEL_ID_URL, { users: this.userId })
      .then(res => {
        if(res.channel) {
          console.log("Updating channelid:")
          resolve(res.channel.id);
        } else {
          reject();
        }
      })
    })
  }

  getVacationBalance() { return 10; }
}

class Vacation {
  constructor(user, {from, to, reason}) {
    this.user = user;
    this.from = from;
    this.to = to;
    this.reason = reason;
    this.approved = true;
  }

  notifyManager() {
    const payload = approvalPayload(this.user, this)
    trigger(Manager.hook, payload)
  }

  notifyEmployee() {
    this.user.getChannelId()
    .then(channelId => {
      trigger(POST_MSG_URL, {
        channel: channelId,
        text: `Your vacation from ${this.from} to ${this.to} has been denied!`
      })
    })
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
          "text": `Hi ${Manager.name}! ${user.userName} added his Vacation plans:\n*<https://calendar.google.com/calendar/b/1?cid=c2NobWllZGUub25lX2Z0Zmhtbm5hZG8xNGczMWRpZGhhZnFlYjQ4QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20|See In Calendar>*`
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `*From:*\n${vacation.from}\n*To:*\n${vacation.to}\n*Comment:* ${vacation.reason}\n*Her/His Vacation Balance:* ${user.getVacationBalance()} Days`
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

function trigger(url, body) {
  return new Promise((resolve, reject) => {
    axios.post(url, body)
    .then(function (response) {
      // console.log("Trigger for url:", url)
      // console.log("response.data:", response.data)
      resolve(response.data)   
    })
    .catch(function (error) {
      console.log(error);
      reject(error);
    });
  })
}