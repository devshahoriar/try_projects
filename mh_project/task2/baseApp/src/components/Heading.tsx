import React from "react";

const titles = ["Quick", "Fast", "Speedy"];

export default function Heading() {
  return (
    <h1>
      {titles?.[Math.floor(Math.random() * titles.length)]} delivery service in
      dhaka.
    </h1>
  );
}
