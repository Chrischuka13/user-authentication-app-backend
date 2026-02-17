import "dotenv/config"
import mongoose from "mongoose";
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js"
import profileRouter from "./middleware/profile.js"
const PORT = process.env.PORT || 5000 
const app = express()

const allowedOrigins = [
  "http://localhost:5174",
  "https://user-authentication-app-phi.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());



app.use("/api/auth", profileRouter)
app.use("/api/auth", authRoutes)

app.get("/", (req, res)=>{
  res.send("server is running")
})

const startServer = async() => {
    try {
    await mongoose.connect(process.env.MONGO_URI)
      app.listen(PORT, () =>{
        console.log(`server is running on ${PORT}`);    
      })
    } catch (error) {
      console.log('something went wrong')
      console.log(error);
      
    }
}

startServer()