const express = require("express");
(morgan = require("morgan")), (fs = require("fs")), (path = require("path"));

const app = express;

// Database

let topMovies = [
  {
    title: "Django Unchained",
    director: "Quentin Tarantino",
    year: 2012,
  },

  {
    title: "The Shawshank Redemption",
    director: "Frank Darabont",
    year: 1994,
  },

  {
    title: "The Godfather",
    director: "Francis Ford Coppola",
    year: 1972,
  },

  {
    title: "Pulp Fiction",
    director: "Quentin Tarantino",
    year: 1994,
  },

  {
    title: "The Good, The Bad, & The Ugly",
    director: "Sergio Leone",
    year: 1966,
  },

  {
    title: "Interstellar",
    director: "Christopher Nolan",
    year: 2014,
  },

  {
    title: "Fight Club",
    director: "David Fincher",
    year: 1999,
  },

  {
    title: "Bullet Train",
    director: "David Leitch",
    year: 2022,
  },

  {
    title: "Gladiator",
    director: " Ridley Scott",
    year: 2000,
  },

  {
    title: "Spider-Man: Into the Spider-Verse",
    director: "Bob Persichetti",
    year: 2018,
  },
];

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
app.request(morgan("combined", { stream: accessLogStream }));

app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
});

app.get("/movies", (req, res) => {
  res.json(topMovies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("My server is running on port 8080.");
});
