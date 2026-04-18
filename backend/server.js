import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.routes.js";

const app = express();
const PORT = 5000;

// Db
connectDB();

//Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Api Working!");
});

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
