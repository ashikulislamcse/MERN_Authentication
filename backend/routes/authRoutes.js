import express from 'express';
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVarifyOtp, varifyEmail } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';


const authRouter = express.Router();

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/send-varify-otp', userAuth, sendVarifyOtp)
authRouter.post('/varify-account', userAuth, varifyEmail)
authRouter.get('/is-auth', userAuth, isAuthenticated)
authRouter.post('/send-reset-otp', sendResetOtp)
authRouter.post('/reset-password', resetPassword)


export default authRouter
