const {
  triggerSlack,
  createVacationDialog,
  formSubmitData,
} = require("./helpers");
const { updateManager } = require("./db_helpers");
const C = require("./consts");
const Vacation = require("./models/vacation");
const User = require("./models/user");

async function actionSubmitVacationRequest(user, payload) {
  const formData = formSubmitData(payload);
  vacation = await Vacation.create({ user: user, ...formData });

  vacation.reduceVacationBalance();
  vacation.notifyManager();
}

async function actionDenyVacationRequest(payload) {
  const vacation = await Vacation.findById(
    payload.actions[0].value
  ).populate("user");
  vacation.denied();
  vacation.notifyEmployee();
}

async function actionUpdateManager(responseUrl, user) {
  updateManager(user);
  triggerSlack(responseUrl, { text: "You have been set as manager!" })
    .then((res) => console.log("Confirmation given for updating manager!"))
    .catch((err) => console.log("Sending confirmation failed!\n", err));
}

async function actionOpenCreateVacation(triggerId, user) {
  triggerSlack(C.MODAL_OPEN_URL, {
    trigger_id: triggerId,
    view: createVacationDialog(user.vacationBalance),
  });
}

async function actionCheckVacationBalance(responseUrl, query) {
  const userName = query.substring(1).split(" ")[0];
  let employee = await User.findOne({ userName: userName });
  let days = C.DEFAULT_VACATION_BALANCE;
  if (employee) {
    days = employee.vacationBalance;
  }
  triggerSlack(responseUrl, {
    text: `Leave Balance for @${userName} is _${days}_`,
  });
}

module.exports = {
  actionCheckVacationBalance,
  actionDenyVacationRequest,
  actionOpenCreateVacation,
  actionSubmitVacationRequest,
  actionUpdateManager
}