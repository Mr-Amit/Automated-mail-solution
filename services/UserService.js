const mongoose = require('mongoose');
const EmailService = require('./EmailService');
const myCache = require('../lib/cache-store')


async function initateEmailProcessing(user) {
	const emailService = new EmailService(user);
	let labelId = await emailService.createLabelIfDoesNotExist();
	if (!labelId) {
		console.error('Something went wrong, could not create label');
	}
	let emails = await emailService.getAllMails();
	let mailidsToBeModified = []
	if (!emails) {
		return { success: false, message: "Error in retrieving mail" };
	}
	let labelIds = [labelId];
	for (let i = 0; i < emails.length; i++) {
		const emailObj = emails[i];
		const threadId = emailObj.threadId;
		let { hasNoReply, mailDetails } = await emailService.checkIfMailHasNoReply(threadId);
		// console.log({ mailDetails });
		const headers = mailDetails.messages[0].payload.headers;
		const sender = headers.find(header => header.name === 'From');
		if (sender) {
			console.log('Sender:', sender.value);
		} else {
			console.log('Sender information not found.');
			continue;
		}
		if (hasNoReply) {
			let message = "Hello from the other side";
			let subject = "This is my subject";
			let { emailSent, mailData } = await emailService.sendMailToUser(threadId, labelId, subject, message, sender.value);
			if (!mailData.labelIds.includes(labelId)) {
				mailidsToBeModified.push(emailObj.id);
			}
			// console.log({ mailData });
		}
	}
	if (mailidsToBeModified.length > 0) {
		let addLabelRes = await emailService.addLabelsToTheEmails(mailidsToBeModified, labelIds);
		if (addLabelRes) {
			console.log('Label added successfully');
		} else {
			console.log('Issue with adding the labels');
		}
	}

	let isUserLoggedIn = await myCache.get(user.email);
	if (isUserLoggedIn) {
		let interval = Math.floor(Math.random() * (120 - 45 + 1)) + 45;
		// interval = 2;
		setTimeout(function () {
			initateEmailProcessing(user)
		}, interval * 1000);
	}

}



module.exports = {
	initateEmailProcessing: initateEmailProcessing
};