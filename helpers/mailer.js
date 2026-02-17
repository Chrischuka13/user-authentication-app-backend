import crypto from "crypto"
import User from "../models/user.js"
import sgMail from "@sendgrid/mail"


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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


        const actionUrl = emailType === "VERIFY"? `${process.env.domain}/verifymail/${resetToken}` : `${process.env.domain}/resetpassword/${resetToken}`;
        
        const msg = {
            from: `"Chuka's Auth-Project": ${process.env.EMAIL_FROM}`,
            to: email,
            subject: emailType === "VERIFY"? "Verify your email" : "Reset your password",
            html: `<p>Click <a href="${actionUrl}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"} or copy and paste the link below in your browser.
            <br> ${actionUrl}</p>`
        }

        await sgMail.send(msg);
        
    } catch (error) {
        throw error instanceof Error 
        ? error : new Error("SendGrid Error");
}

}