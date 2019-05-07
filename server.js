//server.js
const express = require('express'),
      server = express(),
      bodyParser = require('body-parser'),
      striptags = require('striptags'), 
      mailer = require('./mailer.js'),
      config = require('./config/config.json');

server.use(bodyParser.json());

const PORT_NUMBER = 3000;
server.set('port', process.env.PORT || PORT_NUMBER);

// Receive the request
server.post('/email',(request,response)=>{
	const toAddress = request.body.to;
	const toName = request.body.to_name;
	const fromAddress = request.body.from;
	const fromName = request.body.from_name;
	const subject = request.body.subject;
	var body = request.body.body;
	if (!params_are_valid(toAddress, toName, fromAddress, fromName, subject, body)) {
		response.send(
			'invalid request: ' + toAddress + ' ' + toName + ' ' + fromAddress + ' ' + fromName + ' ' + subject + ' ' + body + '\n');
	}
	else {
		body = striptags(body);
		useBackupService = config.backup_email_service;
		const serviceUsed = useBackupService ? 'backup' : 'default';

		mailer.send_email(toAddress, toName, fromAddress, fromName, subject, body, useBackupService)
			.then((result) => {
				if (result.status != 200 && result.status != 202) {
					response.send('Failed to send email via ' + serviceUsed + ' service.\n');
				}
				else {
					response.send('Successfully sent email to ' + toName + ' (' + toAddress + ') from ' 
						+ fromName + ' (' + fromAddress + ') via ' + serviceUsed + ' service.\n');
				}
			});
  	}
});

// Ensure that the parameters are valid to construct emails with
function params_are_valid(toAddress, toName, fromAddress, fromName, subject, body) {
	return email_is_valid(toAddress)
		&& email_is_valid(fromAddress) 
		&& toName != undefined 
		&& fromName != undefined 
		&& subject != undefined 
		&& body != undefined;
}

// Ensure that the email address is well-formed, e.g. that there is an @ sign somewhere after some characters
// and a . somewhere after it with some characters at the end 
function email_is_valid(emailAddress) {
	if (emailAddress == undefined) {
		return false;
	}
	const atIndex = emailAddress.indexOf('@');
	const dotIndex = emailAddress.lastIndexOf('.');
	return atIndex > 0 
		&& atIndex < (emailAddress.length - 2) 
		&& dotIndex > atIndex 
		&& dotIndex < (emailAddress.length - 1);
}

// Express error handling middleware
server.use((request,response)=>{
   response.type('text/plain');
   response.status(505);
   response.send('Error page');
});

// Binding to a port
server.listen(PORT_NUMBER, ()=>{
  console.log('Express server started at port ' + PORT_NUMBER);
});
