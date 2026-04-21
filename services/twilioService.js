// services/twilioService.js
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

exports.sendSMS = async (to, message) => {
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE,
    to
  });
};