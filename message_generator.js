'use strict';

const request = require('co-request');
const DUMMY_PROJECT = { name: 'A project' };

/**
 * Get proper emoji for error level
 */
function getEmoji(level) {
  switch (level) {
    case 'debug':
    case 'info':
      return 'ℹ️';
    case 'warning': return '⚠️';
    case 'critical':
    case 'error':
      return '⛔️';
    default: return '❔';
  }
}

/**
 * Fetch Rollbar project data
 */
function* fetchProject(id) {
  if (!process.env.ROLLBAR_TOKEN) return DUMMY_PROJECT;

  const result = yield request({
    uri: `https://api.rollbar.com/api/1/project/${id}`,
    qs: { access_token: process.env.ROLLBAR_TOKEN },
    json: true,
  });

  return result.body.result || DUMMY_PROJECT;
}

/**
 * Format item message
 */
function formatItemMsg(event, data) {
  const lastErr = data.last_occurrence;

  let msg = `${getEmoji(lastErr.level)} *${data.project.name}* ` +
            `${lastErr.level} on *${data.environment}*`;

  switch (event) {
    case 'exp_repeat_item': // Repeating
      msg += ` happened for the ${data.total_occurrences}th time`;
      break;
    case 'resolved_item': // Resolved
      msg += ' was *resolved* ✅';
      break;
    case 'reopened_item': // Reopened
      msg += ' was *reopened*';
      break;
    case 'reactivated_item': // Reactivated
      msg += ' was *reactivated* 💩';
      break;
    default: break;
  }

  return `${msg}:\nhttps://rollbar.com/item/uuid?uuid=${lastErr.uuid}<<#${data.counter}>> ${data.title}`;
}

/**
 * Generate suitable message for Fleep
 */
module.exports = function* messageGenerator(payload) {
  let data = payload.data;
  const event = payload.event_name;

  if (event.endsWith('_item')) data = data.item;
  if (event.endsWith('deploy')) data = data.deploy;

  // Populate project data
  if (data.project_id) data.project = yield fetchProject(data.project_id);

  switch (event) {
    case 'exp_repeat_item':
    case 'new_item':
    case 'resolved_item':
    case 'reopened_item':
    case 'reactivated_item':
      return formatItemMsg(event, data);
    case 'test':
      return `*Rollbar test*: ${data.message}`;
    default:
      return `Unknown event *${event}*: ${JSON.stringify(data, null, 2)}`;
  }
};
