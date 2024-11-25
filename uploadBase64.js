const fs = require("fs");
const { MongoClient, ObjectId } = require("mongodb");

// MongoDB connection URI
const uri =
  "mongodb+srv://nicholaslamparelli98:Highland24@nicks-flix.tirur.mongodb.net/nicks-flix?retryWrites=true&w=majority";
const client = new MongoClient(uri);
// Array of movies with new poster files
const movies = [
  {
    id: "6594d9644f3b90ea2185ceba",
    imageFile: "./Posters/SilenceOfTheLambsPoster.jpg",
  },
  {
    id: "659603ab4f3b90ea2185cebf",
    imageFile: "./Posters/PulpFictionPoster.jpg",
  },
  {
    id: "65960b644f3b90ea2185cec4",
    imageFile: "./Posters/DjangoUnchainedPoster.jpg",
  },
  {
    id: "659603464f3b90ea2185cebd",
    imageFile: "./Posters/BulletTrainPoster.jpg",
  },
  {
    id: "65960a134f3b90ea2185cec2",
    imageFile: "./Posters/InterstellarPoster.jpg",
  },
  {
    id: "6594dc064f3b90ea2185cebb",
    imageFile: "./Posters/TheGoodTheBadTheUglyPoster.jpg",
  },
  {
    id: "6596037d4f3b90ea2185cebe",
    imageFile: "./Posters/GladiatorPoster.jpg",
  },
  {
    id: "65960a364f3b90ea2185cec3",
    imageFile: "./Posters/ShawshankRedemptionPoster.jpg",
  },
  {
    id: "659603014f3b90ea2185cebc",
    imageFile: "./Posters/FightClubPoster.jpg",
  },
  {
    id: "65960cf04f3b90ea2185cec5",
    imageFile: "./Posters/TheMartianPoster.jpg",
  },
];

async function uploadBase64() {
  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    const db = client.db("nicks-flix");
    const collection = db.collection("movies");

    for (const movie of movies) {
      console.log(`Processing movie ID: ${movie.id}`);

      // Check if the file exists
      if (!fs.existsSync(movie.imageFile)) {
        console.error(`File not found: ${movie.imageFile}`);
        continue;
      }

      // Read and encode the file as base64
      const base64Data = fs.readFileSync(movie.imageFile, {
        encoding: "base64",
      });

      // Update the ImagePath field in MongoDB
      const result = await collection.updateOne(
        { _id: new ObjectId(movie.id) },
        { $set: { ImagePath: `data:image/jpeg;base64,${base64Data}` } }
      );

      if (result.matchedCount === 0) {
        console.error(`No document found for movie ID: ${movie.id}`);
      } else {
        console.log(`Updated movie ID: ${movie.id}`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

uploadBase64();
