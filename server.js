const http = require("http");
const { parse } = require("querystring");
const {
  triggerSlack,
  createVacationDialog,
  formSubmitData,
  predictAction,
  predictInteraction,
  logAction
} = require("./helpers");
const { updateManager } = require("./db_helpers");
const C = require("./consts");
const Vacation = require("./vacation");
const User = require("./user");

http
  .createServer((request, response) => {
    let body = [];
    request
      .on("error", (err) => {
        console.error(err);
      })
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        body = parse(Buffer.concat(body).toString());
        handler(body);
        response.writeHead(200, { "content-type": "application/json" });
        response.end();
      });
  })
  .listen(80);

function handler(body) {
  if (body.command) {
    handleCommand(body);
  } else {
    handleInteractions(JSON.parse(body.payload));
  }
}

async function handleCommand(body) {
  let user = await User.createIfNotExists(body.user_id, body.user_name);
  console.log("\vNew request from:", user.userName);
  const responseUrl = body.response_url;
  const triggerId = body.trigger_id;
  const reqText = body.text;

  const action = predictAction(reqText);
  logAction(action)
  switch (action) {
    case C.SET_MANAGER:
      updateManager(user);
      triggerSlack(responseUrl, { text: "You have been set as manager!" })
        .then((res) => console.log("Confirmation given for updating manager!"))
        .catch((err) => console.log("Sending confirmation failed!\n", err));
      break;
    case C.OPEN_DIALOG_CREATE_VACATION:
      triggerSlack(C.MODAL_OPEN_URL, {
        trigger_id: triggerId,
        view: createVacationDialog(user.vacationBalance),
      });
      break;
    case C.CHECK_VACATION:
      const userName = reqText.substring(1).split(" ")[0];
      let employee = await User.findOne({ userName: userName });
      let days = C.DEFAULT_VACATION_BALANCE;
      if (employee) {
        days = employee.vacationBalance;
      }
      triggerSlack(responseUrl, {
        text: `Leave Balance for @${userName} is _${days}_`,
      });
      break;
    default:
      console.log("Command couldn't be processed:", reqText);
  }
}

async function handleInteractions(payload) {
  const user = await User.createIfNotExists(
    payload.user.id,
    payload.user.username
  );
  console.log("\vNew request from:", user.userName);
  let vacation;
  const interaction = predictInteraction(payload);
  logAction(interaction);
  
  switch (interaction) {
    case C.SUBMIT_VACATION_DIALOG:
      const formData = formSubmitData(payload);
      vacation = await Vacation.create({ user: user, ...formData });

      vacation.reduceVacationBalance();
      vacation.notifyManager();
      break;
    case C.DENY_VACATION_REQUEST:
      vacation = await Vacation.findById(
        payload.actions[0].value
      ).populate("user");
      vacation.denied();
      vacation.notifyEmployee();
      break;
    default:
      console.log("Interaction couldn't be processed:", payload);
  }
}
