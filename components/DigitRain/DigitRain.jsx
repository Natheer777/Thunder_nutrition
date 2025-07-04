import React, { useEffect, useRef } from "react";
import "./DigitRain.css"; // سننشئ ملف CSS خارجي

const DigitRain = () => {
  const containerRef = useRef(null);
  const digits = " ⚡︎ ";

  useEffect(() => {
    const container = containerRef.current;

    const createDigit = () => {
      const digit = document.createElement("div");
      digit.classList.add("digit");
      digit.innerText = digits[Math.floor(Math.random() * digits.length)];
      digit.style.left = Math.random() * window.innerWidth + "px";
      digit.style.animationDuration = 2 + Math.random() * 2 + "s";
      digit.style.fontSize = 20 + Math.random() * 25 + "px";
      container.appendChild(digit);

      // Remove after animation ends
      setTimeout(() => {
        container.removeChild(digit);
      }, 6000);
    };

    const interval = setInterval(() => {
      for (let i = 0; i < 3; i++) {
        createDigit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div className="digit-container" ref={containerRef}></div>;
};

export default DigitRain;
