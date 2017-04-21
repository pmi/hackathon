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
    bot.reply(message, 'Working, Human!');

    create.create({
        title:     message.match[2],
        body:      undefined,
        assignees: [message.match[3]],
        milestone: undefined,
        labels:    message.match[1]
    }, message.match[4]).then(function (response) {
        console.log(response);
    });
});

// Start real-time messaging.
slackBot.startRTM();
