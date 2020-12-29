# Lambda Surf
Automate surfing the web so you don't have to, with AWS Lambda, headless Chrome, Puppeteer and Slack. 

There is an [accompanying blog post](https://blog.peasey.co.uk/blog/using-aws-lambda-and-slack-to-browse-the-web-so-you-dont-have-to) for this repo with background, implementation notes and demos.

# Setup and Installation
Clone the repo and install the dependencies:

```bash
npm install
```

# Configuration
The solution uses [dotenv](https://www.npmjs.com/package/dotenv) for configuration, so you will need to create a `.env` file in the root of the repo with the following configuration settings:

| Variable | Comment
|---|---
| ENVIRONMENT | Used in the naming convention of AWS resources to differentiate environments between deployments, typically set to something like `test` or `prod`.
| TASKS_LOCATION | Used by the plugin task provider as the directory location to load tasks from, in the demo it's set to `../../tasks` or `../../test-tasks`
| SLACK_ENDPOINT | Used by the Slack notifier and should be set to the Webhook endpoint for your Slack App's channel Webhook (see configuring Slack below).
| AWS_REGION | Depending on your local setup/configuration, you may need to set your preferred AWS region as an envionment variable to run it locally.

## AWS
The solution provisions resources in AWS, so you'll need an account with appropiate access credentials configured locally as your default profile. See the [documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) for further info.
## Serverless Framework
The solution uses the serverless framework to define and provision AWS resources, see the [documentation](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/) for further info.

## Slack
You'll need a Slack account in a workspace where you have permission to create apps and channels (you can [create one for yourself](https://slack.com/intl/en-gb/help/articles/206845317-Create-a-Slack-workspace)).

### 1. Create a channel
In Slack, do something similar to:

- Click **Add Channels**
- Click **Create a new channel**
- Enter a **Name**, i.e. *lambda-surf*
- Enter a **Description**, i.e. *Channel for notifications from Lambda Surf*
- Click **Create**

### 2. Create an app
In a browser, sign in to Slack and go to: https://api.slack.com/apps/, and do something similar to:

- Click **Create New App**
- for **App Name** Enter a name, i.e. *Lambda Surf*
- Choose your workspace from **Development Slack Workspace**
- Click **Create App**
- Click **Incoming Webhooks**
- Toggle **Activate Incoming Webhooks** on
- Click **Add New Webhook to Workspace**
- Select the channel you created earlier and click **Allow**
- Copy the Webhook URL and set it as the value of the `SLACK_ENDPOINT` variable in your `.env` file

# Deployment
## Deploy the scheduling test
To deploy the event schedule test demo from the blog post, configure the environment with the following settings:

```
TASKS_LOCATION=../../test-tasks
```

Then deploy it:

```bash
npm run deploy
```

Now wait for the notifications to ping.

To remove it:

```bash
npm run remove
```

## Deploy the footy gossip and Xbox Series X tasks
To deploy the footy gossip and Xbox Series X demo from the blog post, configure the environment with the following settings:

```
TASKS_LOCATION=../../tasks
```

Then deploy it:

```bash
npm run deploy
```

Now wait for the notifications to ping.

Again, to remove it:

```bash
npm run remove
```

# Development and Testing
If you want to modify the solution and/or add your own tasks, copy an existing task and modify it as you wish. You can test locally with the following commands:

## Individual task
During development it's useful to test your task in isolation with a fast feedback cycle, you can test an individual task with the following command:

```
node testing/integration/tasks/individual.js [task-path]
```

Replace [task-path] with the path to your task (relative to the test script), i.e. ../../../src/tasks/my-task.js

## All tasks
You may want to test what the Lambda function will do when a specific schedule is invoked, for that you can use the following command:

```
node testing/integration/tasks/invoke.js [schedule]
```

Replace [schedule] with your desired schedule, i.e. 'rate(1 hour)'

## TDD/Unit tests
It's even quicker to develop your task using TDD and unit tests, follow the pattern from an existing test and run the following command to test it:

```
npx jest [test-path]
```

Replace [test-path] with the path to your test, i.e. src/tasks/my-task.test.js

You will need to ensure you abstract your dependencies appropriately, for that, follow the `context` pattern in the existing tasks/tests.
