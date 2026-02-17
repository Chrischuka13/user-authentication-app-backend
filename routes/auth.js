import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import User from "../models/user.js"
import { sendEmail } from "../helpers/mailer.js"

const router = express.Router()


router.post('/signup', async (req, res) => {
    try {
        const {username, email, password} = req.body

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        // check for existing user
        const existing = await User.findOne({ email })
        if (existing) {
            return res.status(400).json({message: "email is already registered"})
        }
        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const verificationToken = crypto.randomBytes(20).toString('hex');
        const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // create user
        const user =  new User({
        username,
        email,
        password: hashPassword,
        verifyToken: verificationToken,
        verifyTokenExpires: verificationTokenExpire,
        })
        await user.save()
    
        await sendEmail({email: user.email, emailType: "VERIFY", userId: user._id})
        
        return res.status(201).json({
            message: "user created successfully",
            user
        })

    } catch (err) {
        console.error("SignUp API error", err.message);
        res.status(500).json({message: "server error"})
        
    }
});

router.post("/login", async(req, res) =>{
    try {
        const {email, password} = req.body
        
        const user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({message: "User does not exist"})
        }
        // if (!user.isVerified) {
        //     return res.status(401).json({message: 'Please verify your email first'});
        // }

        //check if password matches with email
        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            return res.status(400).json({message: "Email or password is wrong"})
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: "1h"})

        res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        });

        return res.status(200).json({
        message: "User login successfully",
        user: { id: user._id, email: user.email },
        token,
        });
     
    } catch (err) {
        console.error("Login API error", err.message);
        res.status(500).json({message: "server error"})
    }
})


router.get("/verifymail/:token", async (req, res) => {
    try {
        //get token from user
        const { token } = req.params

        //hash incoming token to DB
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        // server checks if the token user provided matches
        const user = await User.findOne({verifyToken: hashedToken,
            verifyTokenExpires: {$gt: Date.now()}
        })
        
        if (!user) {
            return res.status(401).json({message: "invalid or expired token"})
        }

        console.log(user);
        
        //set user verification to true and reset token so no one can use it
        user.isVerified = true
        user.verifyToken = undefined
        user.verifyTokenExpires = undefined

        await user.save()

        return res.status(200).json({
            message: "Email verified successfully", 
        })

    } catch (err) {
        console.error("email verification failed", err.message)
        res.status(500).json({message: "server error"})
    }
})



router.post("/forgotpassword", async (req, res) => {
    try {
        //server requests email, to check if user exists
        const { email }  = req.body
        const user = await User.findOne({email}) 

        if (!user) {
            return res.status(400).json({message: "user not found"})
        }

        await sendEmail({email: user.email, emailType: "RESET", userId: user._id})

        return res.json({message: "reset link sent successfully"})

    } catch (err) {
        console.error(err.message)
        res.status(500).json({message: "server error"})
    }
})

router.post("/resetpassword/:token", async (req, res) => {
    try {
        //get password and user and token from params
        const { token } = req.params
        const { password } = req.body

        //hash incoming token to DB
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({resetPasswordToken: hashedToken,
            resetPasswordExpires: {$gt: Date.now()}
        })
        if (!user) {
            return res.status(400).json({message: 'Invalid or expired token'})
        }
        
        //hash the new password 
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt);
        
        user.password = hashPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        return res.status(200).json({
        message: "Password reset successfully"});
        

    } catch (err) {
        console.error(err.message);
        res.status(500).json({message: "server error"})
    }
})


export default router;