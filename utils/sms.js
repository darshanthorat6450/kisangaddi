const axios = require('axios');

async function sendSMS(mobile, message) {
  try {
    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: process.env.FAST2SMS_API_KEY,
        message: message,
        language: 'english',
        route: 'q',
        numbers: mobile
      }
    });
    console.log('SMS sent ✅', response.data);
    return true;
  } catch (error) {
    console.log('SMS error:', error.message);
    return false;
  }
}

module.exports = sendSMS;