const request = require('request'),
    settings = require('../settings'),
    moment = require('moment');

/**
 * Finds a github issues
 * @param searchRequest : {user:string, repo:string, date: Date}
 */
module.exports.search = function search(searchRequest) {
    const url = `${settings.github.api}/repos/${settings.github.owner}/${searchRequest.repo || settings.github.repo}/issues`;

    const properties = {assignee: searchRequest.user};

    const day = moment().day('Monday');

    console.log('-------------------------'+moment().format(day));
    if(searchRequest.date) {
        // properties['since'] = moment().day('Monday')//'2017-04-15'//searchRequest.date;
    }

    const options = {
        url: url,
        method: 'GET',
        qs: properties,
        headers: {
            'User-Agent': 'Super Agent/0.0.1',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    };

    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                reject(error);
            }

            let result = '';

            const json = JSON.parse(body);

            if (typeof json == 'object' && json.length) {
                json.forEach((issue) => {
                    result += issue.title + '\n' + issue.html_url + '\n';
                });
            }

            resolve(result);
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
        const pattern = /\s+((?:@)([a-zA-Z]+)|(me))/i;
        const match = pattern.exec(message);

        return match ? match[3] ? match[3] : match[2] ? match[2] : 'me' : 'me';
    }
}

