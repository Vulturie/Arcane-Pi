require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const playerRoutes = require("./routes/playerRoutes");
const characterRoutes = require("./routes/characterRoutes");
const itemRoutes = require("./routes/itemRoutes");
const arenaRoutes = require("./routes/arenaRoutes");
const devStatsRoutes = require("./routes/devStats");
const logRoutes = require("./routes/logRoutes");
const piPriceRoutes = require("./routes/piPriceRoutes");
const piPaymentRoutes = require("./routes/piPaymentRoutes");
const authRoutes = require("./routes/authRoutes");
const PiPrice = require("./models/PiPrice");
const { fetchPiPriceUSD } = require("./services/piPriceService");

const app = express();
const allowedOrigins = [
  "https://arcanepi.com",
  "https://arcane-pi.onrender.com",
  "http://localhost:3000",
  "http://localhost:4000"
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
app.use("/auth", authRoutes);
app.use("/player", playerRoutes);
app.use("/api", characterRoutes);
app.use("/items", itemRoutes);
app.use("/arena", arenaRoutes);
app.use("/dev", devStatsRoutes);
app.use("/api", logRoutes);
app.use("/api", piPriceRoutes);
app.use("/api/pi", piPaymentRoutes);

async function updatePiPrice() {
  try {
    const priceUSD = await fetchPiPriceUSD();

    if (priceUSD) {
      await PiPrice.findOneAndUpdate(
        {},
        { priceUSD, fetchedAt: new Date() },
        { upsert: true }
      );
      console.log(`Updated Pi price: ${priceUSD}`);
    } else {
      console.warn('No PI price returned from CoinGecko');
    }
  } catch (err) {
    console.error('Failed to fetch Pi price', err);
  }
}

cron.schedule("*/15 * * * *", updatePiPrice);
updatePiPrice();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
