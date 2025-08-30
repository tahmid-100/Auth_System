const sendEmail = (email, body) => {
  console.log(`Successfully sent email to: ${email}`);
  console.log(`Body: ${body}`);
  return { success: true };
};

module.exports = { sendEmail };