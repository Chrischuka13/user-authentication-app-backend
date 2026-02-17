import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/user.js"
import getDataFromToken from "../helpers/getDataFromToken.js"

const router = express.Router()


router.get("/profile", async (req, res) => {
    try {
        const userId = getDataFromToken(req)
        const user = await User.findById({_id: userId}).select("-password")

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            user
        })
    } catch (err) {
        console.error("not authorized", err.message)
        res.status(500).json({message: "server error"})
    }
})

export default router