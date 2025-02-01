import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js'
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Missing Details" });
    }
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User Already Exists" });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ name, email, password: hashPassword });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: "10d" });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        //Sending Welcome Email
        const mailoptions ={
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome To Authentication',
            text: `Welcome To Authentication Website. Your Account has been created with email id: ${email}`
        }

        await transporter.sendMail(mailoptions);

        return res.status(201).json({ success: true });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and Password are Required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid Email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Wrong Passwords" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: "10d" });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ success: true });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        return res.status(200).json({ success: true, message: "Logged Out" });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const sendVarifyOtp = async (req, res)=>{
    try {
        const {userID} = req.body;
        console.log(userID);

        const user = await userModel.findById(userID);

        if(user.isAccountVarified){
            return res.json({success:false, message:"Account Already Varified"})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.varifyOtp = otp;
        user.varifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000
        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Varification OTP',
            // text: `Your OTP is ${otp}. Varify your Account using this OTP. `,
            html: EMAIL_VERIFY_TEMPLATE.replace(/{{otp}}/g, otp).replace(/{{email}}/g,user.email)
        }
        await transporter.sendMail(mailOption);
        res.json({success:true, message:"Varification OTP send on Your Email"})

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const varifyEmail = async (req, res) =>{
    const {userID, otp} = req.body;
    if(!userID || !otp){
        return res.json({success:false, message:"Missing Details"});
    }

    try {
        const user = await userModel.findById(userID);

        if(!user){
            return res.json({success:false, message:"User Not Found"});
        }
        if(user.varifyOtp === '' || user.varifyOtp !== otp){
            return res.json({success:false, message:"Invalid OTP"});
        }

        if(user.varifyOtpExpireAt < Date.now()){
            return res.json({success:false, message:"OTP Expired"});
        }

        user.isAccountVarified = true;
        user.varifyOtp = '';
        user.varifyOtpExpireAt = 0;

        await user.save();

        return res.json({success:true, message:"Email Varified Successfully"})


    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const isAuthenticated = async(req, res) =>{
    try {
        return res.json({success:true});
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const sendResetOtp = async(req, res) =>{
    const {email} = req.body;

    if(!email){
        return res.json({success:false, message:"Email is Required!"})
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false, message:"User not found"})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000
        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            // text: `Your OTP for reseting your Password is ${otp}. Varify your use this OTP to procced with resetting your password. `,
            html: PASSWORD_RESET_TEMPLATE.replace(/{{otp}}/, otp).replace(/{{email}}/, user.email)
        }
        await transporter.sendMail(mailOption);
        res.json({success:true, message:"OTP send on Your Email"})

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const resetPassword = async(req, res) =>{
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword ){
        return res.json({success:false, message:"Email, OTP and New Password are Required!"});
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false, message:"User not found"});
        }
        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({success:false, message:"Invalid OTP"});
        }
        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success:false, message:"OTP Expired!"})
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpireAt= 0;

        await user.save();

        return res.json({success:true, message:"Password has been reset Successfully!"})

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
