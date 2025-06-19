let Pi;
if (process.env.NODE_ENV === "development") {
  // Use mock SDK locally
  Pi = require("./mockPiSdk").Pi;
} else {
  // Use real Pi SDK when deployed
  Pi = window.Pi;
}
export default Pi;
