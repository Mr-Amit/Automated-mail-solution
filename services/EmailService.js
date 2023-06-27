const { google } = require('googleapis');
const myCache = require('../lib/cache-store');
const util = require('../helper/email-utility')
const oAuth2Client = new google.auth.OAuth2();

class EmailService {

    constructor (user) {
      this.user = user;
      oAuth2Client.setCredentials({
        access_token: user.accessToken
      });
      this.gmailClient = google.gmail({ version: 'v1', auth: oAuth2Client });
    }

    async createLabelIfDoesNotExist() {
      try {
        const res = await this.gmailClient.users.labels.list({
          userId: 'me',
        });
    
        const labels = res.data.labels;
        // console.log('User Labels:', labels);
        for (let i = 0; i < labels.length; i++) {
            const name = labels[i].name;
            if (name == "LISTED_REPLIES") return true;
        }

      } catch (error) {
          console.error('Error fetching labels:', error.message);
          return false;
      }
      
      try {
        const res = await this.gmailClient.users.labels.create({
          userId: 'me',
          resource: {
            labelListVisibility: 'labelShow',
            messageListVisibility: 'show',
            name: "LISTED_REPLIES",
          },
        });
    
        const label = res.data;
        console.log('Label created:', label);
        return true;
      } catch (error) {
        console.error('Error creating label:', error.message);
      }
      return false;
  }

    async getAllMails() {
      try {
        let email = this.user.email;
        let search_query = 'in:inbox -from:me';
        let after = await myCache.get(`${email}:after`);
        if (after) search_query += ' after:' + after;
        let before = await myCache.get(`${email}:before`);
        if (before) search_query += ' before:' + before;
        const res = await this.gmailClient.users.messages.list({
          userId: 'me',
          maxResults: 10, // Maximum number of emails to fetch
          q: search_query, // Custom search query, modify as needed
        });
      
        const emails = res.data.messages;
        // console.log(res.data);
        // console.log('User Emails:', emails);
        return emails;
      } catch (error) {
        console.error('Error fetching emails:', error.message);
      }
    }

    async checkIfMailHasNoReply(threadId) {
      const res = await this.gmailClient.users.threads.get({
        userId: 'me',
        id: threadId,
        format: 'full',
      });
      // console.log(JSON.stringify(res.data, null, 4));
      // res.data = JSON.parse(JSON.stringify(res.data))
      if (res.data.messages.length > 1) {
        return { hasNoReply: false, mailData: res.data};
      }
      return { hasNoReply: true, mailData: res.data }
    }

    async sendMailToUser(threadId, labelIds, subject, message, recipient) {
      try {
        let rawMesage = util.createEmailRaw(subject, message, recipient);
        // console.log({ rawMesage });
        // console.log(threadId);
        const res = await this.gmailClient.users.messages.send({
          userId: 'me',
          requestBody: {
            threadId: threadId,
            labelIds,
            raw: rawMesage
          },
        });
    
        // console.log('Email sent to thread:', res.data);
        return { emailSent: true, mailData: res.data}
      } catch (error) {
        console.error('Error sending email to thread:', error.message);
        return { emailSent: false, mailData: res.data}
      }
    }

    async addLabelsToTheEmails(emailIds, labelIds) {
      
    }


}

module.exports = EmailService;