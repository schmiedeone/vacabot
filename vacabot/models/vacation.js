const { Schema } = require("mongoose");

const db = require("../db");
const { triggerSlack, templateApprovalPayload } = require("../helpers");
const C = require("../consts");

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
  this.user.updateVacationBalance(this.user.vacationBalance - this.count);
};

vacationSchema.methods.notifyManager = function () {
  this.user.theirManager().then((manager) => {
    if(!manager) {
      this.user.getChannelId().then((channelId) => {
        triggerSlack(C.POST_MSG_URL, {
          channel: channelId,
          text: "Manager for your team not set. Use _/vacabot manager_ to become one."
        })
      });
      // return above promise call instead
      return;
    }
    manager.getChannelId().then((channelId) => {
      const payload = templateApprovalPayload(this.user, manager, this);
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
    this.user.updateVacationBalance(this.user.vacationBalance + this.count);
    this.approved = false;
    this.save();
  }
};

const Vacation = db.model("Vacation", vacationSchema);

module.exports = Vacation;
