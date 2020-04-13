const http = require('http');
const { parse } = require('querystring');
const MODAL_OPEN_URL = 'https://slack.com/api/views.open';
const { triggerSlack, createVacationDialog, formSubmitData } = require('./helpers');
const { updateManager } = require('./db_helpers');
const Vacation = require('./vacation');
const User = require('./user')

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

const SET_MANAGER = 'set_manager',
OPEN_DIALOG = 'open_dialog',
CHECK_VACATION = 'check_vacation';

function whichAction(query) {
  if(query.indexOf('manage') >= 0) {
    return SET_MANAGER;
  } else if(query.trim().length == 0) {
    return OPEN_DIALOG;
  } else if(query.trim()[0] == '@') {
    if(query.trim().substring(1).split(' ').length == 1) {
      return CHECK_VACATION;
    }
  }
  return null;
}

async function handleCommand(body) {
  let user = await User.createIfNotExists(body.user_id, body.user_name)
  console.log("Handling Command! User:", user.userName)
  const responseUrl = body.response_url
  const triggerId = body.trigger_id
  const reqText = body.text

  switch(whichAction(reqText)) {
    case SET_MANAGER:
      updateManager(user)
      triggerSlack(responseUrl, { text: "You have been set as manager!" })
      .then(res => console.log("Confirmation give!"))
      .catch(err => console.log("Sending confirmation failed!\n", err))
      break;
    case OPEN_DIALOG:
      triggerSlack(MODAL_OPEN_URL, {
        trigger_id: triggerId,
        view: createVacationDialog(user.vacationBalance)
      })
      break;
    case CHECK_VACATION:
      const userName = reqText.substring(1).split(' ')[0];
      const user = await User.findOne({userName: userName});
      let days = 10;
      if(user) {
        days = user.vacationBalance;
      }
      triggerSlack(responseUrl, { text: `Leave Balance for @${userName} is _${days}_` })
      break;
    default:
      console.log("Command couldn't be processed:", reqText)
  }
}

async function handleInteractions(payload) {
  const user = await User.createIfNotExists(payload.user.id, payload.user.username);
  console.log(`Handling Interactions! Type:${payload.type}, User:${user.userName}`)

  if(payload.type == 'view_submission') {
    const formData = formSubmitData(payload);
    const vacation = await Vacation.create({user: user, ...formData});
    
    vacation.reduceVacationBalance();
    vacation.notifyManager();
  } else if(payload.type == 'block_actions') {
    const action = payload.actions[0].action_id;
    switch(action) {
      case 'deny_vacation':
        const vacation = await Vacation.findById(payload.actions[0].value).populate('user')
        vacation.denied();
        vacation.notifyEmployee();
        break;
    }
  }
}
