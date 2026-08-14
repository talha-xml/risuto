const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const resend = require('../config/email');

// =====================================================
// Signup
// =====================================================

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

    // Send verification email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Risuto <onboarding@resend.dev>',
      to: email,
      subject: 'Verify Your Risuto Account',

      html: `
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
      `
    });

    // Handle Resend error
    if (error) {
      console.error('RESEND EMAIL ERROR:', error);

      return res.status(500).json({
        message:
          'Account created, but verification email could not be sent. Please email us at mtalhafaizan30@gmail.com for manual verification. Please note that it can take up to 24 hours for us to respond. We apologize for the inconvenience.'
      });
    }

    console.log('Verification email sent successfully:', data);

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

// =====================================================
// Verify Email
// =====================================================

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

// =====================================================
// Login
// =====================================================

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

    // Always return the same response when the email does not exist.
    // This prevents people from discovering which emails have accounts.
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

    // Send the password reset email.
    const { data, error } = await resend.emails.send({
      from: 'Risuto <onboarding@resend.dev>',
      to: user.email,
      subject: 'Reset Your Risuto Password',

      html: `
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
      `
    });

    // Do not leave a valid reset token in the database
    // if the email could not be sent.
    if (error) {
      console.error('RESEND PASSWORD RESET ERROR:', error);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      return res.status(500).json({
        message: 'Something went wrong. Please try again.'
      });
    }

    console.log('Password reset email sent successfully:', data);

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

    /*
     * Validate password.
     */
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.'
      });
    }

    /*
     * Hash token received from frontend.
     */
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    /*
     * Find user with:
     *
     * 1. Matching reset token
     * 2. Token that has not expired
     */
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

    /*
     * Hash new password.
     */
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    /*
     * Remove reset token so it cannot be reused.
     */
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

// =====================================================
// Get Current User
// =====================================================

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
