import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    varifyOtp:{type:String, default:" "},
    varifyOtpExpireAt:{type:Number, default:0},
    isAccountVarified:{type:Boolean, default:false},
    resetOtp:{type:String, default:" "},
    resetOtpExpireAt:{type:Number, default:0},
})

const userModel =mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;