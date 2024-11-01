const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret"; // This has to be the same key used in the JWTStrategy

const jwt = require("jsonwebtoken"),
  passport = require("passport");

require("../passport"); // Your local passport file

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.userName, // updated field
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

/* POST login. */
module.exports = (app) => {
  // Change from 'router' to 'app'
  app.post("/login", (req, res) => {
    // Use 'app' instead of 'router'
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: "Something is not right",
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
