import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

const DATABASE_URL = process.env.MONGO_DB_CLUSTER_URL;
import mongoose from "mongoose";
console.log("database url", DATABASE_URL);
const connectDB = async () => {
  try {
    const client = await mongoose.connect(DATABASE_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("Connection to DB was successful");
    return client;
  } catch (error) {
    // handleError(error);
    console.error("Connection to DB failed", error);
  }
};

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection failed"));

export default connectDB;
