let Pi;
if (process.env.NODE_ENV !== "production") {
  // Use mock SDK for development and testing
  Pi = require("./mockPiSdk").Pi;
} else {
  // Use real Pi SDK when deployed
  Pi = window.Pi;
}
export default Pi;
