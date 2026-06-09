import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemiler.js";
import otpModel from "../models/otpModel.js";
// REGISTER
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
 const mailOptions = {
  from: {
    name: "Thumblify",
    address: process.env.SENDER_EMAIL, 
  },
  to: email, 
  subject: "Welcome to Thumblify",
  html: `
    <p>Dear ${name},</p>

    <p>
      Thank you for signing up for <strong>Thumblify</strong>.
    </p>

    <p>
      We are pleased to welcome you to our platform. Thumblify is designed to help creators and businesses produce high-quality, engaging thumbnails efficiently and at scale.
    </p>

    <h3>With Thumblify, you can:</h3>
    <ul>
      <li>Create professional thumbnails quickly</li>
      <li>Customize designs to align with your brand identity</li>
      <li>Streamline your content creation workflow</li>
    </ul>

    <p>
      You can begin by logging into your account and creating your first thumbnail today.
    </p>

    <p>
      <strong>Access your account:</strong> <a href="#">App Link</a>
    </p>

    <p>
      If you need any help, just reply to this email.
    </p>

    <p>
      <strong>Thumblify Team</strong>
    </p>
  `,
};

try {
  await transporter.sendMail(mailOptions);
  console.log("Welcome email sent ✅");
} catch (error) {
  console.error("Email send failed ❌", error);
}



    return res.json({ success: true, message: "Registered successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and password required",
    });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite:"none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Login successful" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


 export const sendVerifyOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await otpModel.deleteMany({ email });

    await otpModel.create({
      name,
      email,
      password,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    await transporter.sendMail({
      from: {
        name: "Thamlify",
        address: process.env.SENDER_EMAIL,
      },
      to: email,
      subject: "OTP Verification - Thamlify",
      html: `
        <p>Your OTP for verification is:</p>
        <h2>${otp}</h2>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    });

    return res.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
  


export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const record = await otpModel.findOne({ email, otp });

    if (!record) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (record.expiresAt < Date.now()) {
      await otpModel.deleteMany({ email });

      return res.json({
        success: false,
        message: "OTP expired",
      });
    }

    const hashedPassword = await bcrypt.hash(record.password, 10);

    const user = await userModel.create({
      name: record.name,
      email: record.email,
      password: hashedPassword,
      isAccountVerified: true,
    });

    await otpModel.deleteMany({ email });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await transporter.sendMail({
      from: {
        name: "Thamlify",
        address: process.env.SENDER_EMAIL,
      },
      to: user.email,
      subject: "Welcome to Thamlify 🎉",
      html: `
        <h2>Hello ${user.name}</h2>
        <h2>🎉 Your account has been created successfully!</h2>
        <p>Welcome to Thamlify. You can now start generating AI thumbnails.</p>
      `,
    });

    return res.json({
      success: true,
      message: "Account created successfully",
      user,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const passwordResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expireAt = Date.now() + 24 * 60 * 60 * 1000;

    user.resetOtp = otp;
    user.resetOtpExpireAt = expireAt;
    await user.save();

    await transporter.sendMail({
      from: {
        name: "Thumblify",
        address: process.env.SENDER_EMAIL,
      },
      to: user.email,
      subject: "OTP Verification - Thumblify",
      html: `
        <p>Your OTP for password reset is:</p>
        <h2>${otp}</h2>
        <p>This OTP is valid for 24 hours.</p>
      `,
    });

    res.json({ success: true, message: "OTP sent to email" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};





export const resetPasswordVerify = async (req, res) => {
   
  const { otp,email, password } = req.body;
  
     
  if (!password || !otp || !email) {
    return res.json({
      success: false,
      message: "Email and OTP are required",
    });
  }
     

  try {
    const user = await userModel.findOne({email});
    

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid user",
      });
    }

    if (!user.resetOtp) {
      return res.json({
        success: false,
        message: "OTP not found. Please request again",
      });
    }

    if (user.resetOtp.toString() !== otp.toString()) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP expired",
      });
    }
     const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    const mailOptions = {
      from: {
        name: "Thumblify",
        address: process.env.SENDER_EMAIL,
      },
      to: user.email,
      subject: "Password Reset Confirmation",
      html: `
        <p>Hello,</p>
        <p>This email confirms that your Thumblify account password has been successfully reset.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <p>Best regards,</p>
        <p>Thumblify Team</p>

      `,
    };
     await transporter.sendMail(mailOptions);

    // OTP verified
    user.resetOtp = 0;
    user.resetOtpExpireAt = 0;
    await user.save();

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
}


export const resetPassword = async (req, res) => {
  const { password } = req.body;
  const userId = req.userId;

  if (!password) {
    return res.json({
      success: false,
      message: "Enter password",
    });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    const mailOptions = {
      from: {
        name: "Thumblify",
        address: process.env.SENDER_EMAIL,
      },
      to: user.email,
      subject: "Password Reset Confirmation",
      html: `
        <p>Hello,</p>
        <p>This email confirms that your Thumblify account password has been successfully reset.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <p>Best regards,</p>
        <p>Thumblify Team</p>

      `,
    };
     await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const isAuthenticate = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({success: false, message: "Not authenticated",});
    }

    const user = await userModel.findById(userId).select("name email");

    if (!user) {
      return res.status(404).json({success: false,message: "User not found",});
    }

    res.status(200).json({success: true,user: { name: user.name, email: user.email,}});
  } catch (error) {
    res.status(500).json({success: false,message: "Authentication check failed",});
  }
};

