const User = require('../models/User');
const Anime = require('../models/Anime');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../config/email');

// Signup

exports.signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({
      email
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already registered'
      });
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    await User.create({
      fullName,
      email,
      password: hashedPassword,
      verificationToken
    });

    // Verification URL
    const verificationURL = `${process.env.SERVER_URL}/api/auth/verify/${verificationToken}`;

    console.log('Attempting to send verification email to:', email);
    console.log('Verification URL:', verificationURL);

    // Send verification email using Brevo REST API (HTTPS)
    const verificationHtml = `
        <div style="
          margin: 0;
          padding: 40px 20px;
          background-color: #080c1c;
          font-family: Arial, Helvetica, sans-serif;
          color: #ffffff;
        ">

          <div style="
            max-width: 600px;
            margin: 0 auto;
            background: #111827;
            border: 1px solid rgba(139, 92, 246, 0.25);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
          ">

            <!-- Header -->

            <div style="
              padding: 30px;
              text-align: center;
              background: linear-gradient(
                135deg,
                #1e1b4b,
                #312e81
              );
            ">

              <h1 style="
                margin: 0;
                color: #ffffff;
                font-size: 32px;
                letter-spacing: 1px;
              ">
                RISUTO
              </h1>

              <p style="
                margin: 8px 0 0;
                color: #c4b5fd;
                font-size: 14px;
              ">
                Your Anime Journey
              </p>

            </div>

            <!-- Content -->

            <div style="
              padding: 40px 35px;
            ">

              <h2 style="
                margin: 0 0 20px;
                color: #ffffff;
                font-size: 24px;
              ">
                Welcome to Risuto! 🎉
              </h2>

              <p style="
                margin: 0 0 16px;
                color: #d1d5db;
                font-size: 15px;
                line-height: 1.7;
              ">
                Thanks for creating your Risuto account.
                We're excited to have you join us.
              </p>

              <p style="
                margin: 0 0 28px;
                color: #d1d5db;
                font-size: 15px;
                line-height: 1.7;
              ">
                Before you start organizing your anime journey,
                please verify your email address by clicking the
                button below.
              </p>

              <!-- Verify Button -->

              <div style="
                text-align: center;
                margin: 30px 0;
              ">

                <a
                  href="${verificationURL}"
                  style="
                    display: inline-block;
                    padding: 14px 30px;
                    background: linear-gradient(
                      135deg,
                      #8b5cf6,
                      #6d28d9
                    );
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 10px;
                    font-size: 15px;
                    font-weight: bold;
                    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
                  "
                >
                  Verify My Account
                </a>

              </div>

              <p style="
                margin: 25px 0 10px;
                color: #94a3b8;
                font-size: 13px;
                line-height: 1.6;
              ">
                If the button doesn't work, copy and paste the
                following link into your browser:
              </p>

              <p style="
                margin: 0;
                padding: 12px;
                background: #0f172a;
                border-radius: 8px;
                color: #a78bfa;
                font-size: 12px;
                word-break: break-all;
              ">
                ${verificationURL}
              </p>

            </div>

            <!-- Footer -->

            <div style="
              padding: 20px 30px;
              text-align: center;
              background: #0f172a;
              border-top: 1px solid rgba(255, 255, 255, 0.06);
            ">

              <p style="
                margin: 0;
                color: #64748b;
                font-size: 12px;
              ">
                If you didn't create a Risuto account,
                you can safely ignore this email.
              </p>

              <p style="
                margin: 10px 0 0;
                color: #475569;
                font-size: 11px;
              ">
                © ${new Date().getFullYear()} Risuto
              </p>

            </div>

          </div>

        </div>
      `;

    // Send email with error handling via HTTPS REST API
    try {
      const data = await sendEmail({
        to: email,
        subject: 'Verify Your Risuto Account',
        html: verificationHtml
      });
      console.log('Verification email sent successfully:', data);
    } catch (emailError) {
      console.error('BREVO EMAIL SEND ERROR:', emailError);

      return res.status(500).json({
        message: emailError.message || 'Account created, but verification link could not be sent.'
      });
    }

    // Successful signup
    return res.status(201).json({
      message:
        'Account created. Please verify your email. Do not forget to check your spam folder if you do not see the email in your inbox.'
    });
  } catch (error) {
    console.error('SIGNUP ERROR:', error);

    res.status(500).json({
      message: error.message
    });
  }
};

// verify email

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token
    });

    if (!user) {
      return res.status(400).send('Invalid or expired verification link.');
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    return res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (error) {
    console.error('VERIFY EMAIL ERROR:', error);

    res.status(500).send(error.message);
  }
};

// Login

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check email and password
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please enter email and password.'
      });
    }

    // Find user
    const user = await User.findOne({
      email
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid email or password.'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid email or password.'
      });
    }

    // Check email verification
    if (!user.isVerified) {
      return res.status(401).json({
        message: 'Please verify your email before logging in.'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    );

    // Send response
    res.status(200).json({
      message: 'Login successful.',

      token,

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);

    res.status(500).json({
      message: error.message
    });
  }
};

// Forgot Password

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Please enter your email address.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(200).json({
        message: 'If an account exists with this email, we have sent a password reset link.'
      });
    }

    // Generate a secure random token.
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Store only the hashed version of the token in the database.
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;

    // The reset link will remain valid for 15 minutes.
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    // Create the reset link for the deployed frontend.
    const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${encodeURIComponent(
      resetToken
    )}`;

    console.log('Password reset requested for:', user.email);
    console.log('Password reset URL:', resetURL);

    // Send the password reset email using Brevo REST API (HTTPS).
    const resetHtml = `
        <div style="
          margin: 0;
          padding: 40px 20px;
          background-color: #080c1c;
          font-family: Arial, Helvetica, sans-serif;
          color: #ffffff;
        ">

          <div style="
            max-width: 600px;
            margin: 0 auto;
            background: #111827;
            border: 1px solid rgba(139, 92, 246, 0.25);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
          ">

            <div style="
              padding: 30px;
              text-align: center;
              background: linear-gradient(
                135deg,
                #1e1b4b,
                #312e81
              );
            ">

              <h1 style="
                margin: 0;
                color: #ffffff;
                font-size: 32px;
                letter-spacing: 1px;
              ">
                RISUTO
              </h1>

              <p style="
                margin: 8px 0 0;
                color: #c4b5fd;
                font-size: 14px;
              ">
                Your Anime Journey
              </p>

            </div>

            <div style="
              padding: 40px 35px;
            ">

              <h2 style="
                margin: 0 0 20px;
                color: #ffffff;
                font-size: 24px;
              ">
                Reset Your Password
              </h2>

              <p style="
                margin: 0 0 16px;
                color: #d1d5db;
                font-size: 15px;
                line-height: 1.7;
              ">
                We received a request to reset your Risuto password.
              </p>

              <p style="
                margin: 0 0 28px;
                color: #d1d5db;
                font-size: 15px;
                line-height: 1.7;
              ">
                Click the button below to create a new password for
                your account.
              </p>

              <div style="
                text-align: center;
                margin: 30px 0;
              ">

                <a
                  href="${resetURL}"
                  style="
                    display: inline-block;
                    padding: 14px 30px;
                    background: linear-gradient(
                      135deg,
                      #8b5cf6,
                      #6d28d9
                    );
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 10px;
                    font-size: 15px;
                    font-weight: bold;
                    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
                  "
                >
                  Reset Password
                </a>

              </div>

              <p style="
                margin: 25px 0 10px;
                color: #94a3b8;
                font-size: 13px;
                line-height: 1.6;
              ">
                This link will expire in 15 minutes.
              </p>

              <p style="
                margin: 25px 0 10px;
                color: #94a3b8;
                font-size: 13px;
                line-height: 1.6;
              ">
                If the button doesn't work, copy and paste the
                following link into your browser:
              </p>

              <p style="
                margin: 0;
                padding: 12px;
                background: #0f172a;
                border-radius: 8px;
                color: #a78bfa;
                font-size: 12px;
                word-break: break-all;
              ">
                ${resetURL}
              </p>

            </div>

            <div style="
              padding: 20px 30px;
              text-align: center;
              background: #0f172a;
              border-top: 1px solid rgba(255, 255, 255, 0.06);
            ">

              <p style="
                margin: 0;
                color: #64748b;
                font-size: 12px;
              ">
                If you didn't request a password reset,
                you can safely ignore this email.
              </p>

              <p style="
                margin: 10px 0 0;
                color: #475569;
                font-size: 11px;
              ">
                © ${new Date().getFullYear()} Risuto
              </p>

            </div>

          </div>

        </div>
      `;

    try {
      const data = await sendEmail({
        to: user.email,
        subject: 'Reset Your Risuto Password',
        html: resetHtml
      });
      console.log('Password reset email sent successfully:', data);
    } catch (emailError) {
      console.error('BREVO PASSWORD RESET ERROR:', emailError);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();
      return res.status(500).json({
        message: emailError.message || 'Something went wrong. Please try again.'
      });
    }

    return res.status(200).json({
      message: 'If an account exists with this email, we have sent a password reset link.'
    });
  } catch (error) {
    console.error('FORGOT PASSWORD ERROR:', error);
    return res.status(500).json({
      message: 'Something went wrong. Please try again.'
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({
        message: 'Reset token and password are required.'
      });
    }

    // Validate password.
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.'
      });
    }

    //Hash token received from frontend.

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    //Find user with:
    //  1. Matching reset token
    //  2. Token that has not expired

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: Date.now()
      }
    });

    if (!user) {
      return res.status(400).json({
        message: 'This password reset link is invalid or has expired.'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    // remove reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      message: 'Password reset successfully. You can now log in.'
    });
  } catch (error) {
    console.error('Reset password error:', error);

    res.status(500).json({
      message: 'Something went wrong. Please try again.'
    });
  }
};

// get current user

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -verificationToken');

    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    res.status(200).json({
      user
    });
  } catch (error) {
    console.error('GET CURRENT USER ERROR:', error);

    res.status(500).json({
      message: error.message
    });
  }
};

// Update Profile / Full Name
exports.updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        message: 'Full name cannot be empty.'
      });
    }

    const trimmedName = fullName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return res.status(400).json({
        message: 'Full name must be between 2 and 50 characters.'
      });
    }

    const user = await User.findById(req.user.id).select('-password -verificationToken');
    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    user.fullName = trimmedName;
    await user.save();

    res.status(200).json({
      message: 'Name updated successfully.',
      user
    });
  } catch (error) {
    console.error('UPDATE PROFILE ERROR:', error);
    res.status(500).json({
      message: 'Failed to update name.'
    });
  }
};

// Change Password (from Settings)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required.'
      });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          'New password must be at least 8 characters long and include one uppercase letter, one number, and one special character.'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Current password does not match.'
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: 'New password cannot be the same as your current password.'
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('CHANGE PASSWORD ERROR:', error);
    res.status(500).json({
      message: 'Failed to change password. Please try again.'
    });
  }
};

// Request Email Change (sends verification link to new email)
exports.requestEmailChange = async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({
        message: 'New email address and current password are required.'
      });
    }

    const normalizedEmail = newEmail.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: 'Please provide a valid email address.'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    if (user.email === normalizedEmail) {
      return res.status(400).json({
        message: 'New email address cannot be the same as your current email.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Incorrect password. Verification email was not sent.'
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: 'This email is already in use by another account.'
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.pendingEmail = normalizedEmail;
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const verifyURL = `${process.env.SERVER_URL}/api/auth/verify-new-email/${rawToken}`;

    const emailHtml = `
      <div style="margin: 0; padding: 40px 20px; background-color: #080c1c; font-family: Arial, Helvetica, sans-serif; color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; background: #111827; border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);">
          <div style="padding: 30px; text-align: center; background: linear-gradient(135deg, #1e1b4b, #312e81);">
            <h1 style="margin: 0; color: #ffffff; font-size: 32px; letter-spacing: 1px;">RISUTO</h1>
            <p style="margin: 8px 0 0; color: #c4b5fd; font-size: 14px;">Confirm Your New Email Address</p>
          </div>
          <div style="padding: 35px 30px; text-align: center;">
            <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.6;">
              You requested to update your Risuto account email to <strong>${normalizedEmail}</strong>.
            </p>
            <p style="margin: 0 0 30px; color: #94a3b8; font-size: 14px; line-height: 1.6;">
              Click the button below to confirm this change. This verification link expires in 1 hour.
            </p>
            <a href="${verifyURL}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);">
              Verify New Email
            </a>
            <p style="margin: 30px 0 0; color: #64748b; font-size: 12px; line-height: 1.5;">
              If you did not request this email change, please ignore this email or update your password immediately.
            </p>
          </div>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        to: normalizedEmail,
        subject: 'Confirm Your New Risuto Email Address',
        html: emailHtml
      });
      res.status(200).json({
        message: 'A verification link has been sent to your new email. Please verify to complete the change.'
      });
    } catch (emailErr) {
      console.error('SEND VERIFY NEW EMAIL ERROR:', emailErr);
      user.pendingEmail = undefined;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      res.status(500).json({
        message: emailErr.message || 'Failed to send verification email. Please try again.'
      });
    }
  } catch (error) {
    console.error('REQUEST EMAIL CHANGE ERROR:', error);
    res.status(500).json({
      message: 'Failed to process email change request.'
    });
  }
};

// Verify New Email link endpoint
exports.verifyNewEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).send('Verification token is missing.');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user || !user.pendingEmail) {
      return res.redirect(`${process.env.CLIENT_URL}/settings?emailUpdated=expired`);
    }

    const conflictUser = await User.findOne({ email: user.pendingEmail });
    if (conflictUser && conflictUser._id.toString() !== user._id.toString()) {
      user.pendingEmail = undefined;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
      return res.redirect(`${process.env.CLIENT_URL}/settings?emailUpdated=conflict`);
    }

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.redirect(`${process.env.CLIENT_URL}/settings?emailUpdated=true`);
  } catch (error) {
    console.error('VERIFY NEW EMAIL ERROR:', error);
    return res.status(500).send('Server error during email verification.');
  }
};

// Delete Account (deletes user and all their anime data)
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: 'Password confirmation is required to delete your account.'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Incorrect password. Account was not deleted.'
      });
    }

    // Delete all anime rows owned by this user
    await Anime.deleteMany({ user: req.user.id });

    // Delete the user record
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      message: 'Your account and all associated anime data have been permanently deleted.'
    });
  } catch (error) {
    console.error('DELETE ACCOUNT ERROR:', error);
    res.status(500).json({
      message: 'Failed to delete account. Please try again.'
    });
  }
};
