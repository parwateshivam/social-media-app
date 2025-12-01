import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import session from "express-session";
import passport from "passport";
import { connectDB } from './config/db.js';
import passportConfig from "./config/passportConfig.js";
import { authRouter } from './routes/authRouter.js';
import { postRouter } from './routes/postRouter.js';

dotenv.config({ path: './config.env' });

connectDB();

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use("/public", express.static('public'))
app.use("/uploads", express.static("uploads"));

// SESSION (REQUIRED FOR PASSPORT)
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

// HOME ROUTE
app.get('/', (req, res) => {
  res.render('home');
});

// ROUTES
app.use(authRouter);
app.use(postRouter)

let PORT = process.env.PORT || 7002;
app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
