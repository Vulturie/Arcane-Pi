import React, { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";

function PiLoginButton() {
  const { user, setUser, setAccessToken } = useContext(UserContext);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!window.Pi) {
      console.log("Pi SDK not available");
      setError("Pi SDK not found");
      return;
    }
    try {
      const result = await window.Pi.authenticate(["username"]);
      console.log("Pi authentication result", result);
      if (result && result.user) {
        setUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (err) {
      console.log("Pi authentication failed", err);
      setError("Login failed");
    }
  };

  if (user) {
    return <div>Logged in as {user.username}</div>;
  }

  return (
    <div>
      <button onClick={handleLogin}>Login with Pi</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

export default PiLoginButton;
