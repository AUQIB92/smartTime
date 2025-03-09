import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const client = twilio(accountSid, authToken);

/**
 * Send SMS alert to a teacher about upcoming class
 * @param {string} phoneNumber - Teacher's phone number
 * @param {string} message - SMS message content
 * @returns {Promise} - Twilio message response
 */
export async function sendSMS(phoneNumber, message) {
  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber
    });
    
    console.log(`SMS sent to ${phoneNumber}: ${result.sid}`);
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

/**
 * Format class alert message
 * @param {Object} classInfo - Class information
 * @returns {string} - Formatted message
 */
export function formatClassAlertMessage(classInfo) {
  const { subject, classroom, startTime } = classInfo;
  
  return `REMINDER: You have a ${subject.name} class in Room ${classroom.name} starting at ${startTime}. Please be on time.`;
} 