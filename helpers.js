const https = require("https");

function triggerSlack(url, reqBody) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(reqBody);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
        Authorization:
          "Bearer xoxb-165610094471-1044468471125-2tkSeVkmHUgh1QbOCPTEvPAt",
      },
    };

    const req = https.request(url, options, (res) => {
      res.on("data", (d) => {
        try {
          resolve(JSON.parse(d.toString()));
        } catch (e) {
          resolve(d.toString());
        }
      });
    });

    req.on("error", (error) => {
      console.error(error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

function approvalPayload(user, vacation) {
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hi ${getUser(currentManagerId).userName}! ${
            user.userName
          } added his Vacation plans:\n*<https://calendar.google.com/calendar/b/1?cid=c2NobWllZGUub25lX2Z0Zmhtbm5hZG8xNGczMWRpZGhhZnFlYjQ4QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20|See In Calendar>*`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*From:*\n${vacation.from}\n*To:*\n${vacation.to}\n*Comment:* ${
            vacation.reason
          }\n*Her/His vacation balance will be:* ${user.getVacationBalance()} Days`,
        },
        accessory: {
          type: "image",
          image_url:
            "https://api.slack.com/img/blocks/bkb_template_images/approvalsNewDevice.png",
          alt_text: "computer thumbnail",
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: "Deny",
            },
            style: "danger",
            value: `${JSON.stringify(vacation)}`,
            action_id: "deny_vacation",
          },
        ],
      },
    ],
  };
}

function createVacationDialog(vacationBalance) {
  return {
    type: "modal",
    callback_id: "create-vacation-modal",
    title: {
      type: "plain_text",
      text: "VacaBot",
      emoji: true,
    },
    submit: {
      type: "plain_text",
      text: "Submit",
      emoji: true,
    },
    close: {
      type: "plain_text",
      text: "Cancel",
      emoji: true,
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Add Vacation!*\nBalance: _${vacationBalance}_ _Days_`,
        },
        block_id: "section1",
      },
      {
        type: "input",
        element: {
          type: "datepicker",
          placeholder: {
            type: "plain_text",
            text: "Select a date",
            emoji: true,
          },
          action_id: "from",
        },
        label: {
          type: "plain_text",
          text: "From",
          emoji: true,
        },
        block_id: "from",
      },
      {
        type: "input",
        element: {
          type: "datepicker",
          placeholder: {
            type: "plain_text",
            text: "Select a date",
            emoji: true,
          },
          action_id: "to",
        },
        label: {
          type: "plain_text",
          text: "To",
          emoji: true,
        },
        block_id: "to",
      },
      {
        type: "input",
        element: {
          type: "plain_text_input",
          action_id: "reason",
        },
        label: {
          type: "plain_text",
          text: "Reason/Comment",
          emoji: true,
        },
        block_id: "reason",
      },
      {
        type: "input",
        element: {
          type: "plain_text_input",
          placeholder: {
            type: "plain_text",
            text: "Excluding holidays",
            emoji: true,
          },
          action_id: "leaves",
        },
        label: {
          type: "plain_text",
          text: "Number of Leaves (Excluding Holidays)",
          emoji: true,
        },
        block_id: "leaves",
      },
    ],
  };
}

function formSubmitData(payload) {
  const values = payload.view.state.values;
  return {
    from: values.from.from.selected_date,
    to: values.to.to.selected_date,
    reason: values.reason.reason.value,
    count: values.leaves.leaves.value,
  };
}

module.exports = { triggerSlack, approvalPayload, createVacationDialog, formSubmitData };
