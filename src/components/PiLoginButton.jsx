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
    <div className="flex flex-col items-center">
      <img
        src="/assets/loading/sign_in_button.png"
        alt="Login with Pi"
        className="w-[80%] max-w-[300px] cursor-pointer"
        onClick={handleLogin}
      />
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
}

export default PiLoginButton;
