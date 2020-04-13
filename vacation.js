const { Schema } = require("mongoose");

const db = require("./db");
const { triggerSlack, approvalPayload } = require("./helpers");
const { getManager } = require("./db_helpers");
const C = require("./consts");

const vacationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  from: { type: "String", required: true },
  to: { type: "String", required: true },
  reason: { type: "String" },
  count: { type: "Number", required: true },
  approved: { type: "Boolean", default: true },
});

vacationSchema.methods.reduceVacationBalance = function () {
  this.user.setVacationBalance(this.user.vacationBalance - this.count);
  this.user.save();
};

vacationSchema.methods.notifyManager = function () {
  getManager().then((manager) => {
    manager.getChannelId().then((channelId) => {
      const payload = approvalPayload(this.user, manager, this);
      triggerSlack(C.POST_MSG_URL, {
        ...payload,
        channel: channelId,
      })
        .then((data) => console.log("Manager Notified for Vacation Request!"))
        .catch(console.log);
    });
  });
};

vacationSchema.methods.notifyEmployee = function () {
  this.user.getChannelId().then((channelId) => {
    triggerSlack(C.POST_MSG_URL, {
      channel: channelId,
      text: `Your vacation from ${this.from} to ${this.to} has been denied!`,
    })
      .then((data) => console.log("Employee Notified for Request Deny!"))
      .catch(console.log);
  });
};

vacationSchema.methods.denied = function () {
  if (this.approved) {
    this.user.setVacationBalance(this.user.vacationBalance + this.count);
    this.user.save();
    this.approved = false;
    this.save();
  }
};

const Vacation = db.model("Vacation", vacationSchema);

module.exports = Vacation;
