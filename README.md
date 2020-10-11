# VacaBot

![alt text](vacabot-logo.png "Isn't this cool?")

Vacabot helps organisation to easily manager leaves/vacation plans without depending upon any extra service potal. Everything through a slackbot.

## Running locally
1. You need db connection and bot auth token.

`cp .env.example .env`

Populate `.env` with required values.

2. Install dependencies and run through yarn ([Install yarn from here](https://classic.yarnpkg.com/en/docs/install/#mac-stable))

`yarn && yarn start`

3. In another tab

`yarn ngrok http 80`

## Installation on a Slack Bot

Add service end point here
https://api.slack.com/apps/A011ASMM6A0/slash-commands
https://api.slack.com/apps/A011ASMM6A0/interactive-messages

To try this by running locally, use ngrok.
Use node version *10.19.0*

## Usage

1. Become a manager:
    */vacabot manager*

2. Create leave request:
    */vacabot*

3. Check leave balance of an employee
    */vacabot @username*


