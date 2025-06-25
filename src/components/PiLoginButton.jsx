import React, { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import Pi from "../piSdk";
import { API_BASE_URL } from "../config";

function PiLoginButton() {
  const { user, setUser, setAccessToken } = useContext(UserContext);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!Pi || !Pi.authenticate) {
      setError("Pi SDK not found");
      return;
    }
    try {
      const result = await Pi.authenticate(["username", "payments"], () => {});
      if (result && result.user) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        await fetch(`${API_BASE_URL}/auth/pi-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: result.accessToken }),
        });
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
