const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Models = require("./models");
const passportJWT = require("passport-jwt");

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

// Set local Strategy.
passport.use(
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
    },
    async (username, password, callback) => {
      console.log(`${username} ${password}`);
      try {
        const user = await Users.findOne({ Username: username });

        if (!user) {
          console.log("incorrect username");
          return callback(null, false, {
            message: "Incorrect username or password.",
          });
        }

        console.log("finished");
        return callback(null, user);
      } catch (error) {
        console.error("Error in local strategy:", error);
        return callback(error);
      }
    }
  )
);

// Set JWT Strategy
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || "your_default_secret",
    },
    async (jwtPayload, callback) => {
      try {
        console.log("JWT Strategy started");
        console.log("JWT Payload:", jwtPayload);

        const user = await Users.findById(jwtPayload._id);

        if (!user) {
          return callback(null, false, { message: "User not found" });
        }

        return callback(null, user);
      } catch (error) {
        console.error("Error in JWT strategy:", error);
        return callback(error);
      }
    }
  )
);

module.exports = passport;

// 3.4.24
