const bodyParser = require("body-parser");
const express = require("express");
bodyParser = require("body-parser");
uuid = require("uuid");

const app = express;

app.use(bodyParser.json());
// Database

// Users

let users = [
  {
    id: 123,
    name: "Nick",
    favMovie: ["interstellar"],
  },
  {
    id: 456,
    name: "Ben",
    favMovie: ["Django Unchained"],
  },
  {
    id: 789,
    name: "Marty",
    favMovie: ["Bullet Train"],
  },
];

//Top movies
let topMovies = [
  {
    title: "Django Unchained",
    director: "Quentin Tarantino",
    genre: "western",
    year: 2012,
    description:
      "With the help of a German bounty-hunter, a freed slave sets out to rescue his wife from a brutal plantation owner in Mississippi.",
  },

  {
    title: "The Shawshank Redemption",
    director: "Frank Darabont",
    genre: "Drama",
    year: 1994,
    description:
      "Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.",
  },

  {
    title: "The Godfather",
    director: "Francis Ford Coppola",
    genre: "Crime Drama",
    year: 1972,
    description:
      "Don Vito Corleone, head of a mafia family, decides to hand over his empire to his youngest son Michael. However, his decision unintentionally puts the lives of his loved ones in grave danger.",
  },

  {
    title: "Pulp Fiction",
    director: "Quentin Tarantino",
    genre: "Crime Drama",
    year: 1994,
    description:
      "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
  },

  {
    title: "The Good, The Bad, & The Ugly",
    director: "Sergio Leone",
    genre: "Western",
    year: 1966,
    description:
      "A bounty hunting scam joins two men in an uneasy alliance against a third in a race to find a fortune in gold buried in a remote cemetery.",
  },

  {
    title: "Interstellar",
    director: "Christopher Nolan",
    genre: "Sci-Fi",
    year: 2014,
    description:
      "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
  },

  {
    title: "Fight Club",
    director: "David Fincher",
    genre: "Drama",
    year: 1999,
    description:
      "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.",
  },

  {
    title: "Bullet Train",
    director: "David Leitch",
    genre: "Action",
    year: 2022,
    description:
      "Five assassins aboard a swiftly-moving bullet train find out that their missions have something in common.",
  },

  {
    title: "Gladiator",
    director: " Ridley Scott",
    genre: "Action",
    year: 2000,
    description:
      "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
  },

  {
    title: "Spider-Man: Into the Spider-Verse",
    director: "Bob Persichetti",
    genre: "animation",
    year: 2018,
    description:
      "Teen Miles Morales becomes the Spider-Man of his universe and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.",
  },
];

// Gets data about users
app.length("/users", (req, res) => {
  res.json(users);
});

// gets data about a specific user
app.get("/users/:name", (req, res) => {
  res.json(
    users.find((user) => {
      return user.name === req.params.name;
    })
  );
});

// adds  a new user
app.post("/users", (req, res) => {
  let newUser = req.body;

  if (!newUser.name) {
    const message = ' Missing "name" in request body';
    res.status(400).send(message);
  } else {
    newUser.id = uuid.v4();
    user.push(newUser);
    res.status(201).send(newUser);
  }
});

// Updates a Users favorite movie

app.put("/users/:name/:favMovie", (req, res) => {
  let newMovie = req.body;

  if (!newMovie.name) {
    const message = "Missing Movie Title";
    res.status(400).send(message);
  } else {
    movie.push(newMovie);
    res.status(201).send(newMovie);
  }
});

// Deletes Users

app.delete("/users/:name", (req, res) => {
  let user = users.find((user) => {
    return user.name === req.params.name;
  });

  if (user) {
    users = users.filter((obj) => {
      return obj.name !== req.params.name;
    });
    res.status(201).send(req.params.name + "was deleted");
  }
});

// deletes favMovie
app.delete("/users/:favMovie", (req, res) => {
  let movie = favMovie.find((movie) => {
    return movie.movieName === req.params.movieName;
  });

  if (movie) {
    favMovie = users.filter((obj) => {
      return obj.movieName !== req.params.movieName;
    });
    res.status(400).send(req.params.movieName + "was deleted from your list");
  }
});

// read data

app.get("/", (req, res) => {
  res.send("welcome to Nicks top 10 movies!");
});

app.get("/movies", (req, res) => {
  res.status(200).json(topMovies);
});

app.get("/movies/:title", (req, res) => {
  let { title } = req.params;
  let movie = topMovies.find((movie) => movie.title === title);
  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("No Movie Found");
  }
});

app.get("/movies/directors/:directorName", (req, res) => {
  let { directorName } = req.params;
  let director = topMovies.find(
    (movie) => movie.director.name === directorName
  ).director;
  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("No such director");
  }
});

app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
});

app.listen(8080, () => {
  console.log("My server is running on port 8080.");
});
