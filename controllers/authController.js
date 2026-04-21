// controllers/authController.js
const { generateOTP, saveOTP, verifyOTP } = require('../services/otpService');
const { sendSMS } = require('../services/twilioService');

exports.sendOtp = async (req, res) => {
  const { phone } = req.body;
  const otp = generateOTP();

  saveOTP(phone, otp);
  await sendSMS(phone, `Your OTP is ${otp}`);

  res.json({ message: 'OTP sent' });
};

exports.verifyOtp = (req, res) => {
  const { phone, otp } = req.body;

  if (!verifyOTP(phone, otp)) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  res.json({ message: 'Verified' });
};