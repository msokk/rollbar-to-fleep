### Transform Rollbar webhook to Fleep webhook
##### Local usage:
1. Install Node 0.12
2. Run `npm install`
3. Run `npm start`


##### Deployment on Heroku:
1. Create and push app to Heroku
2. Set `ROLLBAR_TOKEN` env variable with a global Rollbar read token to get project
names in message and more.
3. Configure Webhook url in Rollbar project settings as: `http://<appname>.herokuapp.com/hook/<fleep_hook_id>`
