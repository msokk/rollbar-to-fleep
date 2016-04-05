### Send [Rollbar](https://rollbar.com/) errors and deployment messages to [Fleep](https://fleep.io/)
##### Local setup:
1. Install Node 5.x
2. Run `npm install`
3. Run `npm start` or `ROLLBAR_TOKEN=abc npm start` (fetches project metadata)

##### Deployment to Google Cloud:
1. Set `ROLLBAR_TOKEN` env variable with a global Rollbar read token to get project
names in message and more.
2. Push app
3. Configure Webhook url in Rollbar project settings as: `http://<appname>.appspot.com/hook/<fleep_hook_id>`
4. Hit the Rollbar hook test button
