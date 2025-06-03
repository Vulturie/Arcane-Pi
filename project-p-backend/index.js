const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const playerRoutes = require("./routes/playerRoutes");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = "mongodb+srv://acslevente01:9TKoStJ69TPnB2BK@projectpi.wro1znu.mongodb.net/?retryWrites=true&w=majority&appName=ProjectPi";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("API is running!");
});

const PORT = process.env.PORT || 4000;
app.use("/player", playerRoutes);
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});