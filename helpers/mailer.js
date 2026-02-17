import nodemailer from "nodemailer"
import crypto from "crypto"
import User from "../models/user.js"

export const sendEmail = async({email, emailType, userId}) => {
    try {
        if (!["VERIFY", "RESET"].includes(emailType)) {
            throw new Error("Invalid email type");
        }
        // create a hash token
        const resetToken = crypto.randomBytes(32).toString("hex")
        //store hash token in DB for security
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        //update a user
        if (emailType === "VERIFY") {
        await User.findByIdAndUpdate(userId,
        {verifyToken: hashedToken,
        verifyTokenExpires: Date.now() + 3600000}) //1hr

        } else if (emailType === "RESET") {
        await User.findByIdAndUpdate(userId,
        {resetPasswordToken: hashedToken,
        resetPasswordExpires: Date.now() + 3600000}) //1hr
        }

        
        const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false,
        }
        });


        const actionUrl = emailType === "VERIFY"? `${process.env.domain}/verifymail/${resetToken}` : `${process.env.domain}/resetpassword/${resetToken}`;
        
        const mailOptions = {
            from: `"Chuka's Auth-Project": ${process.env.EMAIL_USER}`,
            to: email,
            subject: emailType === "VERIFY"? "Verify your email" : "Reset your password",
            html: `<p>Click <a href="${actionUrl}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"} or copy and paste the link below in your browser.
            <br> ${actionUrl}</p>`
        }

        try {
            const mailResponse = await transport.sendMail(mailOptions);
            console.log("Email sent:", mailResponse.response);
            return mailResponse;
        } catch (error) {
            console.error("Email error:", error);
            throw error;
        }

        
    } catch (error) {
        throw error instanceof Error 
        ? error : new Error("Unknown error occurred");
}

}