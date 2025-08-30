const sendSms = (phone, message) => {
  console.log(`Successfully sent SMS to: ${phone}`);
  console.log(`Message: ${message}`);
  return { success: true };
};

module.exports = { sendSms };