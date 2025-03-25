const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
// require("dotenv").config(); // Load environment variables

const app = express();
const User = require("./models/User.js");
const connectDB = require("./db/db.config.js");

// Middleware
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Connect to MongoDB

connectDB();

// Home Page
app.get("/", async (req, res) => {
  try {
    fs.readdir("./files", (err, files) => {
      if (err) return res.status(500).send("Error reading files");
      res.render("index", { files });
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Edit File
app.get("/edit/:filename", (req, res) => {
  const fileName = req.params.filename;
  fs.readFile(`./files/${fileName}`, "utf-8", (err, data) => {
    if (err) return res.status(500).send("Error reading file");
    res.render("edit", { fileName, data });
  });
});

// Delete File
app.get("/delete/:filename", (req, res) => {
  const fileName = req.params.filename;
  fs.unlink(`./files/${fileName}`, (err) => {
    if (err) return res.status(500).send("Error deleting file");
    res.redirect("/");
  });
});

// Update File
app.post("/update/:filename", (req, res) => {
  const oldFileName = req.params.filename;
  const newFileName = req.body.newFileName;
  const fileData = req.body.fileData;

  fs.writeFile(`./files/${oldFileName}`, fileData, (err) => {
    if (err) return res.status(500).send("Error updating file");

    fs.rename(`./files/${oldFileName}`, `./files/${newFileName}`, (err) => {
      if (err) return res.status(500).send("Error renaming file");
      res.redirect("/");
    });
  });
});

// **Signup Route**
app.post("/create", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, username });

    await newUser.save();
    // res.status(201).json({ message: "User created successfully" });
    res.redirect("/login");
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// **Login Route**
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, { httpOnly: true });
    res.json({ message: "Login successful", token });
    res.redirect("/");

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// **Create Hisab File**
app.post("/createHisab", (req, res) => {
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`;
  
  fs.writeFile(`./files/${formattedDate}.txt`, req.body.hisaab, (err) => {
    if (err) return res.status(500).send("Error creating file");
    res.redirect("/");
  });
});

// **Signup Page**
app.get("/signup", (req, res) => {
  res.render("signup");
});
app.get("/login", (req, res) => {
  res.render("login");
});

// **Start Server**
const PORT =  3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));