const express = require("express");
const app = express();
const bodyParser = require("body-parser");
uuid = require("uuid");
const mongoose = require("mongoose");
const Models = require("./models");
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://localhost:8080/myFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware for parsing requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CREATE
app.post("/users", async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
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
});

// READ

app.get("/", (req, res) => {
  res.send("Welcome to Nicks top 10 Movies!");
});

// Get all Users
app.get("/users", async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get a user by Username
app.get("/users/:Username", async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get all Movies
app.get("/movies", async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get a specific Movies
app.get("/movies/:title", async (req, res) => {
  await Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error.apply(err);
      res.status(500).send("Error: " + err);
    });
});

// Get movies with a specific genre
app.get("/movies/genres/:genreName", async (req, res) => {
  await Movies.findOne({ "Genre.Name": req.params.genreName })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get a movie with a specific director
app.get("/movies/directors/:directorName", async (req, res) => {
  await Movies.findOne({ "Director.Name": req.params.directorName })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get Documentation page
app.get("/documentation", (req, res) => {
  res.sendFile("public/documentatio.html", { root: __dirname });
});

// UPDATE
// Updates Users Info
app.put("/users/:Username", async (req, res) => {
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
});

// Adds a movie to a users lists of fav movies
app.post("/users/:Username/movies/:MovieID", async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    { $push: { FavoriteMovies: req.params.MovieID } },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((Err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// DELETE
// Delete User by Username
app.delete("/users/:Username", (req, res) => {
  Users.findOneAndRemove({ Username: req.params.userName })
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
});

// Delete User favorite movie
app.delete("/users/:id/:movieTitle", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.userName },
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
});

// Listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
