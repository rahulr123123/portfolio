require('dotenv').config();
const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const { verifyEmailConnection } = require("./config/email");
const contactRoutes = require("./routes/contact");

const app = express();

// Connect to MongoDB
connectDB();
verifyEmailConnection();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use('/api', contactRoutes);

// Routes for different pages (keeping for backward compatibility)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "home.html"));
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "home.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "home.html"));
});

app.get("/projects", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "home.html"));
});

app.get("/skills", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "home.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "home.html"));
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
