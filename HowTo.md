# VacaBot

1. Add api end point here
https://api.slack.com/apps/A011ASMM6A0/slash-commands?

2. Anytime somebody type /vacabot, above endpoint will hit. With payload

<!-- { "token": "JObgkk4AdEuHUYoOAwjbVS32", "team_id": "T4VHY2SDV", "team_domain": "schmiedeone", "channel_id": "DQFECFLAJ", "channel_name": "directmessage", "user_id": "UQF3YAKAT", "user_name": "mukarram.ali89", "command": "/vacabot", "text": "", "response_url": "https://hooks.slack.com/commands/T4VHY2SDV/1038304679985/uEebuZCGKrG7LxwXzGzNbljG", "trigger_id": "1038304680097.165610094471.5a37c2fa135f6553fe5362e0c1716ad0" } -->

From payload we take out 
- user_id = payload.user_id
- username = payload.username

3. We need to get the channel id for this user by. If the channelId already present for the user, we don't need this step
POST https://slack.com/api/conversations.open
Bearer Token: xoxb-165610094471-1044468471125-2tkSeVkmHUgh1QbOCPTEvPAt
Content-type: application/json
Params:
    users: ${user_id}
- channel_id = response.channel.id


We need some data for next step
- vacationBalance = getVacationLeftOfUser(user_id) || getDefaultVacation()
- initDate = endDate = System.currentDate() // yyyy-mm-dd format
- userVacationRecordId = mapUserWithNewVacation().id

4. Finally send the card to the user in slack to pick up the dates
POST https://slack.com/api/chat.postMessage
Bearer Token: xoxb-165610094471-1044468471125-2tkSeVkmHUgh1QbOCPTEvPAt
Content-type: application/json
Params:
    channel: ${channel_id}
    blocks: getData(create-vacation.json.template, params: { initDate, endDate, vacationBalance, userVacationRecordId, extraMessage })
*extraMessage: In case if there was a validationError


======== Now user will get a msg to pick up date ======

3 actions will trigger in API,

switch(payload.actions.action_id)
  Case initDate: User sends ${initDate} clicked.
    username = payload.user.username
    user_id = payload.user.id
    initDate = payload.actions.selected_date
    userVacationRecordId = payload.actions.block_id

  Case endDate: User sends ${endDate} clicked.
    username = payload.user.username
    user_id = payload.user.id
    endDate = payload.actions.selected_date
    userVacationRecordId = payload.actions.block_id

Case confirmVacation: User confirms
    userVacationRecordId = payload.actions.block_id

======================
When you get confirm request, you get initDate and endDate for the user and then
5. API will call bot hook, which triggers msg to Alex. 
POST https://hooks.slack.com/services/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
    RawBody: getData(vacation-request.json.filedata, params: {username, vacationBalance, initDate, endDate, userVacationRecordId}(
============
6. Now Alex lets suppose deny the request. Our endpoint will hit with
If Payload.actions.action_id == 'denyVacationRequest'
	userVacationRecordId = payload.actions.value
>>> From userVacationRecordId get your username and the vacation
=============
Validation, lets say user requested some invalid dates, or any kind of error
Repeat step 4 but with a message


=============

7. Alex or anybody wants to know vacationBalance
You type

    /vacabot mukarram.ali98

Server will get: { command: "/vacabot", text: "mukarram.ali98" }

- username = body.text
- vacationBalance = get_vacation_balance(vacation_with_user_name(username))

POST https://slack.com/api/chat.postMessage
Bearer Token: xoxb-165610094471-1044468471125-2tkSeVkmHUgh1QbOCPTEvPAt
Content-type: application/json
Params:
    channel: ${channel_id}
    text: "${username} has ${vacationBalance} left!"

