const express = require("express");
const app = express();
const bodyParser = require("body-parser");
uuid = require("uuid");
const mongoose = require("mongoose");
const Models = require("./models");
const Movies = Models.Movie;
const Users = Models.User;

const { check, validationResult } = require("express-validator");

mongoose.connect("mongodb://localhost:27017/cfDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware for parsing requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware for CORS
const cors = require("cors");
app.use(cors());

let allowedOrigins = ["http://localhost:8080"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

let auth = require("./auth")(app);

const passport = require("passport");
require("./passport");

// CREATE
app.post(
  "/users",
  // Validation logic here for request
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],

  // Once validation is done, continue to the next function
  async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    // Hash the password
    let hashedPassword = Users.hashPassword(req.body.Password);
    console.log("Request Body:", req.body); // Log request body to verify fields

    // Check if user already exists
    await Users.findOne({ userName: req.body.userName })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.userName + " already exists");
        }
        // If user does not exist, create new user
        else {
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
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// READ

app.get("/", (req, res) => {
  res.send("Welcome to Nicks top 10 Movies!");
});

// Get all Users
app.get(
  "/Users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get a user by Username
app.get(
  "/Users/:userName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ userName: req.params.userName }) // updated field
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get all Movies
app.get(
  "/Movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get a specific Movies
app.get(
  "/Movies/:Title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error.apply(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get movies with a specific genre
app.get(
  "/Movies/Genres/:genreName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ "Genre.Name": req.params.genreName })
      .then((movies) => {
        res.json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get a movie with a specific director
app.get(
  "/Movies/Directors/:directorName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ "Director.Name": req.params.directorName })
      .then((movies) => {
        res.json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get Documentation page
app.get("/Documentation", (req, res) => {
  res.sendFile("public/documentatio.html", { root: __dirname });
});

// UPDATE *
// Updates Users Info
app.put(
  "/Users/:userName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { userName: req.params.userName }, // updated field
      {
        $set: {
          userName: req.body.userName,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Adds a movie to a users lists of fav movies
app.post(
  "/Users/:userName/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { userName: req.params.userName }, // updated field
      { $push: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// DELETE

// Delete a movie from a users list of fav movies
app.delete(
  "/Users/:userName/:movieTitle",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    Users.findOneAndUpdate(
      { userName: req.params.userName }, // updated field
      { $pull: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          return res.status(404).send("Error: User doesn’t exist");
        } else {
          res.json(updatedUser);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Delete User by Username
app.delete(
  "/Users/:userName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    Users.findOneAndDelete({ userName: req.params.userName }) // updated field
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.userName + " was not found");
        } else {
          res.status(200).send(req.params.userName + " was deleted");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port + " Noice :)");
});
