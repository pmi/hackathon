// Require libraries.
const botkit = require('botkit'),
    settings = require('../settings'),
    create = require('./create');
const search = require('./search');


// Create slackbot controller.
const controller = botkit.slackbot({
    debug:           true,
    send_via_rtm:    true,
    json_file_store: './db'
});

// Create the slackbot.
const slackBot = controller.spawn({
    // IMPORTANT! Do not check in this token to GIT.
    token: settings.token
});

// Listen for a direct message.
controller.hears([create.regex], ['direct_message', 'direct_mention'], function (bot, message) {
    const title = message.match[2];
    if (!title) {
        bot.reply(message, 'Title is required! \nSyntax: create [issue|task|bug] <title> [for <user>] [in <repo>]');
        return;
    }
    let assignee = message.match[3];
    if (assignee == 'me') {
        assignee = settings.github.user;
    }
    let label = message.match[1];
    create.create({
        title:     message.match[2],
        body:      'Created by bot to be done by humans!',
        assignees: assignee ? [assignee] : undefined,
        labels:    [label || 'issue']
    }, message.match[4])
          .then(function (response) {
              bot.reply(message, `Done! ${response}`);
          })
          .catch(function (error) {
              bot.reply(message, `Oops! ${error}`);
          });
});

controller.hears([/^find/i], ['direct_message', 'direct_mention'], function (bot, message) {

    const searchRequest = search.parseSearchMessage(message.text);
    search.search(searchRequest).then((result) => {
        return bot.reply(message, result)
    }).catch(function (error) {
        bot.reply(message, `Oops! ${error}`);
    });
});

// Start real-time messaging.
slackBot.startRTM();
