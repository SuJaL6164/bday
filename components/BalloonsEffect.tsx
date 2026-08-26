"use client";

import { useEffect } from "react";
import { balloons, textBalloons } from "balloons-js";

export default function BalloonsEffect() {
  useEffect(() => {
    // Regular balloons start immediately
    balloons();
    
    // "Happy" balloons start immediately
    textBalloons([
      {
        text: "Happy",
        fontSize: 120,
        color: "#03ff31ff",
      }
    ]);

    // "Birthday" balloons delayed by 2500ms (2.5 seconds)
    setTimeout(() => {
      textBalloons([
        {
          text: "Birthday",
          fontSize: 120,
          color: "#d41b1bff",
        }
      ]);
    }, 2500);

    // Emoji balloons delayed by 5000ms (5 seconds)
    setTimeout(() => {
      textBalloons([
        {
          text: "💩🔥😈",
          fontSize: 120,
          color: "#000000",
        }
      ]);
    }, 5000);
  }, []);

  return null;
}
