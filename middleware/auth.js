const jwt = require("jsonwebtoken");
const passport = require("passport");

// Load your local passport configuration
require("../passport");

// Use the JWT secret from environment variables or a default value
const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";

// Function to generate a JWT token for a user
const generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username, // Use the username as the subject
    expiresIn: "7d", // Token validity duration
    algorithm: "HS256", // Signing algorithm
  });
};

// Function to configure the /login route
module.exports = (app) => {
  app.post("/login", (req, res) => {
    console.log("Incoming login request body:", req.body);

    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error || !user) {
        console.log(
          "Authentication error or invalid credentials:",
          error || info
        );
        return res.status(400).json({
          message: "Invalid username or password",
        });
      }

      req.login(user, { session: false }, (error) => {
        if (error) {
          console.log("Login error:", error);
          return res.status(500).send(error);
        }

        const token = generateJWTToken(user.toJSON());
        console.log("Login successful:", user.username);
        return res.json({ user, token });
      });
    })(req, res);
  });
};
