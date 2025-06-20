export const Pi = {
  /**
   * Mock authenticate method that mimics the behaviour of the real Pi SDK.
   * Returns a Promise resolving to a simple user object.
   */
  authenticate: (_args) => {
    console.log("Mock authenticate called");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: { username: "test_user" },
        });
      }, 1000);
    });
  },
  /**
   * Placeholder init method so calls to Pi.init don't fail during development.
   */
  init: (config) => {
    console.log("Mock Pi init", config);
  },
  // Add more mock methods later if needed
};
