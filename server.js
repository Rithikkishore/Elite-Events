require("dotenv").config();

const crypto = require("node:crypto");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();
const port = Number(process.env.PORT) || 3000;
const jwtSecret = process.env.JWT_SECRET;

if (!process.env.MONGODB_URI || !jwtSecret || jwtSecret.length < 32) {
  throw new Error("Set MONGODB_URI and a JWT_SECRET of at least 32 characters in .env.");
}

app.use(express.json({ limit: "10kb" }));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  eventType: { type: String, required: true },
  customerName: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  guests: { type: Number, required: true, min: 1 },
  eventDate: { type: String, required: true },
  eventTime: { type: String, required: true },
  venue: { type: String, required: true, trim: true },
  requirements: { type: String, default: "", maxlength: 2000 },
  bookingStatus: { type: String, default: "Pending" }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Booking = mongoose.model("Booking", bookingSchema);

function createToken(user) {
  return jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: "7d" });
}

function requireAuth(req, res, next) {
  const authorization = req.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Please log in to continue." });
  }
}

function serializeBooking(booking) {
  return {
    id: booking.bookingId,
    eventType: booking.eventType,
    customerName: booking.customerName,
    phone: booking.phone,
    email: booking.email,
    guests: booking.guests,
    eventDate: booking.eventDate,
    eventTime: booking.eventTime,
    venue: booking.venue,
    requirements: booking.requirements,
    bookingStatus: booking.bookingStatus,
    createdAt: booking.createdAt
  };
}

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
      return res.status(400).json({ error: "Enter a valid name and email, and use a password with at least 8 characters." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    res.status(201).json({ user: { name: user.name, email: user.email } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "Email already registered." });
    }
    next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    res.json({
      token: createToken(user),
      user: { name: user.name, email: user.email }
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/bookings", requireAuth, async (req, res, next) => {
  try {
    const fields = ["eventType", "customerName", "phone", "email", "eventDate", "eventTime", "venue"];
    if (fields.some((field) => typeof req.body[field] !== "string" || !req.body[field].trim()) ||
        !Number.isInteger(Number(req.body.guests)) || Number(req.body.guests) < 1) {
      return res.status(400).json({ error: "Complete all required booking details." });
    }

    const booking = await Booking.create({
      bookingId: `EE${Date.now()}${crypto.randomBytes(2).toString("hex").toUpperCase()}`,
      user: req.userId,
      eventType: req.body.eventType,
      customerName: req.body.customerName,
      phone: req.body.phone,
      email: req.body.email,
      guests: Number(req.body.guests),
      eventDate: req.body.eventDate,
      eventTime: req.body.eventTime,
      venue: req.body.venue,
      requirements: typeof req.body.requirements === "string" ? req.body.requirements : ""
    });

    res.status(201).json({ booking: serializeBooking(booking) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/bookings", requireAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ bookings: bookings.map(serializeBooking) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/bookings/:bookingId", requireAuth, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId, user: req.userId });
    if (!booking) {
      return res.status(404).json({ error: "Booking not found." });
    }
    res.json({ booking: serializeBooking(booking) });
  } catch (error) {
    next(error);
  }
});

app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/images", express.static(path.join(__dirname, "images")));

const pages = ["index.html", "login.html", "register.html", "dashboard.html", "booking.html", "bookings-success.html", "my-booking.html"];
app.get(["/", ...pages.map((page) => `/${page}`)], (req, res) => {
  const page = req.path === "/" ? "index.html" : path.basename(req.path);
  res.sendFile(path.join(__dirname, page));
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(port, () => console.log(`Elite Events is running at http://localhost:${port}`)))
  .catch((error) => {
    console.error("Could not connect to MongoDB:", error.message);
    process.exit(1);
  });