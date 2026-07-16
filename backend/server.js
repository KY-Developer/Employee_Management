import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/error.js";
import adminRoutes from "./routes/adminRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import setupSocket from "./utils/socket.js";
import { attachSocket } from "./middleware/attachSocket.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
// app.use(express.json());
app.use(express.json({ limit: "3000mb" }));
app.use(express.urlencoded({ extended: true, limit: "3000mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Socket.io setup
setupSocket(io);
app.set("io", io);

// ✅ Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

// Routes
app.use(attachSocket(io));
app.use("/api/admin", adminRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
