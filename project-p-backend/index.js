require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const playerRoutes = require("./routes/playerRoutes");
const characterRoutes = require("./routes/characterRoutes");
const itemRoutes = require("./routes/itemRoutes");
const arenaRoutes = require("./routes/arenaRoutes");
const devStatsRoutes = require("./routes/devStats");
const logRoutes = require("./routes/logRoutes");

const app = express();
const allowedOrigins = [
  "https://arcanepi.com",
  "http://localhost:3000"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("API is running!");
});

const PORT = process.env.PORT || 4000;
app.use("/player", playerRoutes);
app.use("/api", characterRoutes);
app.use("/items", itemRoutes);
app.use("/arena", arenaRoutes);
app.use("/dev", devStatsRoutes);
app.use("/api", logRoutes);
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
