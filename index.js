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
  process.env.domain
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"]
  })
);

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