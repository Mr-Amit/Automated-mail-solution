
const util = {}

util.createEmailRaw = (subject, message, recipientEmail) => {

    const emailLines = [];
    emailLines.push(`To: ${recipientEmail}`);
    emailLines.push(`Subject: ${subject}`);
    emailLines.push('Content-Type: text/plain; charset=utf-8');
    emailLines.push('');
    emailLines.push(message);

    return Buffer.from(emailLines.join('\n')).toString('base64');
}

module.exports = util;