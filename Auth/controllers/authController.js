const User = require('../models/User');
const { sendSms } = require('../utils/smsService');
const { sendEmail } = require('../utils/emailService');
const { generateOtp } = require('../utils/otpGenerator');
const { generateToken, verifyToken } = require('../utils/tokenGenerator');

// Register user
exports.register = async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body;
    
    // Check if phone or email already exists and verified
    const existingPhoneUser = await User.findOne({ 
      phone, 
      phoneVerified: true 
    });
    
    if (existingPhoneUser) {
      return res.status(400).json({ message: 'Phone number already registered and verified' });
    }
    
    const existingEmailUser = await User.findOne({ 
      email, 
      emailVerified: true 
    });
    
    if (existingEmailUser) {
      return res.status(400).json({ message: 'Email already registered and verified' });
    }
    
    // Check if unverified user exists with same phone or email
    let user = await User.findOne({
      $or: [{ phone }, { email }],
      $or: [{ phoneVerified: false }, { emailVerified: false }]
    });
    
    if (user) {
      // Update existing unverified user
      user.fullName = fullName;
      user.password = password;
    } else {
      // Create new user
      user = new User({
        fullName,
        phone,
        email,
        password
      });
    }
    
    // Generate OTP for phone verification
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    user.phoneOtp = {
      code: otp,
      expiresAt: otpExpiry
    };
    
    // Generate token for email verification
    const emailToken = generateToken({ id: user._id, email }, '24h');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    user.emailToken = {
      token: emailToken,
      expiresAt: tokenExpiry
    };
    
    await user.save();
    
    // Send OTP to phone
    sendSms(phone, `Your verification code is: ${otp}. It expires in 5 minutes.`);
    
    // Send verification email
    const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${emailToken}`;
    sendEmail(email, `Please verify your email by clicking on this link: ${verificationUrl}`);
    
    res.status(201).json({
      message: 'User registered successfully. Please verify your phone and email.',
      userId: user._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify phone with OTP
exports.verifyPhone = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.phoneVerified) {
      return res.status(400).json({ message: 'Phone already verified' });
    }
    
    if (!user.phoneOtp || !user.phoneOtp.code) {
      return res.status(400).json({ message: 'No OTP found' });
    }
    
    if (user.phoneOtp.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }
    
    if (user.phoneOtp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    user.phoneVerified = true;
    user.phoneOtp = undefined;
    await user.save();
    
    res.status(200).json({ message: 'Phone verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify email with token
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }
    
    if (!user.emailToken || user.emailToken.token !== token) {
      return res.status(400).json({ message: 'Invalid token' });
    }
    
    if (user.emailToken.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Token expired' });
    }
    
    user.emailVerified = true;
    user.emailToken = undefined;
    await user.save();
    
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    const user = await User.findOne({ phone }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid phone number or password' });
    }
    
    if (!user.phoneVerified) {
      return res.status(401).json({ message: 'Phone number not verified' });
    }
    
    const token = generateToken({ id: user._id });
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot password - send OTP to phone
exports.forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;
    
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found with this phone number' });
    }
    
    if (!user.phoneVerified) {
      return res.status(400).json({ message: 'Phone number not verified' });
    }
    
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    user.resetOtp = {
      code: otp,
      expiresAt: otpExpiry
    };
    
    await user.save();
    
    sendSms(phone, `Your password reset OTP is: ${otp}. It expires in 5 minutes.`);
    
    res.status(200).json({
      message: 'OTP sent to your phone number',
      userId: user._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password with OTP
exports.resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.resetOtp || !user.resetOtp.code) {
      return res.status(400).json({ message: 'No OTP found' });
    }
    
    if (user.resetOtp.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }
    
    if (user.resetOtp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    user.password = newPassword;
    user.resetOtp = undefined;
    await user.save();
    
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password after login
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('+password');
    
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Resend phone OTP
exports.resendPhoneOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.phoneVerified) {
      return res.status(400).json({ message: 'Phone already verified' });
    }
    
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    user.phoneOtp = {
      code: otp,
      expiresAt: otpExpiry
    };
    
    await user.save();
    
    sendSms(user.phone, `Your verification code is: ${otp}. It expires in 5 minutes.`);
    
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Resend email verification
exports.resendEmailVerification = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }
    
    const emailToken = generateToken({ id: user._id, email: user.email }, '24h');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    user.emailToken = {
      token: emailToken,
      expiresAt: tokenExpiry
    };
    
    await user.save();
    
    const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${emailToken}`;
    sendEmail(user.email, `Please verify your email by clicking on this link: ${verificationUrl}`);
    
    res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};