const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt");

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      usernameField: "username", // This must match the client payload
      passwordField: "password",
    },
    async (username, password, done) => {
      console.log("Authenticating user:", username); // Log the username

      try {
        // Match the database field name exactly (case-sensitive)
        const user = await Users.findOne({ username: username }); // Use 'Username' here
        if (!user) {
          console.log("User not found in database for username:", username);
          return done(null, false, { message: "Incorrect username" });
        }

        console.log("User found in database:", user);

        const isValid = user.validatePassword(password);
        if (!isValid) {
          console.log("Password validation failed for user:", username);
          return done(null, false, { message: "Incorrect password" });
        }

        console.log("User authenticated successfully:", username);
        return done(null, user);
      } catch (error) {
        console.error("Error during authentication:", error);
        return done(error);
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "your_jwt_secret",
    },
    async (jwtPayload, callback) => {
      return await Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
