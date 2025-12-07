import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import session from "express-session";
import passport from "passport";
import { connectDB } from './config/db.js';
import passportConfig from "./config/passportConfig.js";
import { authRouter } from './routes/authRouter.js';
import { postRouter } from './routes/postRouter.js';
import { Server } from 'socket.io';
import http from "http";

dotenv.config({ path: './config.env' });

// CONNECTING TO DATABASE
connectDB();

const app = express();

// IMPORTANT: http server banate hai (express ke upar)
const server = http.createServer(app);

// Attaching Socket.IO to our server
const io = new Server(server);

// --- SOCKET CONNECTION --- //
io.on("connection", (socket) => {
  console.log("🔥 Socket connected:", socket.id);

  // Join user specific room (front-end se userId aayega)
  socket.on("joinRoom", (userId) => {
    socket.join(userId.toString());
    console.log(`📌 User joined room: ${userId}`);
  });

  // Socket disconnection
  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});
// --- END SOCKET SETUP --- //


// EXPRESS MIDDLEWARES
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.set("view engine", "ejs");

// STATIC FILES
app.use("/public", express.static('public'));
app.use("/uploads", express.static("uploads"));

// SESSION (REQUIRED FOR LOGIN)
app.use(session({
  secret: process.env.SESSION_SECRET || "secret-key",
  resave: false,
  saveUninitialized: false,
}));

// PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

// PASSPORT CONFIG
passportConfig(passport);


// ROUTES
app.get('/', (req, res) => {
  res.render('home');
});

app.use(authRouter);
app.use(postRouter);


// 👉 IMPORT IO IN OTHER FILES
export { io };


// START SERVER USING server.listen 👇
// Because socket.io server must run on same HTTP server
let PORT = process.env.PORT || 7002;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at: http://192.168.31.147:${PORT}`);
});
