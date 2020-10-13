# VacaBot

![alt text](vacabot-logo.png "Isn't this cool?")

Vacabot helps organisation to easily manager leaves/vacation plans without depending upon any extra service potal. Everything through a slackbot.

## Running locally

1. You need db connection and bot auth token.\
   `cp .env.example .env`\
   Populate `.env` with required values.
2. Install dependencies and run through yarn ([Install yarn from here](https://classic.yarnpkg.com/en/docs/install/#mac-stable))\
   `yarn && yarn start`
3. In another tab\
   `yarn ngrok http 80`

You'll get public links. Copy https one for later use.

# How to setup the Slack Bot ?

[Please have a look at the details here](docs/SLACK_BOT.md)

## Usage

1. Become a manager:
   `/vacabot manager`
2. Create leave request:
   `/vacabot`
3. Check leave balance of an employee
   `/vacabot @username`

## Slack Community

Here you can try out the vacabot bot already installed and being used.
[Joining link](https://join.slack.com/t/hacktoberfestindia/shared_invite/zt-ifcel7xs-Bnv2Vk73MmtU7xKU~nvSaQ) (valid until 10th November)

## How to Contribute

These are guidelines you can follow:

1. Branch name can follow this pattern:\
   `feature/<ISSUE_NUMER>-feature-title`\
   `bug/<ISSUE_NUMER>-bug-title`\
   `documentation/<ISSUE_NUMER>-title`
2. Commit msgs pattern:\
   `feature: adds support for new commands`\
   `fix: allows edge cases for users`\
   `chores: adds instructions to run locally`
3. Don't create PR from your forked master branch.
4. Link issues in your PR.
5. Optional. Join the slack community given above to try out the bot.
