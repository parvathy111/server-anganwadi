
const accountSid = process.env.TWILIO_ACCOUNT_ID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);



function sendwhatsappMessage({ message, phone }) {
console.log(phone)
    client.messages
        .create({
            from: 'whatsapp:+14155238886',
            body: message,
            to: `whatsapp:${phone}`
        })
        .then(message => console.log(message.sid))
        .catch(err => console.error("Failed to send message:", err));
}

module.exports = { sendwhatsappMessage };