export const Pi = {
  authenticate: (callbacks) => {
    console.log("Mock authenticate called");
    setTimeout(() => {
      callbacks.onReady({
        user: {
          username: "test_user",
        },
      });
    }, 1000);
  },
  // Add more mock methods later if needed
};