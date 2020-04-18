const http = require("http");
const { parse } = require("querystring");
const {
  predictAction,
  predictInteraction,
  logAction
} = require("./vacabot/helpers");
const {
  actionCheckVacationBalance,
  actionDenyVacationRequest,
  actionOpenCreateVacation,
  actionSubmitVacationRequest,
  actionUpdateManager
} = require("./vacabot/actions");
const C = require("./vacabot/consts");
const User = require("./vacabot/models/user");

function serverHandler(req, res) {
  let body = [];
  req
    .on("error", console.error)
    .on("data", data => body.push(data))
    .on("end", () => {
      try {
        body = parse(Buffer.concat(body).toString());
        mainHandler(body);
      } catch(err) {
        console.error(err);
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end();
    });
}

http
  .createServer(serverHandler)
  .listen(process.env.PORT || 80);

function mainHandler(body) {
  if (body.command) {
    handleCommand(body);
  } else {
    handleInteractions(JSON.parse(body.payload));
  }
}

async function handleCommand(body) {
  let user = await User.createIfNotExists(body.user_id, body.user_name, body.team_id);
  console.log("\vNew request from:", user.userName);

  const responseUrl = body.response_url;
  const triggerId = body.trigger_id;
  const query = body.text;

  const action = predictAction(query);
  logAction(action)

  switch (action) {
    case C.SET_MANAGER:
      actionUpdateManager(responseUrl, user);
      break;
    case C.OPEN_DIALOG_CREATE_VACATION:
      actionOpenCreateVacation(triggerId, user);
      break;
    case C.CHECK_VACATION:
      actionCheckVacationBalance(responseUrl, query);
      break;
    default:
      console.log("Command couldn't be processed:", query);
  }
}

async function handleInteractions(payload) {
  const user = await User.createIfNotExists(payload.user.id, payload.user.username, payload.user.team_id);
  console.log("\vNew request from:", user.userName);

  const interaction = predictInteraction(payload);
  logAction(interaction);
  
  switch (interaction) {
    case C.SUBMIT_VACATION_DIALOG:
      actionSubmitVacationRequest(user, payload)
      break;
    case C.DENY_VACATION_REQUEST:
      actionDenyVacationRequest(payload)
      break;
    default:
      console.log("Interaction couldn't be processed:", payload);
  }
}