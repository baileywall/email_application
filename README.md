# email_app

## installation instructions

The only thing that needs to be installed for the application to work is [Node.js](https://nodejs.org/en/download/).

In order for the application to work, you must set the respective API tokens sent to you by email in `config/config.json`.

Once Node is installed, the application can be started by running `node server.js` on the command line.

It will then receive HTTP POST requests sent to `localhost:3000/email`.

NOTE that because of strict authentication requirements for send addresses, the emails to either client will only send if from field is `bailey@waffles.biz` (a custom domain I created for this exercise).

## design decisions

I used Node.js because it seemed like the most straightforward way to get a server up and running, and to make it easily usable on other machines.

Most of my previous experience is in Java, so I relied heavily on [this Node.js resource](https://codeburst.io/the-only-nodejs-introduction-youll-ever-need-d969a47ef219) which recommended using the Express framework. It made receiving the POST requests fairly uncomplicated, and makes setting up the server a little cleaner by handling the routing-related error handling.

I used the [body-parser](https://github.com/expressjs/body-parser) library to parse the JSON data in the post requests.

I used [striptags](https://www.npmjs.com/package/striptags) to remove the HTML markup from the text of the email.

I used the [axios](https://github.com/axios/axios) library to send the POST requests to the different email clients.

## email clients

Mandrill is set up to be the default email client.

I tried to set up a MailGun account, but my domain was blacklisted and Customer Support wanted me to prove I was a business so I set up an account with SendGrid instead, which is set up to be the backup client.

### changing the client

To change the client from Mandrill to SendGrid, change `backup_email_service` in `config/config.json` to be `true` and restart the application with `node server.js`.

## testing

I tested this application with this curl command:

```curl -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{"to": "be.stone.wall@gmail.com", "to_name": "Bailey Wall", "from": "bailey@waffles.biz", "from_name": "Bailey Waffles", "subject": "Regarding Waffles", "body": "<h1>YourBill</h1><p>$10</p>"}' localhost:3000/email```

I also created some test cases to ensure parameter validation reasonably works (e.g. ensures all parameters are present, and that email addresses are well-formed as `example@domain.xyz`):

```curl --verbose -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{"to": "poorlyformattedemail.com", "to_name": "Mr. Fake", "from": "noreply@mybrightwheel.com", "from_name": "Brightwheel", "subject": "A Message From Brightwheel", "body": "<h1>YourBill</h1><p>$10</p>"}' localhost:3000/email```

```curl --verbose -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{"to": "poorlyformatted@email", "to_name": "Mr. Fake", "from": "noreply@mybrightwheel.com", "from_name": "Brightwheel", "subject": "A Message From Brightwheel", "body": "<h1>YourBill</h1><p>$10</p>"}' localhost:3000/email```

```curl --verbose -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{"to": "poorlyformatted@email.com", "to_name": "Mr. Fake", "from": "noreply@mybrightwheel.com", "from_name": "Brightwheel", "body": "<h1>YourBill</h1><p>$10</p>"}' localhost:3000/email```

## next steps

If I had more time, the first thing I would want to do is create a cleaner system of creating the POST requests that I send to the email clients. It would be ideal if a third or fourth email service could be easily added, but the way the application is structured right now makes that impossible.

With even more time, I would want to think more about how the program is waiting on the email services. This is the most obvious place I see the program having an issue with scaling. With a language like Java I think creating threads would be a good solution, but with Node.js I would need to investigate more.