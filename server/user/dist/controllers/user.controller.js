import TryCatch from "../config/TryCatch.js";
import { publishToQueue } from "../config/rabbitmq.js";
import { redisClient } from "../index.js";
import User from "../model/user.js";
import { generateToken } from "../config/generateToken.js";
export const loginUser = TryCatch(async (req, res) => {
    const { email } = req.body;
    console.log(email);
    const rateLimitKey = `otp:ratelimit:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);
    if (rateLimit) {
        return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp, { EX: 300 });
    await redisClient.set(rateLimitKey, 'true', { EX: 60 });
    const message = {
        to: email,
        subject: 'Your OTP Code',
        body: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    };
    await publishToQueue('send-otp', message);
    res.status(200).json({ message: 'OTP sent to your email' });
});
export const verifyOTP = TryCatch(async (req, res) => {
    const { email, otp: enteredOtp } = req.body;
    if (!email || !enteredOtp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }
    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);
    if (!storedOtp || storedOtp !== enteredOtp) {
        return res.status(400).json({ message: 'OTP has expired or does not exist' });
    }
    await redisClient.del(otpKey);
    let user = await User.findOne({ email });
    console.log(user);
    if (!user) {
        const username = email.split('@')[0];
        user = new User({ email, username });
        await user.save();
    }
    const token = generateToken(user);
    return res.status(200).json({
        message: 'OTP verified successfully',
        user: user,
        token
    });
});
export const myProfile = TryCatch(async (req, res) => {
    const user = req.user;
    console.log(user);
    res.json(user);
});
export const updateName = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(404).json({ message: 'User not found' });
    }
    const user = await User.findOne({ _id: userId });
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    const { username } = req.body;
    user.username = username;
    await user.save();
    res.json(user);
});
//# sourceMappingURL=user.controller.js.map