const http = require('http');
const { parse } = require('querystring');
const axios = require('axios');
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Authorization'] = 'Bearer xoxb-165610094471-1044468471125-2tkSeVkmHUgh1QbOCPTEvPAt';
const MODAL_OPEN_URL = 'https://slack.com/api/views.open';

http.createServer((request, response) => {
  const { headers, method, url } = request;
  let body = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = parse(Buffer.concat(body).toString());
    console.log("=========================\n")
    console.log("RequestBody:", body)
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
  let user = new User(body.user_id, body.user_name, null)
  const responseUrl = body.response_url
  const triggerId = body.trigger_id
  trigger(MODAL_OPEN_URL, {
    trigger_id: triggerId,
    view: createVacationDialog(getVacationBalance())
  })
}

function getVacationBalance(userId) {
  return 10;
}

function handleInteractions(payload) {
  console.log("Handling Interactions!")
  const user = new User(payload.user.id, payload.user.username, null);
  if(payload.type == 'view_submission') {
    const formData = formSubmitData(payload);
    const vacation = new Vacation(formData)

    console.log("Creating vacation for user:", user)
    console.log("Vacation:", vacation)
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
  constructor(userId, userName, channelId) {
    this.userId = userId;
    this.userName = userName;
    this.channelId = channelId;
  }
}

class Vacation {
  constructor({from, to, reason}) {
    this.from = from;
    this.to = to;
    this.reason = reason;
  }
}

function createVacationDialog(props) {
  const { vacationLeft } = props;
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
          "text": `*Add Vacation!*\nBalance: _${vacationLeft}_ _Days_`
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

function trigger(url, body) {
  axios.post(url, body)
  .then(function (response) {
    console.log("Response from trigger:", response.data);
  })
  .catch(function (error) {
    console.log(error);
  });
}