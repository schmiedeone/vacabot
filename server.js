const http = require('http');
const { parse } = require('querystring');
const axios = require('axios');
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Authorization'] = 'Bearer xoxb-165610094471-1044468471125-2tkSeVkmHUgh1QbOCPTEvPAt';

http.createServer((request, response) => {
  const { headers, method, url } = request;
  let body = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = parse(Buffer.concat(body).toString());
    console.log(body)
    processRequest(body)
    response.writeHead(200, {'content-type':'application/json'});
    response.end();
  });
  
}).listen(80); 

function processRequest(body) {
  if(body.command) {
    handleCommand(body)
  } else {
    handleInteractions(body)
  }
}

const MODAL_OPEN_URL = 'https://slack.com/api/dialog.open';

function handleCommand(body) {
  console.log("Handling Command!")
  let user = new User(body.user_id, body.user_name, null)
  const responseUrl = body.response_url
  const triggerId = body.trigger_id
  trigger(MODAL_OPEN_URL, {
    trigger_id: triggerId,
    dialog: createVacationDialog(getVacationBalance())
  })
}

function getVacationBalance(userId) {
  return 10
}

function handleInteractions() {}

class User {
  constructor(userId, userName, channelId) {
    this.userId = userId;
    this.userName = userName;
    this.channelId = channelId;
  }
}

class Vacation {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
}

function createVacationTemplate(props) {
  const { vacationLeft } = props;
  return { "blocks":
  [
      {
         "type":"section",
         "text":{
            "type":"mrkdwn",
            "text":`*Add Vacation!*\nBalance: ${vacationLeft} Days`
         }
      },
      {
         "type":"section",
         "text":{
            "type":"mrkdwn",
            "text":"From Date"
         },
         "accessory":{
            "type":"datepicker",
            "placeholder":{
               "type":"plain_text",
               "text":"Select a date",
               "emoji":true
            },
            "action_id": "from"
         },
         "block_id": "${userVacationRecordId}"
      },
      {
         "type":"section",
         "text":{
            "type":"mrkdwn",
            "text":"To Date"
         },
         "accessory":{
            "type":"datepicker",
            "placeholder":{
               "type":"plain_text",
               "text":"Select a date",
               "emoji":true
            },
            "action_id": "to"
         }
      },
      {
         "type":"divider"
      },
      {
         "type":"actions",
         "elements":[
            {
               "type":"button",
               "text":{
                  "type":"plain_text",
                  "emoji":true,
                  "text":"Confirm Plan"
               },
               "style":"primary",
               "value":"click_me_123",
               "action_id": "confirmVacation"
            }
         ]
      }
   ],
   "text": "Create Vacation!"
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
          }
        },
        "label": {
          "type": "plain_text",
          "text": "From",
          "emoji": true
        }
      },
      {
        "type": "input",
        "element": {
          "type": "datepicker",
          "placeholder": {
            "type": "plain_text",
            "text": "Select a date",
            "emoji": true
          }
        },
        "label": {
          "type": "plain_text",
          "text": "To",
          "emoji": true
        }
      },
      {
        "type": "input",
        "element": {
          "type": "plain_text_input"
        },
        "label": {
          "type": "plain_text",
          "text": "Reason/Comment",
          "emoji": true
        }
      }
    ]
  }
}

function trigger(url, body) {
  axios.post(url, body)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
}