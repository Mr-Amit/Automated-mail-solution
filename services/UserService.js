const mongoose = require('mongoose')
const EmailService = require('./EmailService')

module.exports = {
    deleteUserSession: async (sessionId) => {
        const db = mongoose.connection.db;
        const result = await db.collection('sessions').deleteOne({ '_id': sessionId });
        console.log(result.result);
        if (result.result.ok == 1) {
            return true;
        } else {
            return false;
        }
    },


    initateEmailProcessing: async (user) => {
        // console.log({ user });
        const emailService = new EmailService(user);
        let label_present = await emailService.createLabelIfDoesNotExist();
        if (!label_present) {
            console.error('Something went wrong, could not create label');
        }
        let emails = await emailService.getAllMails();
        let mailidsToBeModified = []
        if (!emails) {
            return { success: false, message: "Error in retrieving mail" };
        }
        for (let i = 0; i < emails.length; i++) {
            const emailObj = emails[i];
            const threadId = emailObj.threadId;
            let { hasNoReply, mailData } = await emailService.checkIfMailHasNoReply(threadId);
            // console.log({ mailData });
            const headers = mailData.messages[0].payload.headers;
            const sender = headers.find(header => header.name === 'From');
            if (sender) {
                console.log('Sender:', sender.value);
            } else {
                console.log('Sender information not found.');
                continue;
            }
            if (!hasNoReply) {
                let message = "Hello from the other side";
                let subject = "This is my subject";
                let labelIds = ["LISTED_REPLIES"];
                let { emailSent, mailData} = await emailService.sendMailToUser(threadId, labelIds, subject, message, sender.value);
                if (!mailData.labelIds.includes("LISTED_REPLIES")) {
                    mailidsToBeModified.push(emailObj.id);
                }
                // console.log({ mailData });
            }
        }
    }
}
