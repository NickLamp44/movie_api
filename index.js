const express = require("express"),
  { check, validateResult } = require("express-validator"),
  uuid = require("uuid"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  models = require("./models.js"),
  morgan = require("morgan");

// Middleware for parsing requests
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Movies = models.Movie;
const Users = models.User;

// Local DB
// mongoose.connect("mongodb://localhost:27017/cfDB", {
//   // useNewUrlParser: true,
//   // useUnifiedTopology: true,
// });

mongoose.connect(
  "mongodb+srv://Nicklamp44:Boston21@cluster0.6svpe0l.mongodb.net/cfDB",
  {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  }
);

// // Online DB
// mongoose.connect(process.env.CONNECTION_Test_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

const cors = require("cors");

let allowedOrigins = [
  "http://localhost:8080",
  "https://nicks-flix-a331980685c2.herokuapp.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // if origin isnt allowed
        let message =
          "The CORS policy for this application doesnt allow access from origin" +
          origin;
        return callback(new Error(message), false);
      }
    },
  })
);

app.use(cors());

// Middleware
let auth = require("./Auth.js")(app);
const passport = require("passport");
require("./passport");
app.use(passport.initialize());
app.use(morgan("common"));
app.use(bodyParser.json());

const { validate } = require("uuid");

// READ

app.get("/", (req, res) => {
  res.send("Welcome to Nicks top 10 Movies!");
});

// serve the documentation.html"
app.use(express.static("public"));

// CREATE
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    // Validate Object for any errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.arry() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + "already exists");
        } else {
          Users.create({
            Username: req.body.Username,
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

// Get all Users
app.get(
  "/users",
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
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
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
  "/movies",
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
  "/movies/:Title",
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
  "/movies/genres/:genreName",
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
  "/movies/directors/:directorName",
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
app.get("/documentation", (req, res) => {
  res.sendFile("public/documentatio.html", { root: __dirname });
});

// UPDATE *
// Updates Users Info
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
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
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
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
// Delete User by Username
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    Users.findOneAndDelete({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Delete User favorite movie
app.delete(
  "/users/:id/:movieTitle",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          return res.status(404).send("Error: User doesnt exist");
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

// Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port + "! :)");
});

mongoose.connection.on(
  "error",
  console.error.bind(console, "MongoDB connection error:")
);

//helpdesk
// https://help.heroku.com/sharing/a146edf5-0337-4e20-99da-5ca110a38a71
