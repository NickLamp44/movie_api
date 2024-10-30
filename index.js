const express = require("express");
const app = express();
const bodyParser = require("body-parser");
uuid = require("uuid");
const mongoose = require("mongoose");
const Models = require("./models");
const Movies = Models.Movie;
const Users = Models.User;

const { check, validationResult } = require("express-validator");

// mongoose.connect("mongodb://localhost:27017/cfDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// Database Connection
console.log("Attempting to connect to MongoDB...");

mongoose
  .connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected successfully"))
  .catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1); // Exit with failure code if DB connection fails
  });

// Middleware for parsing requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CORS Middleware
const cors = require("cors");
let allowedOrigins = ["http://localhost:8080"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

// Logging Environment Variables for Debugging
console.log("Environment Variables:");
console.log("CONNECTION_URI:", process.env.CONNECTION_URI);
console.log("PORT:", process.env.PORT);

// Import Authentication and Passport Setup
let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

// Routes and Controllers

// CREATE
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non-alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    console.log("Request Body:", req.body);

    await Users.findOne({ userName: req.body.userName })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.userName + " already exists");
        } else {
          Users.create({
            userName: req.body.userName,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error("Error creating user:", error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error("Error finding user:", error);
        res.status(500).send("Error: " + error);
      });
  }
);

// READ

app.get("/", (req, res) => {
  res.send("Welcome to Nicks top 10 Movies!");
});

// More routes...

// Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on Port ${port} - Noice :)`);
});
