// services/twilioService.js
const twilio = require('twilio');
const { log, logError } = require('../utils/logger');

// Initialize Twilio client only if credentials are available
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

const sendSMS = async (to, message) => {
  // Skip if Twilio is not configured
  if (!client) {
    log('twilio_skip', { reason: 'credentials_missing' });
    return false;
  }

  // Normalize phone number (remove spaces, dashes, parentheses)
  // Ensure string
if (typeof to !== 'string') {
  log('sms_invalid_type', { receivedType: typeof to });
  return false;
}

// Normalize
const cleanPhone = to.replace(/[\s\-\(\)]/g, '');

  // Log configuration for debugging
  log('sms_attempt', { 
    to: to.replace(/\d/g, '*'), 
    from: process.env.TWILIO_PHONE?.replace(/\d/g, '*') || 'not_configured',
    hasClient: !!client 
  });

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: cleanPhone
    });

    log('sms_sent', { to: cleanPhone.replace(/\d/g, '*'), sid: result.sid });
    return true;
  } catch (error) {
    // Handle specific Twilio errors with better logging
    if (error.code === '21614') {
      logError('sms_country_mismatch', error, { 
        to: cleanPhone.replace(/\d/g, '*'), 
        from: process.env.TWILIO_PHONE?.replace(/\d/g, '*'),
        message: 'Phone number country not supported or Twilio number not SMS-enabled'
      });
    } else if (error.code === '21612') {
      logError('sms_invalid_to', error, { 
        to: cleanPhone.replace(/\d/g, '*'), 
        message: 'Invalid phone number format'
      });
    } else if (error.code === '21408') {
      logError('sms_permission_denied', error, { 
        message: 'Twilio account does not have SMS permissions'
      });
    } else {
      logError('sms_failed', error, { 
        to: cleanPhone.replace(/\d/g, '*'), 
        errorCode: error.code,
        errorMessage: error.message
      });
    }
    return false;
  }
};

module.exports = {
  sendSMS
};
