const request = require('request'),
    settings = require('../settings');

/**
 * Creates a github issue
 * @param repo
 * @param issue
 * - title
 * - body
 * - assignees
 * - milestone
 * - labels
 */
module.exports.create = function (issue, repo) {

    const url = `${settings.github.api}/repos/${settings.github.owner}/${repo || settings.github.repo}/issues`,
        options = {
            url:     url,
            method:  'POST',
            headers: {
                'User-Agent':   'Super Agent/0.0.1',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            auth:    {
                'bearer': settings.github.token
            },
            json:    issue
        };

    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            if (error || response.statusCode !== 201) {
                reject(error || body && body.message);
            }
            resolve(body.html_url);
        });
    });
};

module.exports.regex = /^(?:create)(bug|issue|task)?([\w\s:\-+!]{3,}?(?=\sin|\sfor|$))?(?:\sfor\s(me|\w+))?(?:\sin\s(\w+))?/i;