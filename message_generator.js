let request = require('co-request');

/**
 * Get proper emoji for error level
 */
let getEmoji = function(level) {
  switch(level) {
    case 'debug':
    case 'info':
      return 'ℹ️';
    case 'warning':
      return '⚠️';
    case 'critical':
    case 'error':
      return '⛔️';
  }
};


const DUMMY_PROJECT = { name: 'A project' };

/**
 * Fetch Rollbar project data
 */
let fetchProject = function* (id) {
  if(!process.env.ROLLBAR_TOKEN) return DUMMY_PROJECT;

  let result = yield request({
    uri: 'https://api.rollbar.com/api/1/project/' + id,
    qs: { access_token: process.env.ROLLBAR_TOKEN },
    json: true
  });

  if(!result.body.result) return DUMMY_PROJECT;
  return result.body.result;
};


/**
 * Generate suitable message for Fleep
 */
module.exports = function* (payload) {
  let data = payload.data,
      event = payload.event_name;

  if(event.endsWith('_item')) data = data.item;
  if(event.endsWith('deploy')) data = data.deploy;

  // Populate project data
  if(data.project_id) data.project = yield fetchProject(data.project_id);

  switch(event) {
    case 'exp_repeat_item':
    case 'new_item':
      var last_err = data.last_occurrence;

      var msg = '${emoji} *${name}* ${level} on *${env}*'.template({
        name: data.project.name,
        level: last_err.level,
        env: data.environment,
        emoji: getEmoji(last_err.level)
      });

      // Repeating
      if(event === 'exp_repeat_item')
        msg += ' happened for the ${n}th time'.template({ n: data.total_occurrences });

      return msg + ':\n\t${url}<<#${count}>> ${title}'.template({
        url: 'https://rollbar.com/item/uuid?uuid=' + last_err.uuid,
        count: data.counter,
        title: data.title
      });

    case 'resolved_item':
    case 'reopened_item':
    case 'reactivated_item':
      return 'TODO: ' + event;

    case 'deploy':
      return '🕓 *${name}* was deployed to *${env}*\n\trevision ${url}<<${rev}>> by _${user}_'.template({
        name: data.project.name,
        env: data.environment,
        url: 'https://rollbar.com/deploy/' + data.id,
        rev: data.revision.substring(0, 9),
        user: data.local_username
      });

    case 'test':
      return JSON.stringify(payload);

    default:
      return 'Unknown message: ' + JSON.stringify(payload);
  }
};
