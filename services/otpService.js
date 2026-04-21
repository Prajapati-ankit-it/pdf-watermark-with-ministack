// services/otpService.js
const store = new Map(); // replace with Redis in real

exports.generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.saveOTP = (phone, otp) => {
  store.set(phone, { otp, expires: Date.now() + 300000 });
};

exports.verifyOTP = (phone, input) => {
  const data = store.get(phone);
  if (!data || Date.now() > data.expires) return false;
  return data.otp === input;
};