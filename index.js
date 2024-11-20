require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const { check, validationResult } = require("express-validator");

const Models = require("./models");
const auth = require("./middleware/auth");
require("./passport");

const app = express();

// Environment Variables
const CONNECTION_URI = process.env.CONNECTION_URI;
const PORT = process.env.PORT || 8080;

// Logging Environment Variables for Debugging
console.log("Environment Variables:");
console.log("CONNECTION_URI:", CONNECTION_URI);
console.log("PORT:", PORT);

// MongoDB Connection
console.log("Attempting to connect to MongoDB...");
mongoose
  .connect(CONNECTION_URI)
  .then(() => console.log("Database connected successfully"))
  .catch((error) => {
    console.error("Database connection error:", error.message || error);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CORS Configuration
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:1234",
  "https://nicks-myflix.netlify.app",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(
          new Error(`CORS policy does not allow access from origin ${origin}`),
          false
        );
      }
    },
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Authentication
auth(app);

// Routes
app.get("/", (req, res) => res.send("Welcome to Nicks top 10 Movies!"));

// Users Endpoints
const Users = Models.User;

// app.post(
//   "/users",
//   [
//     check("username", "Username is required").isLength({ min: 5 }),
//     check("username", "Username must be alphanumeric").isAlphanumeric(),
//     check("Password", "Password is required").not().isEmpty(),
//     check("Email", "Invalid email format").isEmail(),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(422).json({ errors: errors.array() });
//     }

//     try {
//       const { username, Password, Email, Birthday } = req.body;
//       const existingUser = await Users.findOne({ username });

//       if (existingUser) {
//         return res.status(400).send(`${username} already exists`);
//       }

//       const hashedPassword = Users.hashPassword(Password);
//       const newUser = await Users.create({
//         username,
//         Password: hashedPassword,
//         Email,
//         Birthday,
//       });

//       res.status(201).json(newUser);
//     } catch (error) {
//       console.error("Error creating user:", error);
//       res.status(500).send("Error: " + error.message);
//     }
//   }
// );

// app.post("/users", async (req, res) => {
//   const { username, password, email, birthday } = req.body;

//   try {
//     const hashedPassword = Users.hashPassword(password);
//     const newUser = new Users({
//       username,
//       password: hashedPassword,
//       email,
//       birthday,
//     });
//     const savedUser = await newUser.save();

//     res.status(201).json(savedUser);
//   } catch (error) {
//     console.error("Error creating user:", error);
//     res.status(500).send("Internal server error");
//   }
// });

app.post("/users", async (req, res) => {
  console.log("Incoming request body:", req.body); // Log incoming request

  const { username, password, Email, Birthday } = req.body;

  // Validate all required fields
  if (!username || !password || !Email || !Birthday) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const hashedPassword = Users.hashPassword(password); // Hash the password
    const newUser = new Users({
      username,
      password: hashedPassword, // Use 'password' here
      Email,
      birthday: Birthday, // Match the schema field name
    });

    const savedUser = await newUser.save();
    return res.status(201).json(savedUser); // Return the created user
  } catch (error) {
    console.error("Error creating user:", error); // Log the error
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const users = await Users.find();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).send("Error: " + error.message);
    }
  }
);

app.get(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = await Users.findOne({ username: req.params.username });
      if (!user) return res.status(404).send("User not found");
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).send("Error: " + error.message);
    }
  }
);

app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { username: req.params.username },
        { $set: req.body },
        { new: true }
      );
      if (!updatedUser) return res.status(404).send("User not found");
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).send("Error: " + error.message);
    }
  }
);

app.delete(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const deletedUser = await Users.findOneAndDelete({
        username: req.params.username,
      });
      if (!deletedUser) return res.status(404).send("User not found");
      res.status(200).send(`${req.params.username} was deleted`);
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).send("Error: " + error.message);
    }
  }
);

// Movies Endpoints
const Movies = Models.Movie;

app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movies = await Movies.find();
      res.status(200).json(movies);
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).send("Error: " + error.message);
    }
  }
);

app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movie = await Movies.findOne({ Title: req.params.Title });
      if (!movie) return res.status(404).send("Movie not found");
      res.json(movie);
    } catch (error) {
      console.error("Error fetching movie:", error);
      res.status(500).send("Error: " + error.message);
    }
  }
);

app.get(
  "/movies/genres/:genreName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movies = await Movies.find({ "Genre.Name": req.params.genreName });
      res.json(movies);
    } catch (error) {
      console.error("Error fetching genre:", error);
      res.status(500).send("Error: " + error.message);
    }
  }
);

app.get(
  "/movies/directors/:directorName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movies = await Movies.find({
        "Director.Name": req.params.directorName,
      });
      res.json(movies);
    } catch (error) {
      console.error("Error fetching director:", error);
      res.status(500).send("Error: " + error.message);
    }
  }
);

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on Port ${PORT} - Noice :)`);
});
