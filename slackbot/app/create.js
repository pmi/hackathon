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
            form:    issue
        };

    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                reject(error);
            }

            let json = JSON.parse(body);
            resolve(json);
        });
    });
};

module.exports.regex = /^(?:create) (bug|issue|task)?([\w\s:\-+]{3,}?(?= in| for|$))(?: for (me|@\w+))?(?: in (\w+))?/gm;