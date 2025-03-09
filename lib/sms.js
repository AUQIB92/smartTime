import twilio from 'twilio';

// Get Twilio configuration from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
let twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Format the Twilio phone number to ensure it's in E.164 format
if (twilioPhoneNumber) {
  // Remove any non-digit characters
  const digits = twilioPhoneNumber.replace(/\D/g, '');
  
  // Add + prefix if missing
  if (!twilioPhoneNumber.startsWith('+')) {
    twilioPhoneNumber = digits.length === 10 ? `+1${digits}` : `+${digits}`;
  }
  
  console.log(`Formatted Twilio phone number: ${twilioPhoneNumber}`);
}

// Initialize Twilio client only if configuration is available and valid
let client = null;
let smsEnabled = false;
try {
  if (accountSid && authToken && twilioPhoneNumber && 
      accountSid.trim() !== '' && authToken.trim() !== '' && 
      twilioPhoneNumber.trim() !== '') {
    client = twilio(accountSid, authToken);
    smsEnabled = true;
    console.log('Twilio client initialized successfully');
  } else {
    console.log('Twilio configuration missing or incomplete - running in development mode');
  }
} catch (error) {
  console.error('Error initializing Twilio client:', error);
}

/**
 * Format phone number to E.164 format
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} - Formatted phone number
 */
function formatPhoneNumber(phoneNumber) {
  // Remove any non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Check if the number already has a country code (assuming India +91)
  if (digits.length === 10) {
    return `+91${digits}`; // Add India country code
  } else if (digits.length > 10 && !phoneNumber.startsWith('+')) {
    return `+${digits}`; // Add + if missing
  } else if (phoneNumber.startsWith('+')) {
    return phoneNumber; // Already in E.164 format
  }
  
  // Return with + prefix to ensure E.164 format
  return `+${digits}`;
}

/**
 * Send SMS with OTP
 * @param {string} phoneNumber - User's phone number
 * @param {string} otp - One-time password
 * @returns {Promise} - Twilio message response
 */
export async function sendOTP(phoneNumber, otp) {
  try {
    // Format message
    const message = `Your SmartTime verification code is: ${otp}. This code will expire in 10 minutes.`;
    
    // Always display OTP in console for development/testing
    console.log(`\n=================================================`);
    console.log(`📱 OTP for ${phoneNumber}: ${otp}`);
    console.log(`=================================================\n`);
    
    // Format phone number to E.164
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    
    // Check if SMS sending is enabled and properly configured
    if (!smsEnabled) {
      console.log(`[DEVELOPMENT MODE] SMS sending is disabled. Using console output instead.`);
      return { sid: 'DEVELOPMENT_MODE', status: 'success' };
    }
    
    // Attempt to send SMS via Twilio
    console.log(`Attempting to send OTP via SMS to: ${formattedPhoneNumber}`);
    console.log(`Using Twilio phone number: ${twilioPhoneNumber}`);
    
    try {
      const result = await client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: formattedPhoneNumber
      });
      
      console.log(`SMS sent successfully! SID: ${result.sid}`);
      return result;
    } catch (smsError) {
      console.error('Error sending SMS via Twilio:', smsError);
      console.log('Falling back to console output for OTP');
      return { sid: 'DEVELOPMENT_MODE', status: 'success' };
    }
  } catch (error) {
    console.error('Error in sendOTP function:', error);
    // Return mock success to allow testing without Twilio
    return { sid: 'DEVELOPMENT_MODE', status: 'success' };
  }
}

/**
 * Send class reminder SMS
 * @param {string} phoneNumber - Teacher's phone number
 * @param {Object} classInfo - Class information
 * @returns {Promise} - Twilio message response
 */
export async function sendClassReminder(phoneNumber, classInfo) {
  try {
    // Format message
    const { subject, classroom, startTime } = classInfo;
    const message = `REMINDER: You have a ${subject.name} class in Room ${classroom.name} starting at ${startTime}. Please be on time.`;
    
    // Always display reminder in console for development/testing
    console.log(`\n=================================================`);
    console.log(`📚 Class Reminder for ${phoneNumber}:`);
    console.log(`Subject: ${subject.name}`);
    console.log(`Room: ${classroom.name}`);
    console.log(`Time: ${startTime}`);
    console.log(`=================================================\n`);
    
    // Check if SMS sending is enabled and properly configured
    if (!smsEnabled) {
      console.log(`[DEVELOPMENT MODE] SMS sending is disabled. Using console output instead.`);
      return { sid: 'DEVELOPMENT_MODE', status: 'success' };
    }
    
    // Format phone number to E.164
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    console.log(`Attempting to send reminder via SMS to: ${formattedPhoneNumber}`);
    
    try {
      // Send SMS
      const result = await client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: formattedPhoneNumber
      });
      
      console.log(`Reminder SMS sent successfully! SID: ${result.sid}`);
      return result;
    } catch (smsError) {
      console.error('Error sending reminder SMS via Twilio:', smsError);
      console.log('Falling back to console output for reminder');
      return { sid: 'DEVELOPMENT_MODE', status: 'success' };
    }
  } catch (error) {
    console.error('Error in sendClassReminder function:', error);
    // Return mock success to allow testing without Twilio
    return { sid: 'DEVELOPMENT_MODE', status: 'success' };
  }
} 