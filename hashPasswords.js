const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Models = require("./models");

const Users = Models.User;

mongoose
  .connect(
    "mongodb+srv://nicholaslamparelli98:Highland24@nicks-flix.tirur.mongodb.net/nicks-flix",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(async () => {
    console.log("Connected to database!");

    const users = await Users.find({});
    for (const user of users) {
      // Handle inconsistent casing for the username field
      const username = user.username || user.userName || "undefined";

      // Skip users with undefined usernames
      if (username === "undefined") {
        console.warn(`User with ID ${user._id} has no username! Skipping...`);
        continue;
      }

      // Skip users without a password
      if (!user.password) {
        console.warn(`User ${username} has no password! Skipping...`);
        continue;
      }

      // Check if the password is already hashed
      if (!bcrypt.getRounds(user.password)) {
        console.log(`Hashing password for user: ${username}`);
        user.password = bcrypt.hashSync(user.password, 10); // Hash the plaintext password
        await user.save(); // Save the updated user record
      } else {
        console.log(`Password already hashed for user: ${username}`);
      }
    }

    console.log("All passwords processed successfully!");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });
