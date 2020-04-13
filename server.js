const http = require('http');
const { parse } = require('querystring');
const MODAL_OPEN_URL = 'https://slack.com/api/views.open';
const { triggerSlack, createVacationDialog, formSubmitData } = require('./helpers');
const { getOrCreateUser, setManager } = require('./db_helpers');
const Vacation = require('./vacation');

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
  } else if(reqText.trim().length == 0) {
    triggerSlack(MODAL_OPEN_URL, {
      trigger_id: triggerId,
      view: createVacationDialog(user.getVacationBalance())
    })
  } else {
    // Check if username is passed and return leave balance
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
