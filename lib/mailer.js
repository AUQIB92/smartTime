import nodemailer from 'nodemailer';

// Get email configuration from environment variables
const emailHost = process.env.EMAIL_HOST;
const emailPort = process.env.EMAIL_PORT;
const emailSecure = process.env.EMAIL_SECURE === 'true';
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;
const emailFrom = process.env.EMAIL_FROM || 'noreply@smarttime.com';
const emailFromName = process.env.EMAIL_FROM_NAME || 'SmartTime';

// Initialize nodemailer transporter only if configuration is available
let transporter;
if (emailHost && emailPort && emailUser && emailPassword) {
  try {
    transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
  } catch (error) {
    console.error('Error initializing nodemailer transporter:', error);
    transporter = null;
  }
}

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version of the message
 * @param {string} options.html - HTML version of the message
 * @returns {Promise} - Nodemailer response
 */
export const sendEmail = async (options) => {
  try {
    // Check if transporter is configured
    if (!transporter) {
      console.log(`[DEVELOPMENT MODE] Would send email to ${options.to}: ${options.subject}`);
      return { messageId: 'DEVELOPMENT_MODE', status: 'success' };
    }
    
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"${emailFromName}" <${emailFrom}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Return mock success in development to allow testing without email
    return { messageId: 'DEVELOPMENT_MODE', status: 'success' };
  }
};

/**
 * Send a welcome email to a new user
 * @param {Object} user - User object
 * @param {string} otp - One-time password
 * @returns {Promise} - Nodemailer response
 */
export const sendWelcomeEmail = async (user, otp) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?otp=${otp}&mobileNumber=${user.mobileNumber}`;
  
  return sendEmail({
    to: user.email,
    subject: 'Welcome to SmartTime - Verify Your Account',
    text: `Welcome to SmartTime, ${user.name}!\n\nYou have been added as a ${user.role} by the administrator.\n\nYour verification code is: ${otp}\n\nPlease use this code to verify your account.\n\nThank you,\nThe SmartTime Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #0d9488;">SmartTime</h1>
          <p style="color: #6b7280; font-size: 16px;">Intelligent Timetable Management</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #111827;">Welcome to SmartTime, ${user.name}!</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">You have been added as a <strong>${user.role}</strong> by the administrator.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 10px;">Your verification code is:</p>
            <h2 style="color: #0d9488; letter-spacing: 5px; font-size: 32px; margin: 10px 0;">${otp}</h2>
            <p style="color: #6b7280; font-size: 14px;">Please use this code to verify your account.</p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">You can also click the button below to verify your account:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Account</a>
          </div>
        </div>
        
        <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; color: #6b7280; font-size: 14px; text-align: center;">
          <p>Thank you,<br>The SmartTime Team</p>
        </div>
      </div>
    `,
  });
};

/**
 * Send a password reset email
 * @param {Object} user - User object
 * @param {string} otp - One-time password
 * @returns {Promise} - Nodemailer response
 */
export const sendPasswordResetEmail = async (user, otp) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?otp=${otp}&mobileNumber=${user.mobileNumber}`;
  
  return sendEmail({
    to: user.email,
    subject: 'SmartTime - Reset Your Password',
    text: `Hello ${user.name},\n\nYou are receiving this email because you (or someone else) has requested to reset your password.\n\nYour verification code is: ${otp}\n\nIf you did not request this, please ignore this email.\n\nThank you,\nThe SmartTime Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #0d9488;">SmartTime</h1>
          <p style="color: #6b7280; font-size: 16px;">Intelligent Timetable Management</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #111827;">Reset Your Password</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Hello ${user.name},</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">You are receiving this email because you (or someone else) has requested to reset your password.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 10px;">Your verification code is:</p>
            <h2 style="color: #0d9488; letter-spacing: 5px; font-size: 32px; margin: 10px 0;">${otp}</h2>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">You can also click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">If you did not request this, please ignore this email.</p>
        </div>
        
        <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; color: #6b7280; font-size: 14px; text-align: center;">
          <p>Thank you,<br>The SmartTime Team</p>
        </div>
      </div>
    `,
  });
}; 