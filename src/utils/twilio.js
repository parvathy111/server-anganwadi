
const accountSid = process.env.TWILIO_ACCOUNT_ID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);



const url = 'https://api.wassenger.com/v1/messages';
const apiKey = process.env.WASSENGER_API_KEY;

// function sendwhatsappMessage({ message, phone }) {
// console.log(phone)
//     client.messages
//         .create({
//             from: 'whatsapp:+14155238886',
//             body: message,
//             to: `whatsapp:${phone}`
//         })
//         .then(message => console.log(message.sid))
//         .catch(err => console.error("Failed to send message:", err));
// }

function sendwhatsappMessage({ message, phone }){
    const payload = {
        phone: phone,
        message: message
      };
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': apiKey
        },
        body: JSON.stringify(payload)
      };
      
      fetch(url, options)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(json => {
          console.log('Message sent successfully.');
          console.log('Response:', json);
        })
        .catch(err => {
          console.error('Error:', err.message);
        });
}
module.exports = { sendwhatsappMessage };