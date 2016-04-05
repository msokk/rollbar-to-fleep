const koa = require('koa');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const request = require('co-request');
const route = require('koa-route');

const generateMessage = require('./message_generator');

const app = koa();
app.use(logger());
app.use(bodyParser());


app.use(route.post('/hook/:id', function* parseHook(hookId) {
  const payload = this.request.body;

  // Is not a Rollbar event
  if (!payload || !payload.event_name || !payload.data) {
    this.status = 400;
    return;
  }

  const msg = yield generateMessage(payload);

  const result = yield request({
    uri: `https://fleep.io/hook/${hookId}`,
    method: 'POST',
    form: { message: msg },
  });

  this.status = 200;
  console.log('Sent to fleep:\n%s\nGot: %s\n\n', msg, result.statusCode); // eslint-disable-line
}));


app.listen((process.env.PORT || 5000));
