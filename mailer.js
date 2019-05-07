//mailer.js
const axios = require('axios'),
	  mandrillJson = require("./mandrill.json"),
	  sendgridJson = require("./sendgrid.json");

const MANDRILL_API_KEY = 'xxx';
const SENDGRID_API_KEY = 'xxx';

const MANDRILL_SEND_URL = 'https://mandrillapp.com/api/1.0/messages/send.json';
const SENDGRID_SEND_URL = 'https://api.sendgrid.com/v3/mail/send';

module.exports = {

	// the API other classes use to send the email
	// the default email service is mandrill, while the backup service is sendgrid
	send_email: async function (toAddress, toName, fromAddress, fromName, subject, body, useBackupService) {
		return await useBackupService 
			? send_email_sendgrid(toAddress, toName, fromAddress, fromName, subject, body) 
			: send_email_mandrill(toAddress, toName, fromAddress, fromName, subject, body);
	}
}

// configure the request to send the message via sendgrid
async function send_email_sendgrid (toAddress, toName, fromAddress, fromName, subject, body) {
	update_sendgrid_sending_json(toAddress, toName, fromAddress, fromName, subject, body);
	return await send_email(
		{'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SENDGRID_API_KEY},
		sendgridJson,
		SENDGRID_SEND_URL);
}

// update the mail-sending json with the fields given by the user
function update_sendgrid_sending_json (toAddress, toName, fromAddress, fromName, subject, body) {
	sendgridJson.personalizations[0].to[0].email = toAddress;
	sendgridJson.personalizations[0].to[0].name = toName;
	sendgridJson.from.email = fromAddress;
	sendgridJson.from.name = fromName;
	sendgridJson.subject = subject;
	sendgridJson.content[0].value = body;
}

// configure the request to send the message via mandrill
async function send_email_mandrill (toAddress, toName, fromAddress, fromName, subject, body) {
	update_mandrill_sending_json(toAddress, toName, fromAddress, fromName, subject, body);
	return await send_email({'Content-Type': 'application/json'}, mandrillJson, MANDRILL_SEND_URL);
}

// update the mail-sending json with the fields given by the user
function update_mandrill_sending_json (toAddress, toName, fromAddress, fromName, subject, body) {
	mandrillJson.key = MANDRILL_API_KEY;
	mandrillJson.message.to[0].email = toAddress;
	mandrillJson.message.to[0].name = toName;
	mandrillJson.message.from_email = fromAddress;
	mandrillJson.message.from_name = fromName;
	mandrillJson.message.subject = subject;
	mandrillJson.message.text = body;
	mandrillJson.message.html = '';
}

// send the email
async function send_email (headers, json, url) {
	try {
		const answer = await axios.post(url, json, {headers: headers});
		return answer;
	}
	catch (error) {
		console.error(error);
		return error;
	}
}