var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    request = require('superagent');

app.use(bodyParser.json());

if(!process.env.HOOK_ID || !process.env.FLEEP_HOOK_ID) return;

var github_repo = process.env.GITHUB_REPO || 'dummy/dummy';

app.set('port', (process.env.PORT || 5000));

app.post('/' + process.env.HOOK_ID, function(req, res) {
  console.log(req.body);
  var msg = '',
      data = req.body.data;

  if(req.body.event_name === 'deploy') {
    data = data.deploy;

    msg = '*' + data.local_username + '* deployed *' + data.environment +
      '* revision _' + data.revision.substring(0, 9) +
      '_ \nhttps://github.com/' + github_repo + '/commit/' + data.revision;
  }

  if(req.body.event_name === 'new_item') {
    data = data.item;
    var last_err = data.last_occurrence;

    msg = last_err.level[0].toUpperCase() + last_err.level.slice(1) +
      ': ' + data.title + ' (' + data.environment + ')\n' +
      'https://rollbar.com/item/uuid?uuid=' + last_err.uuid;
  }

  request
    .post('https://fleep.io/hook/' + process.env.FLEEP_HOOK_ID)
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
