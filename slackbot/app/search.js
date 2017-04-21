const request = require('request'),
    settings = require('../settings'),
    moment = require('moment');

/**
 * Returns a github issues
 * @param searchRequest : {user:string, repo:string, date: Date}
 */
module.exports.search = function search(searchRequest) {
    const url = `${settings.github.api}/repos/${settings.github.owner}/${searchRequest.repo ||
                                                                         settings.github.repo}/issues`;

    const query = {assignee: searchRequest.user};
    if (searchRequest.date) {
        let since = moment();
        switch (searchRequest.date) {
            case 'yesterday':
                since.subtract(1, 'day');
                break;
            case 'today':
                break;
            default:
                since.day(searchRequest.date);
                if (since.isSameOrAfter(Date.now(), 'day')) {
                    since.subtract('7', 'days');
                }
                break;
        }
        query['since'] = since.startOf('day').format();
    }

    const options = {
        url:     url,
        method:  'GET',
        qs:      query,
        headers: {
            'User-Agent':   'Super Agent/0.0.1',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    };

    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            const json = JSON.parse(body);
            if (error || response.statusCode !== 200) {
                reject(error || json && json.message);
            }

            let result = '';
            if (typeof json == 'object' && json.length) {
                json.forEach(function (issue) {
                    result += issue.title + '\n' + issue.html_url + '\n';
                });
            }

            resolve(result.length == 0 ? 'Nothing found :(' : result);
        });
    });
};

/**
 * @param parse message
 *
 * @returns SearchRequest : {user:string, repo:string, date: Date}
 */
module.exports.parseSearchMessage = function parseSearchRequest(message) {
    const user = getUser(message);
    const repo = getRepo(message);
    const date = getDate(message);

    return {user: user, repo: repo, date: date};
};

function getDate(message) {
    const pattern = /\s+((?:since\s+(monday|thuesday|wednesday|thursday|friday|saturday|sunday))|(today|yesterday))\b/i;
    const match = pattern.exec(message);

    return match ? match[3] ? match[3] : match[2] ? match[2] : null : null;
}

function getRepo(message) {
    const pattern = /\s+(?:in\s+)([\w-]+)\b/i;
    const match = pattern.exec(message);

    return match ? match[1] : settings.github.repo;
}

function getUser(message) {
    if (message) {
        const pattern = /\s+for\s+(\w+)/i;
        const match = pattern.exec(message);

        if (match && match[1] != 'me') {
            return match[1];
            // return match ? match[3] ? settings.github.user : match[2] ? match[2] : settings.github.user :
            // settings.github.user;
        }
        return settings.github.user;
    }
}

