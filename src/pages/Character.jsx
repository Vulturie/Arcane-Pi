import React from "react";

function Character({ player }) {
  return (
    <div>
      <h2>Character Info</h2>
      <p>Name: {player.username}</p>
      <p>Class: {player.class}</p>
      <p>Level: {player.level}</p>
    </div>
  );
}

export default Character;