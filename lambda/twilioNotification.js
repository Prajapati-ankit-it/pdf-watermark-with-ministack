// Twilio SMS Notification Handler - Completely Separate Module
const { sendSMS } = require('../services/twilioService');
const { log } = require('../utils/logger');

// This function handles SMS notifications independently
const handleSMSNotification = async (phone, outputKey) => {
  if (!phone) {
    log('sms_skipped', { reason: 'no_phone_provided' });
    return;
  }

  // Normalize phone number
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Validate phone format
  if (!/^[\+]?[1-9]\d{9,14}$/.test(cleanPhone)) {
    log('sms_invalid_format', { phone: cleanPhone.replace(/\d/g, '*') });
    return;
  }

  // Send SMS notification
  try {
    const message = `Your PDF is ready. Key: ${outputKey}`;
    await sendSMS(cleanPhone, message);
    log('sms_notification_sent', { phone: cleanPhone.replace(/\d/g, '*') });
  } catch (error) {
    log('sms_notification_failed', { error: error.message });
  }
};

module.exports = {
  handleSMSNotification
};
