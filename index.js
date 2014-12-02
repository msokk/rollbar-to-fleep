var express = require('express'),
    util = require('util'),
    bodyParser = require('body-parser'),
    app = express(),
    request = require('superagent');

app.use(bodyParser.json());
app.set('port', (process.env.PORT || 5000));

// Secret not set - exit
if(!process.env.SECRET) return;

var deploy_template = '*%s* deployed to *%s* revision %s<<%s>>',
    error_template = '%s on *%s* reported to %s<<Rollbar>>:\n%s';


app.post('/:secret/:hook_id', function(req, res) {
  console.log(req.body);
  var msg = '',
      data = req.body.data;

  // New deploy
  if(req.body.event_name === 'deploy') {
    data = data.deploy;

    msg = util.format(deploy_template, data.local_username, data.environment,
      'https://github.com/' + req.param('github') + '/commit/' + data.revision,
      data.revision.substring(0, 9));
  }

  // New error
  if(req.body.event_name === 'new_item') {
    data = data.item;
    var last_err = data.last_occurrence,
        level = last_err.level[0].toUpperCase() + last_err.level.slice(1);

    msg = util.format(error_template, level, data.environment,
      'https://rollbar.com/item/uuid?uuid=' + last_err.uuid, data.title);
  }

  // Test notification
  if(req.body.event_name === 'test') msg = data.message;

  request
    .post('https://fleep.io/hook/' + req.param('hook_id'))
    .send({ message: msg })
    .end(function(error, response) {
      res.status(200).end();
      if(error === null) return console.log('OK!');
      console.log(response);
    });
});

app.listen(app.get('port'), function() {
  console.log("Proxy is running at localhost:" + app.get('port'));
});
