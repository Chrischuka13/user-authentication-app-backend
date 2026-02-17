import jwt from "jsonwebtoken"

//jwt helper
const getDataFromToken = (req) => {
    try {
        const authHeaders = req.headers.authorization
        if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
            throw new Error("No token provided")
        }

        const token = authHeaders.split(" ")[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        return decoded.id

    } catch (err) {
        console.error("Token error:", err.message)
        throw new Error("Invalid or expired token")
    }
}

export default getDataFromToken

