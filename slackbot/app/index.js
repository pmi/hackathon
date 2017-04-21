// Require libraries.
const botkit = require('botkit'),
    settings = require('../settings'),
    create = require('./create');


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
    create.create({
        title:     message.match[2],
        body:      undefined,
        assignees: [message.match[3]],
        milestone: undefined,
        labels:    message.match[1] || 'issue'
    }, message.match[4]).then(function (response) {
        bot.reply(message, response);
    }).catch(function(error) {
        bot.reply(message, `Oops! ${error}`);
    });
});

// Start real-time messaging.
slackBot.startRTM();
