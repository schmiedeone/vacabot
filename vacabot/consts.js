module.exports = Object.freeze({
  SET_MANAGER: 'SET_MANAGER',
  OPEN_DIALOG_CREATE_VACATION: 'OPEN_DIALOG_CREATE_VACATION',
  CHECK_VACATION: 'CHECK_VACATION',
  SUBMIT_VACATION_DIALOG: 'SUBMIT_VACATION_DIALOG',
  DENY_VACATION_REQUEST: 'DENY_VACATION_REQUEST',
  DEFAULT_VACATION_BALANCE: 10,
  DEFAULT_USER: { userName: 'mukarram.ali89', userId: 'U01C90R2NDB', teamId: 'T01CQMVB997' },
  AUTH_TOKEN: process.env.BOT_USER_AUTH_TOKEN,
  MODAL_OPEN_URL: 'https://slack.com/api/views.open',
  POST_MSG_URL: 'https://slack.com/api/chat.postMessage',
  CHANNEL_ID_URL: 'https://slack.com/api/conversations.open'
});