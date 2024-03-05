const express = require("express");
mongoose = require("mongoose");
Models = require("./models");
const app = express();

app.use(express.static("public"));
app.use(morgan("common"));

let auth = require("./Auth")(app);

const passport = require("passport");
require("./passport");

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://localhost:27017/cfDB", {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

// // Middleware for parsing requests
// app.use(express.json()); // for parsing application/json
// app.use(express.urlencoded({ extended: true }));

// CREATE
app.post("/Users", async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.body.Username });

    if (user) {
      return res.status(400).send(req.body.Username + " already exists");
    }

    const newUser = await Users.create({
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday,
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err);
  }
});

// READ

app.get("/", (req, res) => {
  res.send("Welcome to Nicks top 10 Movies!");
});

// Get all Users
app.get(
  "/Users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const users = await Users.find();
      res.status(201).json(users);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

// Get a user by Username
app.get("/Users/:Username", async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.params.Username });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err);
  }
});

// Get all Movies
app.get("/Movies", async (req, res) => {
  try {
    const movies = await Movies.find();
    res.status(201).json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err);
  }
});

// Get a specific Movie
app.get("/Movies/:Title", async (req, res) => {
  try {
    const movie = await Movies.findOne({ Title: req.params.Title });
    res.json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err);
  }
});

// Get movies with a specific genre
app.get("/Movies/Genres/:genreName", async (req, res) => {
  try {
    const movies = await Movies.findOne({ "Genre.Name": req.params.genreName });
    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err);
  }
});

// Get a movie with a specific director
app.get("/Movies/Directors/:directorName", async (req, res) => {
  try {
    const movies = await Movies.findOne({
      "Director.Name": req.params.directorName,
    });
    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err);
  }
});

// Get Documentation page
app.get("/Documentation", (req, res) => {
  res.sendFile("public/documentatio.html", { root: __dirname });
});

// UPDATE
// Updates Users Info
app.put("/Users/:Username", async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
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
    );

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err);
  }
});

// Adds a movie to a user's list of fav movies
app.post("/Users/:Username/movies/:MovieID", async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $push: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err);
  }
});

// DELETE
// Delete User by Username
app.delete("/Users/:Username", async (req, res) => {
  try {
    const user = await Users.findOneAndRemove({
      Username: req.params.Username,
    });

    if (!user) {
      res.status(400).send(req.params.Username + " was not found");
    } else {
      res.status(200).send(req.params.Username + " was deleted");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err);
  }
});

// Delete User favorite movie
app.delete("/Users/:id/:movieTitle", async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("Error: User doesn't exist");
    } else {
      res.json(updatedUser);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err);
  }
});

// Listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080 :) LFGGG!!!");
});

// 3.4.24
