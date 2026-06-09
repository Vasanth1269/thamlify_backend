import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import generateRoutes from "./routes/generate.js";
import authRouter from "./routes/authRoutes.js";


const app = express();



// ✅ CORS FIRST
app.use(
  cors({
      origin: [
      "http://localhost:5174",
      "https://thamlify-goqj.vercel.app",
      "https://thamlify-7uoj.vercel.app",
      "https://thamlify-fn3p.vercel.app/"
    ],
     credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());


// ROUTES
app.use("/api", generateRoutes);
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

const PORT = process.env.PORT || 5000;

connectDB();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
