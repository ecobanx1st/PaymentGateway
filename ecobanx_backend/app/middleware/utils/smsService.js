const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSmsOtp = async (phone, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your Jokko verification OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone, // must be in international format +countrycode
    });

    console.log("SMS sent:", message.sid);
    return true;

  } catch (error) {
    console.error("Twilio SMS Error:", error.message);
    return false;
  }
};

module.exports = { sendSmsOtp };
