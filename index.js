let koa = require('koa');
let logger = require('koa-logger');
let bodyParser = require('koa-bodyparser');
let request = require('co-request');
let route = require('koa-route');

let generateMessage = require('./message_generator');
require('./es6-template');

let app = koa();
app.use(logger());
app.use(bodyParser());


app.use(route.post('/hook/:id', function *(hook_id) {
  let payload = this.request.body;

  // Is not a Rollbar event
  if(!payload || !payload.event_name) return this.status = 400;

  let msg = yield generateMessage(payload);

  let result = yield request({
    uri: 'https://fleep.io/hook/' + hook_id,
    method: 'POST',
    form: { message: msg }
  });

  this.status = 200;
  console.log('Sent to fleep:\n%s\nGot: %s\n\n', msg, result.statusCode);
}));


app.listen((process.env.PORT || 5000));
