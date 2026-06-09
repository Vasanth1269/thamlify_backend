import express from "express";
import { isAuthenticate, login, logout, passwordResetOtp, register, resetPassword, resetPasswordVerify, sendVerifyOtp, verifyEmail,  } from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";


  const authRouter = express.Router();

authRouter.post('/register',register);
authRouter.post('/login',login)
authRouter.post('/logout',logout)
authRouter.post('/send-verify-otp', sendVerifyOtp)
authRouter.post('/verify-email',verifyEmail)
authRouter.post('/send-resetotp', passwordResetOtp)
authRouter.post("/resetPasswordVerify" ,resetPasswordVerify)
authRouter.get('/is-auth',userAuth,isAuthenticate)


export default authRouter